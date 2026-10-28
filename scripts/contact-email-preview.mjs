// Local preview using fictional data. Does not send email or access Cloudflare.
import { writeFile } from 'node:fs/promises';
import { formatContactEmail } from '../worker/contact.ts';

const preview = formatContactEmail({
  id: '00000000-0000-4000-8000-000000000000',
  created_at: Date.parse('2026-10-28T13:35:00Z') / 1000,
  fingerprint: 'preview', delivery_status: 'pending',
  name: 'Jana Novotná', email: 'jana.novotna@example.com', phone: '+420 000 000 000',
  product: 'Květový med',
  message: 'Dobrý den,\n\nměla bych zájem o 3 sklenice květového medu po 1 kg. Je prosím možné osobní vyzvednutí v Podvihově v pátek odpoledne?\n\nDěkuji a přeji hezký den.\nJana Novotná',
});
await writeFile(new URL('../docs/nahled-kontaktniho-emailu.html', import.meta.url), preview.html);
console.log('Náhled s fiktivními údaji: docs/nahled-kontaktniho-emailu.html');
