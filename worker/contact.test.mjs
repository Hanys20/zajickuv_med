import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleContact } from './contact.ts';

const env = { FORMSPREE_ENDPOINT: 'https://formspree.io/f/testform' };
const payload = {
  name: ' Jana Nová ', email: 'jana@example.com', phone: '+420 123 456 789',
  product: 'Květový med', message: 'Prosím o dvě sklenice.', website: '',
};
function request(body = payload, origin = 'https://zajickuv-med.cz') {
  return new Request('https://zajickuv-med.cz/api/contact', {
    method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('sends all contact fields and confirms only an accepted submission', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls++;
    assert.equal(url, env.FORMSPREE_ENDPOINT);
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.accept, 'application/json');
    assert.equal(init.headers.origin, 'https://zajickuv-med.cz');
    assert.equal(init.redirect, 'error');
    assert.deepEqual(JSON.parse(init.body), {
      name: 'Jana Nová', email: payload.email, phone: payload.phone,
      product: payload.product, message: payload.message,
      subject: 'Poptávka z webu — Květový med',
    });
    return Response.json({ ok: true });
  });
  const response = await handleContact(request(), env);
  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('missing or invalid configuration never contacts a service or reports success', async (t) => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('Unexpected outgoing request'));
  for (const endpoint of [undefined, '', 'https://example.com/f/test', 'https://formspree.io/f/test?redirect=1']) {
    const response = await handleContact(request(), { FORMSPREE_ENDPOINT: endpoint });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, undefined);
  }
});

test('rejects other origins and invalid, missing, or oversized fields without sending', async (t) => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('Unexpected outgoing request'));
  assert.equal((await handleContact(request(payload, 'https://example.com'), env)).status, 403);
  for (const body of [null, [], {}, { ...payload, email: 'invalid' }, { ...payload, email: {} },
    { ...payload, name: '  ' }, { ...payload, product: '' }, { ...payload, message: 'a'.repeat(5001) }]) {
    assert.equal((await handleContact(request(body), env)).status, 400);
  }
  assert.equal((await handleContact(request({ ...payload, message: 'a'.repeat(40_000) }), env)).status, 413);
  const malformed = new Request('https://zajickuv-med.cz/api/contact', {
    method: 'POST', headers: { origin: 'https://zajickuv-med.cz', 'content-type': 'application/json' }, body: '{',
  });
  assert.equal((await handleContact(malformed, env)).status, 400);
});

test('honeypot discards spam without calling Formspree', async (t) => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('Spam must not be sent'));
  const response = await handleContact(request({ ...payload, website: 'spam' }), env);
  assert.deepEqual(await response.json(), { ok: true });
});

test('Formspree rejection, quota, and network failure never report success', async (t) => {
  for (const status of [400, 403, 429, 500]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => Response.json({ errors: ['Rejected'] }, { status }));
    const response = await handleContact(request(), env);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, undefined);
    mock.mock.restore();
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Network failure'); });
  assert.equal((await handleContact(request(), env)).status, 502);
});

test('a CAPTCHA challenge or unexpected successful HTTP response is not a sent message', async (t) => {
  for (const body of [{ ok: false, next: '/captcha' }, {}, null]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    const response = await handleContact(request(), env);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, undefined);
    mock.mock.restore();
  }
});
