interface ContactEnv {
  FORMSPREE_ENDPOINT?: string;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
}

export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) {
    return json({ error: 'Zprávu prosím odešlete přímo z našeho webu.' }, 403);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Neplatný formát zprávy.' }, 415);
  }

  // Bound the body before decoding it, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'Chybí zpráva.' }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32_768) {
      await reader.cancel();
      return json({ error: 'Zpráva je příliš dlouhá.' }, 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: 'Neplatný formát zprávy.' }, 400);
  }

  // Quietly discard submissions that fill the field hidden from real visitors.
  if (body.website) return json({ ok: true });
  const field = (key: string) => typeof body[key] === 'string' ? body[key].trim() : '';
  const name = field('name');
  const email = field('email');
  const phone = field('phone');
  const product = field('product');
  const message = field('message');
  if (!name || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || phone.length > 80 || !product || product.length > 200 || message.length > 5000) {
    return json({ error: 'Zkontrolujte prosím jméno, e-mail, produkt a délku zprávy (nejvýše 5 000 znaků).' }, 400);
  }

  const endpoint = env.FORMSPREE_ENDPOINT?.trim();
  if (!endpoint || !/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) {
    return json({ error: 'Formulář nyní není dostupný. Zkuste to prosím později nebo nám zavolejte.' }, 503);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'origin': origin,
        'referer': `${origin}/kontakt`,
      },
      body: JSON.stringify({ name, email, phone, product, message, subject: `Poptávka z webu — ${product}` }),
      signal: AbortSignal.timeout(15_000),
      redirect: 'error',
    });
    const result = await response.json().catch(() => null) as { ok?: boolean } | null;
    if (!response.ok || result?.ok !== true) {
      return json({ error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím později nebo nám zavolejte.' }, 502);
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'Odeslání se nepodařilo potvrdit. Zkuste to prosím později nebo nám zavolejte.' }, 502);
  }
}
