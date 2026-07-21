export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

const SESSION_COOKIE = 'session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dní
const PBKDF2_ITERATIONS = 100000;

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes as ArrayBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Konstantní čas porovnání, aby délka shody hesla neprozrazovala nic přes časování.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return bytesToHex(bits);
}

function randomTokenHex(byteLength: number): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(byteLength)));
}

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function sessionCookieHeader(token: string, maxAgeSeconds: number): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

async function requireSession(request: Request, env: Env): Promise<number | null> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?')
    .bind(token)
    .first<{ user_id: number; expires_at: number }>();
  if (!row) return null;
  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return null;
  }
  return row.user_id;
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  if (!body?.username || !body?.password) {
    return jsonResponse({ error: 'Chybí uživatelské jméno nebo heslo' }, { status: 400 });
  }

  const user = await env.DB.prepare('SELECT id, password_hash, password_salt FROM admin_user WHERE username = ?')
    .bind(body.username)
    .first<{ id: number; password_hash: string; password_salt: string }>();
  if (!user) return jsonResponse({ error: 'Špatné jméno nebo heslo' }, { status: 401 });

  const computedHash = await hashPassword(body.password, user.password_salt);
  if (!timingSafeEqualHex(computedHash, user.password_hash)) {
    return jsonResponse({ error: 'Špatné jméno nebo heslo' }, { status: 401 });
  }

  const token = randomTokenHex(32);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, user.id, expiresAt)
    .run();

  return jsonResponse({ ok: true }, { headers: { 'set-cookie': sessionCookieHeader(token, SESSION_TTL_SECONDS) } });
}

async function handlePublicNews(env: Env): Promise<Response> {
  const row = await env.DB.prepare('SELECT title, date, body FROM news ORDER BY date DESC LIMIT 1').first();
  return jsonResponse(row ?? null);
}

async function handlePublicPricing(env: Env): Promise<Response> {
  const row = await env.DB.prepare('SELECT data FROM pricing WHERE id = 1').first<{ data: string }>();
  return new Response(row?.data ?? 'null', { headers: { 'content-type': 'application/json; charset=utf-8' } });
}

async function handlePublicAvailability(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT slug, name, availability FROM honey_availability ORDER BY slug'
  ).all();
  return jsonResponse(results);
}

async function handleAdminNews(request: Request, env: Env, id: string | undefined): Promise<Response> {
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, title, date, body FROM news ORDER BY date DESC').all();
    return jsonResponse(results);
  }
  if (request.method === 'POST') {
    const body = (await request.json()) as { title: string; date: string; body?: string };
    if (!body.title || !body.date) return jsonResponse({ error: 'Chybí název nebo datum' }, { status: 400 });
    const result = await env.DB.prepare('INSERT INTO news (title, date, body) VALUES (?, ?, ?)')
      .bind(body.title, body.date, body.body ?? '')
      .run();
    return jsonResponse({ id: result.meta.last_row_id });
  }
  if (id && request.method === 'PUT') {
    const body = (await request.json()) as { title: string; date: string; body?: string };
    if (!body.title || !body.date) return jsonResponse({ error: 'Chybí název nebo datum' }, { status: 400 });
    await env.DB.prepare('UPDATE news SET title = ?, date = ?, body = ? WHERE id = ?')
      .bind(body.title, body.date, body.body ?? '', id)
      .run();
    return jsonResponse({ ok: true });
  }
  if (id && request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
    return jsonResponse({ ok: true });
  }
  return jsonResponse({ error: 'Not found' }, { status: 404 });
}

async function handleAdminAvailability(request: Request, env: Env, slug: string | undefined): Promise<Response> {
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT slug, name, availability FROM honey_availability ORDER BY slug'
    ).all();
    return jsonResponse(results);
  }
  if (slug && request.method === 'PUT') {
    const body = (await request.json()) as { availability?: string };
    if (body.availability !== 'available' && body.availability !== 'sold-out') {
      return jsonResponse({ error: 'Neplatná hodnota dostupnosti' }, { status: 400 });
    }
    await env.DB.prepare('UPDATE honey_availability SET availability = ? WHERE slug = ?')
      .bind(body.availability, slug)
      .run();
    return jsonResponse({ ok: true });
  }
  return jsonResponse({ error: 'Not found' }, { status: 404 });
}

async function handleAdminPricing(request: Request, env: Env): Promise<Response> {
  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT data FROM pricing WHERE id = 1').first<{ data: string }>();
    return new Response(row?.data ?? '{}', { headers: { 'content-type': 'application/json; charset=utf-8' } });
  }
  if (request.method === 'PUT') {
    const bodyText = await request.text();
    try {
      JSON.parse(bodyText);
    } catch {
      return jsonResponse({ error: 'Neplatný JSON' }, { status: 400 });
    }
    await env.DB.prepare('UPDATE pricing SET data = ? WHERE id = 1').bind(bodyText).run();
    return jsonResponse({ ok: true });
  }
  return jsonResponse({ error: 'Not found' }, { status: 404 });
}

async function handleAdmin(request: Request, env: Env, url: URL): Promise<Response> {
  const [resource, id] = url.pathname.replace('/api/admin/', '').split('/');
  if (resource === 'news') return handleAdminNews(request, env, id);
  if (resource === 'availability') return handleAdminAvailability(request, env, id);
  if (resource === 'pricing') return handleAdminPricing(request, env);
  return jsonResponse({ error: 'Not found' }, { status: 404 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    try {
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        return handleLogin(request, env);
      }
      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        const token = getCookie(request, SESSION_COOKIE);
        if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
        return jsonResponse({ ok: true }, { headers: { 'set-cookie': clearSessionCookieHeader() } });
      }
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const userId = await requireSession(request, env);
        return jsonResponse({ authenticated: userId !== null });
      }

      if (url.pathname === '/api/public/news' && request.method === 'GET') {
        return handlePublicNews(env);
      }
      if (url.pathname === '/api/public/pricing' && request.method === 'GET') {
        return handlePublicPricing(env);
      }
      if (url.pathname === '/api/public/availability' && request.method === 'GET') {
        return handlePublicAvailability(env);
      }

      if (url.pathname.startsWith('/api/admin/')) {
        const userId = await requireSession(request, env);
        if (userId === null) return jsonResponse({ error: 'Nepřihlášeno' }, { status: 401 });
        return handleAdmin(request, env, url);
      }

      return jsonResponse({ error: 'Not found' }, { status: 404 });
    } catch (err) {
      console.error(err);
      return jsonResponse({ error: 'Interní chyba serveru' }, { status: 500 });
    }
  },
};
