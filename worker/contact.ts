export interface ContactEnv {
  CONTACT_EMAIL?: SendEmail;
  CONTACT_DB?: D1Database;
  CONTACT_ALLOWED_HOSTNAMES?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_HASH_SECRET?: string;
  CF_ACCOUNT_ID?: string;
  CF_EMAIL_API_TOKEN?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

export interface StoredMessage {
  id: string;
  created_at: number;
  fingerprint: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  message: string;
  delivery_status: string;
}

export interface ContactContext {
  waitUntil(promise: Promise<unknown>): void;
}

const WINDOW = 15 * 60;
const RETENTION = 90 * 24 * 60 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
const UNAVAILABLE = 'Formulář nyní není dostupný. Zkuste to prosím později nebo nám zavolejte.';

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers } });
}

function allowedHosts(env: ContactEnv): string[] {
  return (env.CONTACT_ALLOWED_HOSTNAMES ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function emailAddress(value: string | undefined): value is string {
  return !!value && value.length <= 254 && EMAIL.test(value) && !value.includes('..') &&
    value.split('@')[0].length <= 64 && value.split('@')[1].split('.').every((label) => label.length <= 63);
}

export function contactRecipients(env: ContactEnv): string[] {
  let values: unknown;
  try {
    const text = env.CONTACT_TO_EMAIL?.trim() ?? '';
    values = text.startsWith('[') ? JSON.parse(text) : [text];
  } catch { return []; }
  if (!Array.isArray(values) || values.length < 1 || values.length > 5 ||
      values.some((v) => typeof v !== 'string' || !emailAddress(v) || v.toLowerCase().endsWith('@zajickuv-med.cz'))) return [];
  return [...new Set((values as string[]).map((v) => v.toLowerCase()))];
}

export function emailConfigured(env: ContactEnv): boolean {
  return (!!env.CONTACT_EMAIL || (/^[a-f0-9]{32}$/i.test(env.CF_ACCOUNT_ID ?? '') && !!env.CF_EMAIL_API_TOKEN)) &&
    contactRecipients(env).length > 0 && emailAddress(env.CONTACT_FROM_EMAIL) &&
    env.CONTACT_FROM_EMAIL.toLowerCase().endsWith('@zajickuv-med.cz');
}

export function handleContactConfig(request: Request, env: ContactEnv): Response {
  if (request.method !== 'GET') return json({ error: 'Použijte GET.' }, 405, { Allow: 'GET' });
  if (!allowedHosts(env).includes(new URL(request.url).hostname) || !env.TURNSTILE_SITE_KEY) {
    return json({ error: UNAVAILABLE }, 503);
  }
  return json({ siteKey: env.TURNSTILE_SITE_KEY });
}

async function hmac(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function readBody(request: Request): Promise<Record<string, unknown> | Response> {
  if (Number(request.headers.get('content-length')) > 32768) return json({ error: 'Zpráva je příliš dlouhá.' }, 413);
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'Chybí zpráva.' }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      return json({ error: 'Zpráva je příliš dlouhá.' }, 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const parsed: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch { return json({ error: 'Neplatný formát zprávy.' }, 400); }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

/** Shared by both email transports and the local preview. No recipient or delivery state. */
export function formatContactEmail(row: StoredMessage): { text: string; html: string } {
  const received = new Intl.DateTimeFormat('cs-CZ', {
    timeZone: 'Europe/Prague', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(row.created_at * 1000));
  const replyUrl = `mailto:${encodeURIComponent(row.email)}`;
  const linkStyle = 'color:#805316;text-decoration:underline;overflow-wrap:anywhere;word-break:break-word';
  const phone = row.phone
    ? `<a href="tel:${escapeHtml(row.phone.replace(/[^+0-9]/g, ''))}" style="${linkStyle}">${escapeHtml(row.phone)}</a>`
    : 'Neuveden';
  const contactRows = [
    ['Jméno', escapeHtml(row.name)],
    ['E-mail', `<a href="${replyUrl}" style="${linkStyle}">${escapeHtml(row.email)}</a>`],
    ['Telefon', phone],
  ].map(([label, value]) => `<tr><th scope="row" align="left" valign="top" width="80" style="padding:7px 12px 7px 0;font-size:14px;font-weight:400;color:#746958">${label}</th><td valign="top" style="padding:7px 0;font-size:16px;line-height:24px;color:#30291f;overflow-wrap:anywhere;word-break:break-word">${value}</td></tr>`).join('');
  return {
    text: `ZAJÍČKŮV MED\nNová zpráva z webu\nPřijato: ${received} (čas v ČR)\n\nKONTAKT\nJméno: ${row.name}\nE-mail: ${row.email}\nTelefon: ${row.phone || 'Neuveden'}\n\nZÁJEM O PRODUKT\n${row.product}\n\nZPRÁVA\n${row.message}\n\nOdpovězte přímo na tento e-mail. Odpověď obdrží ${row.email}.\n\nID zprávy: ${row.id}`,
    html: `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nová zpráva z webu – Zajíčkův med</title></head>
<body style="margin:0;padding:0;background-color:#f5f2eb;color:#30291f;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f5f2eb"><tr><td align="center" style="padding:24px 12px">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e6dece;border-radius:12px">
<tr><td bgcolor="#fff4d8" style="padding:24px;border-top:5px solid #d5a139;border-radius:12px 12px 0 0">
<p style="margin:0 0 12px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:2px;color:#805316">ZAJÍČKŮV MED</p>
<h1 style="margin:0 0 10px;font-size:26px;line-height:34px;font-weight:700;color:#30291f">Nová zpráva z webu</h1>
<p style="margin:0;font-size:13px;line-height:20px;color:#746958">Přijato ${escapeHtml(received)} · čas v ČR</p>
</td></tr>
<tr><td style="padding:24px">
<h2 style="margin:0 0 10px;font-size:12px;line-height:18px;letter-spacing:1px;color:#746958">KONTAKT</h2>
<table width="100%" cellspacing="0" cellpadding="0" border="0" aria-label="Kontaktní údaje">${contactRows}</table>
<h2 style="margin:24px 0 8px;font-size:12px;line-height:18px;letter-spacing:1px;color:#746958">ZÁJEM O PRODUKT</h2>
<p style="margin:0;font-size:16px;line-height:25px;font-weight:700;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(row.product)}</p>
<h2 style="margin:24px 0 10px;font-size:12px;line-height:18px;letter-spacing:1px;color:#746958">ZPRÁVA</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#faf8f3" style="padding:18px;border-left:3px solid #d5a139;font-size:16px;line-height:26px;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(row.message).replace(/\r\n?|\n/g, '<br>')}</td></tr></table>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px"><tr><td bgcolor="#805316" style="border-radius:6px"><a href="${replyUrl}" style="display:inline-block;padding:13px 20px;border:1px solid #805316;border-radius:6px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none">Odpovědět zákazníkovi</a></td></tr></table>
<p style="margin:12px 0 0;font-size:13px;line-height:20px;color:#746958">Můžete také odpovědět přímo na tento e-mail.<br>Odpověď obdrží zákazník.</p>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #eee8dc;font-size:11px;line-height:18px;color:#746958;overflow-wrap:anywhere;word-break:break-word">Zajíčkův med · kontaktní formulář<br>ID zprávy: ${escapeHtml(row.id)}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`,
  };
}

export async function refreshMessageDelivery(db: D1Database, id: string): Promise<void> {
  await db.prepare(`UPDATE contact_messages SET delivery_status = CASE
    WHEN NOT EXISTS (SELECT 1 FROM contact_deliveries WHERE message_id=? AND delivery_status!='sent') THEN 'sent'
    WHEN NOT EXISTS (SELECT 1 FROM contact_deliveries WHERE message_id=? AND delivery_status NOT IN ('sent','queued')) THEN 'queued'
    WHEN EXISTS (SELECT 1 FROM contact_deliveries WHERE message_id=? AND delivery_status='sending') THEN 'sending'
    WHEN EXISTS (SELECT 1 FROM contact_deliveries WHERE message_id=? AND delivery_status='uncertain') THEN 'uncertain'
    ELSE 'pending' END,
    attempts=(SELECT COALESCE(SUM(attempts),0) FROM contact_deliveries WHERE message_id=?),
    attempted_at=(SELECT MAX(attempted_at) FROM contact_deliveries WHERE message_id=?),
    last_error=(SELECT last_error FROM contact_deliveries WHERE message_id=? AND last_error IS NOT NULL LIMIT 1),
    provider_message_id=(SELECT CASE WHEN COUNT(*)=1 THEN MAX(provider_message_id) ELSE NULL END FROM contact_deliveries WHERE message_id=?)
    WHERE id=? AND EXISTS (SELECT 1 FROM contact_deliveries WHERE message_id=?)`)
    .bind(id,id,id,id,id,id,id,id,id,id).run();
}

/** One durable claim per recipient. Unknown results are never retried automatically. */
async function sendToRecipient(db: D1Database, env: ContactEnv, row: StoredMessage, recipient: string): Promise<string> {
  const id = row.id;
  const now = Math.floor(Date.now() / 1000);
  // A single conditional UPDATE is a durable lock across isolates and CLI invocations.
  const claim = await db.prepare(`UPDATE contact_deliveries SET delivery_status = 'sending',
    attempted_at = ?, attempts = attempts + 1, last_error = NULL
    WHERE message_id = ? AND recipient = ? AND delivery_status = 'pending'
    AND EXISTS (SELECT 1 FROM contact_messages WHERE id=? AND created_at>?) RETURNING message_id`)
    .bind(now, id, recipient, id, now - RETENTION).first();
  if (!claim) return 'skipped';
  await refreshMessageDelivery(db, id);
  let status = 'uncertain';
  let error: string | null = 'unknown_result';
  let providerId: string | null = null;
  try {
    const mail = {
      from: env.CONTACT_FROM_EMAIL!, to: recipient, replyTo: row.email,
      subject: 'Nová zpráva z webu – Zajíčkův med',
      headers: { 'X-Contact-ID': row.id },
      ...formatContactEmail(row),
    };
    if (env.CONTACT_EMAIL) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const result = await Promise.race([
          env.CONTACT_EMAIL.send(mail),
          new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Binding timeout')), 12000); }),
        ]);
        if (typeof result?.messageId === 'string' && result.messageId.length > 0) {
          status = 'queued'; error = null; providerId = result.messageId.slice(0, 998);
        }
      } catch (cause) {
        const code = (cause as { code?: string })?.code;
        const rejected = ['E_VALIDATION_ERROR', 'E_FIELD_MISSING', 'E_SENDER_NOT_VERIFIED',
          'E_RECIPIENT_NOT_VERIFIED', 'E_RECIPIENT_NOT_ALLOWED', 'E_RATE_LIMIT_EXCEEDED', 'E_TOO_MANY_RECIPIENTS'];
        if (code && rejected.includes(code)) { status = 'pending'; error = code; }
        else { error = 'email_binding_unconfirmed'; }
      } finally { if (timer !== undefined) clearTimeout(timer); }
    } else {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.CF_EMAIL_API_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: mail.from, to: mail.to, reply_to: mail.replyTo, subject: mail.subject,
        headers: mail.headers, text: mail.text, html: mail.html,
      }),
      redirect: 'manual', signal: AbortSignal.timeout(12000),
    });
    const data = await response.json().catch(() => null) as {
      success?: boolean; result?: { delivered?: string[]; queued?: string[]; permanent_bounces?: string[]; message_id?: string };
    } | null;
    const contains = (addresses: string[] | undefined) => Array.isArray(addresses) && addresses.some((a) => typeof a === 'string' && a.toLowerCase() === recipient);
    if (response.ok && data?.success === true) {
      if (contains(data.result?.permanent_bounces)) { status = 'pending'; error = 'permanent_bounce'; }
      else if (contains(data.result?.delivered)) { status = 'sent'; error = null; }
      else if (contains(data.result?.queued)) { status = 'queued'; error = null; }
      providerId = typeof data.result?.message_id === 'string' ? data.result.message_id.slice(0, 998) : null;
    } else if ([400, 401, 403, 404, 413, 422, 429].includes(response.status) && data?.success === false) {
      status = 'pending'; error = `email_http_${response.status}`;
    } else { error = `email_unconfirmed_${response.status}`; }
    }
  } catch { error = 'email_network_or_timeout'; }
  // If this write fails, 'sending' remains locked; it is never blindly retried.
  await db.prepare(`UPDATE contact_deliveries SET delivery_status = ?, last_error = ?, provider_message_id = ?
    WHERE message_id = ? AND recipient = ? AND delivery_status = 'sending'`).bind(status, error, providerId, id, recipient).run();
  await refreshMessageDelivery(db, id);
  return status;
}

async function prepareMessageDeliveries(db: D1Database, recipients: string[], id: string): Promise<void> {
  const existing = await db.prepare('SELECT message_id FROM contact_deliveries WHERE message_id=? LIMIT 1').bind(id).first();
  if (!existing) await db.batch(recipients.map((recipient) => db.prepare(`INSERT INTO contact_deliveries(message_id,recipient)
    SELECT ?,? WHERE EXISTS (SELECT 1 FROM contact_messages WHERE id=? AND delivery_status='pending')
    ON CONFLICT(message_id,recipient) DO NOTHING`).bind(id,recipient,id)));
}

export async function sendStoredMessage(db: D1Database, env: ContactEnv, id: string): Promise<string> {
  if (!emailConfigured(env)) throw new Error('Email configuration is incomplete');
  const recipients = contactRecipients(env);
  const row = await db.prepare('SELECT * FROM contact_messages WHERE id=? AND created_at>?')
    .bind(id, Math.floor(Date.now()/1000)-RETENTION).first<StoredMessage>();
  if (!row) return 'skipped';
  // Legacy accepted/ambiguous messages are not copied to new recipients during upgrades.
  if (row.delivery_status === 'pending') {
    await prepareMessageDeliveries(db, recipients, id);
  }
  // Independent sends run together, keeping even five 12s timeouts within waitUntil's 30s window.
  const results = await Promise.all(recipients.map(async (recipient) => {
    try { return await sendToRecipient(db,env,row,recipient); }
    catch { console.error('contact_recipient_state_unconfirmed', id); return 'skipped'; }
  }));
  if (results.every((result) => result === 'skipped')) return 'skipped';
  return (await db.prepare('SELECT delivery_status FROM contact_messages WHERE id=?').bind(id)
    .first<{delivery_status:string}>())?.delivery_status ?? 'uncertain';
}

export async function retryPendingMessages(db: D1Database, env: ContactEnv): Promise<void> {
  if (!emailConfigured(env)) return;
  const now = Math.floor(Date.now()/1000);
  const recipients = contactRecipients(env);
  // Two messages keep the invocation within Workers Free subrequest limits.
  const rows = await db.prepare(`SELECT m.id FROM contact_messages m WHERE m.created_at>?
    AND ((m.delivery_status='pending' AND NOT EXISTS (SELECT 1 FROM contact_deliveries d WHERE d.message_id=m.id))
    OR EXISTS (SELECT 1 FROM contact_deliveries d WHERE d.message_id=m.id AND d.delivery_status='pending'
      AND d.recipient IN (${recipients.map(() => '?').join(',')})
      AND (d.attempted_at IS NULL OR d.attempted_at<=?))) ORDER BY m.created_at LIMIT 2`)
    .bind(now-RETENTION,...recipients,now-WINDOW).all<{id:string}>();
  for (const row of rows.results) await sendStoredMessage(db,env,row.id);
}

export async function cleanupContact(db: D1Database, now = Math.floor(Date.now() / 1000)): Promise<void> {
  await db.batch([
    db.prepare('DELETE FROM contact_messages WHERE created_at <= ?').bind(now - RETENTION),
    db.prepare('DELETE FROM contact_attempts WHERE created_at <= ?').bind(now - WINDOW),
  ]);
}

export async function handleContact(request: Request, env: ContactEnv, ctx?: ContactContext): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Použijte POST.' }, 405, { Allow: 'POST' });
  const url = new URL(request.url);
  if (!allowedHosts(env).includes(url.hostname) || request.headers.get('origin') !== url.origin ||
      request.headers.get('sec-fetch-site') === 'cross-site') {
    return json({ error: 'Zprávu prosím odešlete přímo z našeho webu.' }, 403);
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Neplatný formát zprávy.' }, 415);
  }
  try {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const keys = ['name', 'email', 'phone', 'product', 'message', 'website', 'turnstileToken', 'submissionId'];
    if (Object.keys(body).some((key) => !keys.includes(key)) || keys.some((key) => body[key] !== undefined && typeof body[key] !== 'string')) {
      return json({ error: 'Neplatná pole formuláře.' }, 400);
    }
    if (body.website) return json({ error: 'Zprávu nelze přijmout. Zkontrolujte formulář.' }, 400);
    const field = (key: string) => typeof body[key] === 'string' ? body[key].trim().normalize('NFC') : '';
    const name = field('name'), email = field('email').toLowerCase(), phone = field('phone');
    const product = field('product'), message = field('message').replace(/\r\n?/g, '\n');
    const id = field('submissionId'), token = field('turnstileToken');
    if (!name || name.length > 200 || !emailAddress(email) || phone.length > 80 ||
        !product || product.length > 200 || !message || message.length > 5000 || !UUID.test(id) ||
        [name, email, phone, product].some((v) => /[\x00-\x1f\x7f]/.test(v)) || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(message)) {
      return json({ error: 'Vyplňte jméno, platný e-mail, produkt a zprávu (nejvýše 5 000 znaků).' }, 400);
    }
    if (!token || token.length > 2048) return json({ error: 'Dokončete prosím bezpečnostní ověření.' }, 400);
    const db = env.CONTACT_DB;
    if (!db || !env.TURNSTILE_SECRET_KEY || (env.CONTACT_HASH_SECRET?.length ?? 0) < 32 || !emailConfigured(env)) {
      return json({ error: UNAVAILABLE }, 503);
    }
    // CF-Connecting-IP is set by Cloudflare. Do not trust client supplied X-Forwarded-For.
    const ip = request.headers.get('cf-connecting-ip');
    if (!ip) return json({ error: UNAVAILABLE }, 503);
    const now = Math.floor(Date.now() / 1000);
    const ipHash = await hmac(env.CONTACT_HASH_SECRET!, `ip:${ip}`);
    // SQLite executes this count + insert atomically on the D1 primary (rolling window).
    const attempt = await db.prepare(`INSERT INTO contact_attempts (id, ip_hash, created_at)
      SELECT ?, ?, ? WHERE (SELECT COUNT(*) FROM contact_attempts WHERE ip_hash = ? AND created_at > ?) < 3
      RETURNING id`).bind(crypto.randomUUID(), ipHash, now, ipHash, now - WINDOW).first();
    if (!attempt) return json({ error: 'Příliš mnoho pokusů. Zkuste to prosím za 15 minut.' }, 429, { 'Retry-After': '900' });
    let verified: { success?: boolean; hostname?: string; action?: string } | null;
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
        signal: AbortSignal.timeout(8000), redirect: 'manual',
      });
      if (!verification.ok) throw new Error();
      verified = await verification.json();
    } catch { return json({ error: 'Bezpečnostní ověření není dostupné. Zkuste to prosím znovu.' }, 503); }
    if (verified?.success !== true || verified.hostname !== url.hostname || verified.action !== 'contact') {
      return json({ error: 'Bezpečnostní ověření vypršelo nebo nebylo platné. Zkuste to prosím znovu.' }, 403);
    }
    const fingerprint = await hmac(env.CONTACT_HASH_SECRET!, `message:${JSON.stringify([name, email, phone, product, message])}`);
    const inserted = await db.prepare(`INSERT INTO contact_messages
      (id, created_at, fingerprint, name, email, phone, product, message)
      SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS
      (SELECT 1 FROM contact_messages WHERE id = ? OR (fingerprint = ? AND created_at > ?)) RETURNING id`)
      .bind(id, now, fingerprint, name, email, phone, product, message, id, fingerprint, now - WINDOW).first();
    if (!inserted) {
      const existing = await db.prepare(`SELECT id, fingerprint FROM contact_messages
        WHERE id = ? OR (fingerprint = ? AND created_at > ?) ORDER BY (id = ?) DESC LIMIT 1`)
        .bind(id, fingerprint, now - WINDOW, id).first<{ id: string; fingerprint: string }>();
      if (!existing) throw new Error('Missing stored message');
      if (existing.fingerprint !== fingerprint) return json({ error: 'Formulář se změnil. Obnovte stránku a odešlete jej znovu.' }, 409);
      return json({ ok: true, accepted: true, duplicate: true, id: existing.id }, 200);
    }
    // Persist both the message and pending destinations before acknowledging it.
    // The cron can recover pending work even if background execution is interrupted.
    await prepareMessageDeliveries(db, contactRecipients(env), id);
    const delivery = sendStoredMessage(db, env, id).catch(() => {
      console.error('contact_delivery_state_unconfirmed', id);
    });
    if (ctx) ctx.waitUntil(delivery);
    else await delivery; // Standalone callers without a request lifecycle must await the work.
    return json({ ok: true, accepted: true, id }, 202);
  } catch {
    console.error('contact_storage_or_request_failure');
    return json({ error: 'Přijetí zprávy se nepodařilo potvrdit. Zkuste to prosím znovu nebo nám zavolejte.' }, 503);
  }
}
