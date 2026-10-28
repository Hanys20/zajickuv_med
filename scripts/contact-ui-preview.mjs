// Isolated UI fixture: NEVER deploy. Does not load Turnstile or send/store real messages.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const widget = `window.turnstile = {
  render(container, options) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = 'Testovací ověření (mock)';
    button.style = 'padding:12px;border:1px solid currentColor;max-width:100%';
    button.onclick = () => { options.callback('local-mocked-token'); button.textContent = 'Ověřeno (mock)'; };
    container.append(button); window.__qaWidget = {container, options}; return 'qa-widget';
  },
  reset() { window.__qaWidget.options['expired-callback'](); window.__qaWidget.container.querySelector('button').textContent = 'Testovací ověření (mock)'; },
  remove() { window.__qaWidget?.container.replaceChildren(); }
};`;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:8799');
  const json = (status, data) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
  if (url.pathname === '/__mock/turnstile.js') {
    res.writeHead(200, { 'content-type': types['.js'] }); res.end(widget); return;
  }
  if (url.pathname === '/api/contact-config') { json(200, { siteKey: 'local-ui-fixture' }); return; }
  if (url.pathname === '/api/public/availability') { json(200, []); return; }
  if (url.pathname === '/api/contact' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 32768) { json(413, {}); return; } }
    const data = JSON.parse(raw);
    await new Promise((done) => setTimeout(done, 1500));
    if (data.message.includes('chyba')) json(503, { error: 'Testovací chyba: zpráva nebyla přijata.' });
    else if (data.message.includes('nepotvrzeno')) json(200, { ok: true });
    else json(202, { ok: true, accepted: true, id: data.submissionId });
    return;
  }
  if (url.pathname.startsWith('/api/')) { json(404, {}); return; }
  try {
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index';
    let path = resolve(root, relative);
    if (!path.startsWith(resolve(root) + sep)) throw new Error();
    if (!extname(path)) path += '.html';
    let content = await readFile(path);
    if (['.html', '.js'].includes(extname(path))) {
      content = Buffer.from(content.toString('utf8')
        .replaceAll('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', '/__mock/turnstile.js')
        .replace(/src="https:\/\/www\.google\.com\/maps[^\"]*"/g, 'src="about:blank"'));
    }
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(8799, '127.0.0.1', () => console.log('Mock UI only; no messages sent: http://127.0.0.1:8799/kontakt'));
