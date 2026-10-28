import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { cleanupContact, handleContact, handleContactConfig, sendStoredMessage, retryPendingMessages } from './contact.ts';

const schema = ['0001_contact.sql','0002_recipient_deliveries.sql'].map((name) =>
  readFileSync(new URL('../migrations/contact/'+name, import.meta.url), 'utf8')).join('\n');
const base = {
  CONTACT_ALLOWED_HOSTNAMES: 'zajickuv-med.cz,www.zajickuv-med.cz',
  TURNSTILE_SITE_KEY: 'test-site-key', TURNSTILE_SECRET_KEY: 'test-secret',
  CONTACT_HASH_SECRET: 'test-hash-secret-at-least-thirty-two-characters',
  CF_ACCOUNT_ID: 'a'.repeat(32), CF_EMAIL_API_TOKEN: 'mock-token-not-real',
  CONTACT_TO_EMAIL: 'owner@example.com', CONTACT_FROM_EMAIL: 'info@zajickuv-med.cz',
};
const payload = (overrides = {}) => ({
  name: ' Jana Nová ', email: 'jana@example.com', phone: '+420 123 456 789',
  product: 'Květový med', message: 'Prosím o dvě sklenice. <img src=x onerror=alert(1)>', website: '',
  submissionId: crypto.randomUUID(), turnstileToken: crypto.randomUUID(), ...overrides,
});
function request(body = payload(), options = {}) {
  const { origin = 'https://zajickuv-med.cz', ...headers } = options;
  return new Request('https://zajickuv-med.cz/api/contact', {
    method: 'POST', headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1', ...headers },
    body: JSON.stringify(body),
  });
}
function setup(t, options = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  t.after(() => sqlite.close());
  const db = {
    prepare(sql) {
      if (options.failSql?.(sql)) throw new Error('Simulated database failure');
      const statement = sqlite.prepare(sql);
      let params = [];
      return {
        bind(...values) { params = values; return this; },
        async first() { return statement.all(...params)[0] ?? null; },
        async run() { return { success: true, meta: { changes: Number(statement.run(...params).changes) } }; },
        async all() { return {results:statement.all(...params)}; },
      };
    },
    async batch(statements) { for (const statement of statements) await statement.run(); },
  };
  const calls = { verify: 0, email: 0, mail: null };
  const tokens = new Set();
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(init.redirect, 'manual');
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      calls.verify++;
      const { response: token } = JSON.parse(init.body);
      const reused = tokens.has(token); tokens.add(token);
      if (options.verifyError) throw new Error('Mock siteverify outage');
      return Response.json(reused ? { success: false, 'error-codes': ['timeout-or-duplicate'] } :
        { success: true, hostname: 'zajickuv-med.cz', action: 'contact', ...options.verification });
    }
    assert.equal(url, `https://api.cloudflare.com/client/v4/accounts/${base.CF_ACCOUNT_ID}/email/sending/send`);
    calls.email++;
    calls.mail = JSON.parse(init.body);
    // Mail is attempted only after durable storage, with an exclusive sending claim.
    assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages WHERE id = ?').get(calls.mail.headers['X-Contact-ID']).delivery_status, 'sending');
    if (options.emailError) throw new Error('Mock network failure');
    return Response.json(options.emailBody ?? { success: true, result: { delivered: [base.CONTACT_TO_EMAIL] } }, { status: options.emailStatus ?? 200 });
  });
  return { sqlite, db, env: { ...base, CONTACT_DB: db }, calls };
}

test('stores before sending, fixes recipient, sets Reply-To and escapes HTML', async (t) => {
  const { env, calls, sqlite } = setup(t);
  const data = payload();
  const response = await handleContact(request(data), env);
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true, accepted: true, id: data.submissionId });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(calls.email, 1);
  assert.equal(calls.mail.to, base.CONTACT_TO_EMAIL);
  assert.equal(calls.mail.from, base.CONTACT_FROM_EMAIL);
  assert.equal(calls.mail.reply_to, 'jana@example.com');
  assert.ok(calls.mail.html.includes('&lt;img'));
  assert.ok(!calls.mail.html.includes('<img'));
  assert.ok(calls.mail.text.includes('<img'));
  assert.ok(calls.mail.text.includes('Jana Nová'));
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, 'sent');
  assert.match(sqlite.prepare('SELECT ip_hash FROM contact_attempts').get().ip_hash, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(sqlite.prepare('SELECT * FROM contact_attempts').all()).includes('192.0.2.1'));
});

test('rejects empty, malformed, overlong, injected and recipient fields before API use', async (t) => {
  const { env, calls } = setup(t);
  for (const data of [null, [], {}, ...[
    { name: '' }, { email: 'invalid' }, { email: {} }, { email: 'x\r\nBcc:x@y.cz' },
    { email: 'a..b@example.com' }, { name: 'x\nInjected' }, { phone: '1'.repeat(81) },
    { product: '' }, { message: '  ' }, { message: 'a'.repeat(5001) }, { name: 'a'.repeat(201) },
    { submissionId: 'bad' }, { to: 'attacker@example.com' }, { website: 'bot' },
  ].map(payload)]) {
    assert.equal((await handleContact(request(data), env)).status, 400);
  }
  assert.equal(calls.verify, 0); assert.equal(calls.email, 0);
});

test('requires POST, allowed hostname, same origin, JSON and bounded body', async (t) => {
  const { env, calls } = setup(t);
  const method = await handleContact(new Request('https://zajickuv-med.cz/api/contact'), env);
  assert.equal(method.status, 405); assert.equal(method.headers.get('allow'), 'POST');
  assert.equal((await handleContact(request(payload(), { origin: 'https://evil.example' }), env)).status, 403);
  assert.equal((await handleContact(request(payload(), { 'sec-fetch-site': 'cross-site' }), env)).status, 403);
  assert.equal((await handleContact(request(), { ...env, CONTACT_ALLOWED_HOSTNAMES: 'other.example' })).status, 403);
  assert.equal((await handleContact(request(payload(), { 'content-type': 'text/plain' }), env)).status, 415);
  assert.equal((await handleContact(request(payload({ message: 'a'.repeat(40000) })), env)).status, 413);
  const malformed = request();
  assert.equal((await handleContact(new Request(malformed.url, { method: 'POST', headers: malformed.headers, body: '{' }), env)).status, 400);
  assert.equal(calls.email, 0);
});

test('fails closed when any required configuration or trusted IP is absent', async (t) => {
  const { env, calls } = setup(t);
  for (const key of ['CONTACT_DB', 'TURNSTILE_SECRET_KEY', 'CONTACT_HASH_SECRET', 'CF_ACCOUNT_ID', 'CF_EMAIL_API_TOKEN', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']) {
    assert.equal((await handleContact(request(), { ...env, [key]: undefined })).status, 503, key);
  }
  assert.equal((await handleContact(request(), { ...env, CONTACT_TO_EMAIL: 'info@zajickuv-med.cz' })).status, 503);
  const req = request(); req.headers.delete('cf-connecting-ip');
  assert.equal((await handleContact(req, env)).status, 503);
  assert.equal(calls.email, 0);
});

test('requires token and rejects invalid, expired, reused and wrong hostname/action tokens', async (t) => {
  const { env, calls } = setup(t);
  assert.equal((await handleContact(request(payload({ turnstileToken: '' })), env)).status, 400);
  const data = payload();
  assert.equal((await handleContact(request(data), env)).status, 202);
  assert.equal((await handleContact(request(data), env)).status, 403);
  assert.equal(calls.email, 1);
  for (const verification of [{ success: false }, { hostname: 'evil.example' }, { action: 'other' }]) {
    await t.test(JSON.stringify(verification), async (st) => {
      const state = setup(st, { verification });
      assert.equal((await handleContact(request(), state.env)).status, 403);
      assert.equal(state.calls.email, 0);
      assert.equal(state.sqlite.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n, 0);
    });
  }
});

test('siteverify outage does not store or send a message', async (t) => {
  const { env, calls, sqlite } = setup(t, { verifyError: true });
  assert.equal((await handleContact(request(), env)).status, 503);
  assert.equal(calls.email, 0);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n, 0);
});

test('rolling rate limit persists in D1; expired attempts release capacity', async (t) => {
  const { env, sqlite, calls } = setup(t, { verification: { success: false } });
  for (let i = 0; i < 3; i++) assert.equal((await handleContact(request(), env)).status, 403);
  const limited = await handleContact(request(), { ...env });
  assert.equal(limited.status, 429); assert.equal(limited.headers.get('retry-after'), '900');
  assert.equal(calls.verify, 3);
  sqlite.exec('UPDATE contact_attempts SET created_at = created_at - 901');
  assert.equal((await handleContact(request(), env)).status, 403);
  assert.equal((await handleContact(request(payload(), { 'cf-connecting-ip': '192.0.2.2' }), env)).status, 403);
});

test('same ID and identical content with a new ID never cause a second email; changed ID payload conflicts', async (t) => {
  const { env, calls, sqlite } = setup(t);
  const data = payload();
  await handleContact(request(data), env);
  for (const submissionId of [data.submissionId, crypto.randomUUID()]) {
    const response = await handleContact(request({ ...data, submissionId, turnstileToken: crypto.randomUUID() }), env);
    assert.equal(response.status, 200); assert.equal((await response.json()).duplicate, true);
  }
  assert.equal(calls.email, 1);
  const conflict = await handleContact(request({ ...data, message: 'Jiná zpráva', turnstileToken: crypto.randomUUID() }, { 'cf-connecting-ip': '192.0.2.2' }), env);
  assert.equal(conflict.status, 409);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n, 1);
});

for (const [label, options, expected] of [
  ['explicit rejection', { emailStatus: 403, emailBody: { success: false } }, 'pending'],
  ['quota rejection', { emailStatus: 429, emailBody: { success: false } }, 'pending'],
  ['permanent bounce', { emailBody: { success: true, result: { permanent_bounces: [base.CONTACT_TO_EMAIL] } } }, 'pending'],
  ['provider queue', { emailBody: { success: true, result: { queued: [base.CONTACT_TO_EMAIL] } } }, 'queued'],
  ['network timeout', { emailError: true }, 'uncertain'],
  ['server error', { emailStatus: 500, emailBody: { success: false } }, 'uncertain'],
  ['unexpected success', { emailBody: { success: true } }, 'uncertain'],
  ['wrong recipient response', { emailBody: { success: true, result: { delivered: ['wrong@example.com'] } } }, 'uncertain'],
  ['redirect', { emailStatus: 302, emailBody: {} }, 'uncertain'],
]) {
  test(`keeps accepted message on ${label}; status=${expected}, safe retry policy`, async (t) => {
    const { env, db, sqlite, calls } = setup(t, options);
    const data = payload();
    const response = await handleContact(request(data), env);
    assert.equal(response.status, 202); assert.equal((await response.json()).accepted, true);
    assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, expected);
    const retry = await sendStoredMessage(db, env, data.submissionId);
    assert.equal(retry, expected === 'pending' ? expected : 'skipped');
    assert.equal(calls.email, expected === 'pending' ? 2 : 1);
  });
}

test('database failure before storage never confirms success or sends email', async (t) => {
  for (const failure of ['INSERT INTO contact_attempts', 'INSERT INTO contact_messages']) {
    await t.test(failure, async (st) => {
      const { env, calls } = setup(st, { failSql: (sql) => sql.startsWith(failure) });
      const response = await handleContact(request(), env);
      assert.equal(response.status, 503); assert.notEqual((await response.json()).ok, true);
      assert.equal(calls.email, 0);
    });
  }
});

test('failure after email acceptance leaves a locked sending record and cannot resend', async (t) => {
  const { env, db, sqlite, calls } = setup(t, { failSql: (sql) => sql.startsWith('UPDATE contact_deliveries SET delivery_status = ?') });
  const data = payload();
  assert.equal((await handleContact(request(data), env)).status, 202);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, 'sending');
  assert.equal(await sendStoredMessage(db, env, data.submissionId), 'skipped');
  assert.equal(calls.email, 1);
});

test('retention deletes all statuses at 90 days, preserves newer records and clears expired IP hashes', async (t) => {
  const { env, db, sqlite } = setup(t);
  await handleContact(request(), env);
  const now = Math.floor(Date.now() / 1000);
  await cleanupContact(db, now + 899);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_attempts').get().n, 1);
  await cleanupContact(db, now + 901);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_attempts').get().n, 0);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n, 1);
  await cleanupContact(db, now + 90 * 86400);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n, 0);
});

test('public configuration exposes only the site key and returns no-store', () => {
  const response = handleContactConfig(new Request('https://zajickuv-med.cz/api/contact-config'), base);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return response.json().then((data) => assert.deepEqual(data, { siteKey: base.TURNSTILE_SITE_KEY }));
});

test('native binding sends to fixed verified inbox without a stored API token and retains provider ID', async (t) => {
  const { env, calls, sqlite, db } = setup(t);
  let bindingCalls = 0;
  const bindingEnv = { ...env, CF_EMAIL_API_TOKEN: undefined, CONTACT_EMAIL: {
    async send(mail) {
      bindingCalls++;
      assert.equal(mail.to, base.CONTACT_TO_EMAIL);
      assert.equal(mail.replyTo, 'jana@example.com');
      assert.ok(mail.text.includes('Prosím o dvě sklenice.'));
      assert.ok(mail.html.includes('&lt;img'));
      const row = sqlite.prepare('SELECT * FROM contact_messages WHERE id = ?').get(mail.headers['X-Contact-ID']);
      assert.equal(row.delivery_status, 'sending');
      return { messageId: '<mock-provider-id@example.com>' };
    },
  } };
  const data = payload();
  const response = await handleContact(request(data), bindingEnv);
  assert.equal(response.status, 202);
  assert.equal(calls.email, 0);
  assert.equal(bindingCalls, 1);
  const stored = sqlite.prepare('SELECT * FROM contact_messages').get();
  assert.equal(stored.delivery_status, 'queued');
  assert.equal(stored.provider_message_id, '<mock-provider-id@example.com>');
  assert.equal(await sendStoredMessage(db, bindingEnv, data.submissionId), 'skipped');
  assert.equal(bindingCalls, 1);
});

for (const [label, send, expected] of [
  ['explicit rejection', async () => { throw Object.assign(new Error('Mock rejected'), { code: 'E_SENDER_NOT_VERIFIED' }); }, 'pending'],
  ['ambiguous failure', async () => { throw new Error('Unknown provider failure'); }, 'uncertain'],
  ['missing confirmation', async () => ({}), 'uncertain'],
]) {
  test(`native binding ${label} keeps message with status ${expected}`, async (t) => {
    const { env, sqlite, calls } = setup(t);
    const response = await handleContact(request(), { ...env, CF_EMAIL_API_TOKEN: undefined, CONTACT_EMAIL: { send } });
    assert.equal(response.status, 202);
    assert.equal((await response.json()).accepted, true);
    assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, expected);
    assert.equal(calls.email, 0);
  });
}

test('two recipients have independent claims; verification failure retries only the pending destination', async (t) => {
  const {env,sqlite,db}=setup(t);
  const addresses=['first@example.com','second@example.com'];
  const sent=[];let verified=false;
  const multi={...env,CONTACT_TO_EMAIL:JSON.stringify(addresses),CONTACT_EMAIL:{async send(mail){
    sent.push(mail.to);
    if(mail.to===addresses[1]&&!verified)throw Object.assign(new Error('Unverified'),{code:'E_RECIPIENT_NOT_ALLOWED'});
    return {messageId:`<${mail.to}>`};
  }}};
  const data=payload();
  assert.equal((await handleContact(request(data),multi)).status,202);
  assert.deepEqual(sent,addresses);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status,'pending');
  assert.deepEqual(sqlite.prepare('SELECT recipient,delivery_status FROM contact_deliveries ORDER BY recipient').all().map(r=>({...r})),
    [{recipient:addresses[0],delivery_status:'queued'},{recipient:addresses[1],delivery_status:'pending'}]);
  await retryPendingMessages(db,multi);assert.equal(sent.length,2);
  verified=true;sqlite.exec('UPDATE contact_deliveries SET attempted_at=attempted_at-901');
  await retryPendingMessages(db,multi);
  assert.deepEqual(sent,[...addresses,addresses[1]]);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status,'queued');
  assert.equal(await sendStoredMessage(db,multi,data.submissionId),'skipped');
  assert.equal(sent.length,3);
});

test('uncertain destination is never retried and an accepted copy is never duplicated',async(t)=>{
  const {env,db,sqlite}=setup(t);const sent=[];
  const multi={...env,CONTACT_TO_EMAIL:JSON.stringify(['first@example.com','second@example.com']),CONTACT_EMAIL:{async send(mail){
    sent.push(mail.to);if(mail.to==='second@example.com')throw new Error('Lost response');return {messageId:'<accepted>'};
  }}};
  const data=payload();await handleContact(request(data),multi);
  sqlite.exec('UPDATE contact_deliveries SET attempted_at=attempted_at-901');
  await retryPendingMessages(db,multi);
  assert.equal(await sendStoredMessage(db,multi,data.submissionId),'skipped');
  assert.equal(sent.length,2);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status,'uncertain');
});

test('upgrade does not resend legacy messages to newly configured recipients and retention cascades',async(t)=>{
  const {env,db,sqlite}=setup(t);
  const data=payload();await handleContact(request(data),env);
  sqlite.exec('DELETE FROM contact_deliveries'); // Simulate an accepted pre-migration message.
  const upgraded={...env,CONTACT_TO_EMAIL:JSON.stringify(['new@example.com']),CONTACT_EMAIL:{async send(){assert.fail('Legacy mail must not be copied');}}};
  assert.equal(await sendStoredMessage(db,upgraded,data.submissionId),'skipped');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_deliveries').get().n,0);
});

test('simultaneous retries claim each pending recipient at most once',async(t)=>{
  const {env,db}=setup(t);let accept=false;const sent=[];
  const multi={...env,CONTACT_TO_EMAIL:JSON.stringify(['first@example.com','second@example.com']),CONTACT_EMAIL:{async send(mail){
    if(!accept)throw Object.assign(new Error('Rejected'),{code:'E_RECIPIENT_NOT_ALLOWED'});
    sent.push(mail.to);await Promise.resolve();return {messageId:`<${mail.to}>`};
  }}};
  const data=payload();await handleContact(request(data),multi);accept=true;
  await Promise.all([sendStoredMessage(db,multi,data.submissionId),sendStoredMessage(db,multi,data.submissionId)]);
  assert.deepEqual(sent.sort(),['first@example.com','second@example.com']);
});

test('acknowledges durable storage while both email providers are still waiting; duplicate never resends', { timeout: 2000 }, async (t) => {
  const { env, db, sqlite } = setup(t);
  const pending = [];
  const ctx = { waitUntil(task) { pending.push(task); } };
  const addresses = ['first@example.com', 'second@example.com'];
  const sends = [];
  let release;
  const provider = new Promise((resolve) => { release = resolve; });
  let bothStarted;
  const started = new Promise((resolve) => { bothStarted = resolve; });
  t.after(async () => { release(); await Promise.all(pending); });
  const multi = { ...env, CONTACT_TO_EMAIL: JSON.stringify(addresses), CONTACT_EMAIL: {
    async send(mail) {
      sends.push(mail.to);
      if (sends.length === addresses.length) bothStarted();
      await provider;
      return { messageId: `<${mail.to}>` };
    },
  } };
  const data = payload();
  const response = await handleContact(request(data), multi, ctx);
  assert.equal(response.status, 202);
  assert.equal((await response.json()).accepted, true);
  assert.equal(pending.length, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_deliveries').get().n, 2);
  await started; // Both sends start even while the first provider response is still blocked.
  assert.deepEqual(sends.sort(), addresses);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_deliveries WHERE delivery_status=\'sending\'').get().n, 2);
  const duplicate = await handleContact(request({ ...data, turnstileToken: crypto.randomUUID() }), multi, ctx);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);
  release();
  await Promise.all(pending);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, 'queued');
  await retryPendingMessages(db, multi);
  assert.equal(sends.length, 2);
});

test('does not acknowledge before destination storage; cron recovers a message interrupted before queuing', async (t) => {
  let fail = true;
  const { env, db, sqlite, calls } = setup(t, {
    failSql: (sql) => fail && sql.startsWith('INSERT INTO contact_deliveries'),
  });
  const pending = [];
  const response = await handleContact(request(), env, { waitUntil(task) { pending.push(task); } });
  assert.equal(response.status, 503);
  assert.equal(pending.length, 0);
  assert.equal(calls.email, 0);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, 'pending');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM contact_deliveries').get().n, 0);
  fail = false;
  await retryPendingMessages(db, env);
  assert.equal(calls.email, 1);
  assert.equal(sqlite.prepare('SELECT delivery_status FROM contact_messages').get().delivery_status, 'sent');
});
