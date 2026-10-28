import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createFetchMock, Miniflare } from 'miniflare';

test('compiled Pages routes contact and existing admin/public API without affecting assets', async (t) => {
  const fetchMock = createFetchMock(); fetchMock.disableNetConnect();
  const runtime = new Miniflare({
    modules: true, scriptPath: '.wrangler/contact-pages-build/index.js',
    compatibilityDate: '2026-07-21', d1Databases: ['DB', 'CONTACT_DB'], fetchMock,
    bindings: { CONTACT_ALLOWED_HOSTNAMES: 'zajickuv-med.cz', TURNSTILE_SITE_KEY: 'mock-site-key' },
    serviceBindings: { ASSETS: () => new Response('static-asset') },
  });
  t.after(async () => { await runtime.dispose(); await fetchMock.close(); });
  const db = await runtime.getD1Database('DB');
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await db.batch(schema.split(';').filter((sql) => sql.trim()).map((sql) => db.prepare(sql)));
  const request = (path, init) => runtime.dispatchFetch(`https://zajickuv-med.cz${path}`, init);
  assert.equal((await request('/api/contact')).status, 405);
  assert.equal((await request('/api/contact-config')).status, 200);
  assert.deepEqual(await (await request('/api/contact-config')).json(), { siteKey: 'mock-site-key' });
  assert.deepEqual(await (await request('/api/auth/me')).json(), { authenticated: false });
  assert.equal((await request('/api/public/availability')).status, 200);
  assert.equal((await request('/api/admin/news')).status, 401);
  assert.equal((await request('/api/unknown')).status, 404);
  assert.equal(await (await request('/kontakt')).text(), 'static-asset');
});
