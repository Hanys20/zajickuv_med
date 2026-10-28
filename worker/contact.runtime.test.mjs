import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { createFetchMock, Miniflare } from 'miniflare';

test('contact submissions work in the Workers runtime and never follow provider redirects', async () => {
  const source = await readFile(new URL('./contact.ts', import.meta.url), 'utf8');
  const fetchMock = createFetchMock();
  fetchMock.disableNetConnect();
  const provider = fetchMock.get('https://formspree.io');
  const runtime = new Miniflare({
    modules: true,
    compatibilityDate: '2026-07-21',
    script: `${stripTypeScriptTypes(source)}\nexport default { fetch: handleContact };`,
    bindings: { FORMSPREE_ENDPOINT: 'https://formspree.io/f/testform' },
    fetchMock,
  });
  const submit = () => runtime.dispatchFetch('https://zajickuv-med.cz/api/contact', {
    method: 'POST',
    headers: { origin: 'https://zajickuv-med.cz', 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Runtime test', email: 'test@example.com', product: 'Květový med',
      message: 'Mock submission; no email is sent.',
    }),
  });

  try {
    provider.intercept({ method: 'POST', path: '/f/testform' })
      .reply(200, { ok: true }, { headers: { 'content-type': 'application/json' } });
    const success = await submit();
    assert.equal(success.status, 200, await success.clone().text());
    assert.deepEqual(await success.json(), { ok: true });

    for (const status of [302, 307]) {
      provider.intercept({ method: 'POST', path: '/f/testform' })
        .reply(status, { ok: true }, {
          headers: { location: 'https://unexpected.example/redirect', 'content-type': 'application/json' },
        });
      const redirect = await submit();
      assert.equal(redirect.status, 502);
      assert.equal((await redirect.json()).ok, undefined);
    }
    fetchMock.assertNoPendingInterceptors();
  } finally {
    await runtime.dispose();
    await fetchMock.close();
  }
});
