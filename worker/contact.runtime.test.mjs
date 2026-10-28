import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { createFetchMock, Miniflare } from 'miniflare';

const source = await readFile(new URL('./contact.ts', import.meta.url), 'utf8');
const schema = (await Promise.all(['0001_contact.sql','0002_recipient_deliveries.sql'].map((name) =>
  readFile(new URL('../migrations/contact/'+name, import.meta.url), 'utf8')))).join('\n');
async function setup(t, emailReply = { success: true, result: { delivered: ['owner@example.com'] } }, emailStatus = 200) {
  const fetchMock = createFetchMock();
  fetchMock.disableNetConnect();
  fetchMock.get('https://challenges.cloudflare.com')
    .intercept({ method: 'POST', path: '/turnstile/v0/siteverify' })
    .reply(200, { success: true, hostname: 'zajickuv-med.cz', action: 'contact' }, { headers: { 'content-type': 'application/json' } }).persist();
  fetchMock.get('https://api.cloudflare.com')
    .intercept({ method: 'POST', path: `/client/v4/accounts/${'a'.repeat(32)}/email/sending/send` })
    .reply(emailStatus, emailReply, { headers: { 'content-type': 'application/json' } }).persist();
  const runtime = new Miniflare({
    modules: true, compatibilityDate: '2026-07-21',
    script: `${stripTypeScriptTypes(source)}\nexport default { fetch: handleContact };`,
    d1Databases: ['CONTACT_DB'],
    bindings: {
      CONTACT_ALLOWED_HOSTNAMES: 'zajickuv-med.cz', TURNSTILE_SECRET_KEY: 'mock-secret',
      CONTACT_HASH_SECRET: 'runtime-test-hash-secret-with-at-least-32-characters',
      CF_ACCOUNT_ID: 'a'.repeat(32), CF_EMAIL_API_TOKEN: 'mock-token',
      CONTACT_TO_EMAIL: 'owner@example.com', CONTACT_FROM_EMAIL: 'info@zajickuv-med.cz',
    }, fetchMock,
  });
  t.after(async () => { await runtime.dispose(); await fetchMock.close(); });
  const db = await runtime.getD1Database('CONTACT_DB');
  await db.batch(schema.split(';').filter((sql) => sql.trim()).map((sql) => db.prepare(sql)));
  const data = () => ({ name: 'Runtime test', email: 'test@example.com', product: 'Květový med',
    message: 'Mock submission, no real email.', submissionId: crypto.randomUUID(), turnstileToken: crypto.randomUUID() });
  const submit = (body = data(), ip = '192.0.2.1') => runtime.dispatchFetch('https://zajickuv-med.cz/api/contact', {
    method: 'POST', headers: { origin: 'https://zajickuv-med.cz', 'content-type': 'application/json', 'cf-connecting-ip': ip },
    body: JSON.stringify(body),
  });
  return { runtime, db, data, submit };
}

test('Workers runtime: concurrent identical messages produce one durable record and one send claim', async (t) => {
  const { db, submit } = await setup(t);
  const responses = await Promise.all(Array.from({ length: 3 }, () => submit()));
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 200, 202]);
  for (const response of responses) assert.equal((await response.json()).accepted, true);
  const rows = await db.prepare('SELECT * FROM contact_messages').all();
  assert.equal(rows.results.length, 1);
  assert.equal(rows.results[0].attempts, 1);
  assert.equal(rows.results[0].delivery_status, 'sent');
});

test('Workers runtime: concurrent requests share the rolling D1 rate limit', async (t) => {
  const { db, data, submit } = await setup(t);
  const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => submit({ ...data(), message: `Different message ${i}` })));
  assert.equal(responses.filter((r) => r.status === 202).length, 3);
  assert.equal(responses.filter((r) => r.status === 429).length, 5);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM contact_attempts').first()).n, 3);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM contact_messages').first()).n, 3);
});

test('Workers runtime: a rejected email remains pending, provider redirects stay uncertain', async (t) => {
  for (const status of [403, 302]) {
    await t.test(`HTTP ${status}`, async (st) => {
      const { db, submit } = await setup(st, { success: false }, status);
      const response = await submit();
      assert.equal(response.status, 202);
      assert.equal((await db.prepare('SELECT delivery_status FROM contact_messages').first()).delivery_status, status === 403 ? 'pending' : 'uncertain');
    });
  }
});
