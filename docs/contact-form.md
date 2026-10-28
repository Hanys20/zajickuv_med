# Kontaktní formulář

Homepage i `/kontakt` používají `ContactForm.tsx`. Tlačítko odešle JSON na
`POST /api/contact`; Cloudflare Worker předá zprávu do Formspree. Návštěvník
zůstane na webu a uvidí potvrzení nebo chybu. Po chybě zůstávají údaje vyplněné.
Zprávy se neukládají do D1 ani do aplikačních logů.

## Stav ověření (2026-10-28)

Endpoint `https://formspree.io/f/xzeegrzk` je nakonfigurovaný a nasazený na
`https://zajickuv-med.jan-kielkovsky.workers.dev` (verze
`ffc00df6-411f-4781-bd6f-d8ba92d11814`). Produkční build a všech šest
automatických kontrol prošly. Nasazená stránka `/kontakt` vrací HTTP 200
a obsahuje formulář; API odmítne nevyplněnou zprávu stavem HTTP 400.
Při kontrole nebyl odeslán e-mail. Přijetí skutečné poptávky ve Formspree
a doručení do cílové schránky zbývá ověřit.

## Aktivace

1. Formulář používá endpoint `https://formspree.io/f/xzeegrzk` dodaný majitelem projektu.
   Není potřeba zakládat nový účet ani API klíč.
2. Ve Formspree ověřte příjemce `info@zajickuv-med.cz` a jeho aktivaci. Cloudflare
   Email Routing pak příchozí e-mail předá na nastavené osobní schránky.
3. Adresa je nastavená jako Worker binding `FORMSPREE_ENDPOINT` v sekci `vars`
   souboru `wrangler.jsonc`. Jde o veřejnou adresu formuláře, nikoli API klíč.
   Nastavení se použije při lokálním spuštění Workeru i při nasazení;
   není potřeba `NEXT_PUBLIC_*` proměnná při buildu.
4. V nastavení Formspree zkontrolujte **Spam protection**. Tato integrace nemá CAPTCHA
   widget; pokud formulář vyžaduje reCAPTCHA, před aktivací je nutné doplnit widget
   s ověřením, nebo v účtu tuto volbu vypnout. Skryté antispamové pole je součástí webu.
   Případné omezení domén musí zahrnovat používanou doménu webu.
5. Nasaďte aplikaci příkazem `npm run deploy`.
6. Odešlete jednu označenou testovací poptávku z nasazené stránky. Ověřte úspěch
   na webu, záznam ve Formspree a doručení do osobních schránek včetně případného spamu.
   Odpověď na doručený e-mail má směřovat zákazníkovi (Formspree používá pole `email`
   jako Reply-To).

Bez platného endpointu API vrací 503 a formulář oznámí nedostupnost; nepotvrdí
falešné odeslání ani neotevře e-mailovou aplikaci. Samotné nastavení Cloudflare
Email Routing zprávy z formuláře neodesílá.

## Lokální kontrola

Pro místní vývoj spusťte `npm run build`, potom `npm run worker:dev`.
Endpoint se načte z `wrangler.jsonc`; případný ignorovaný `.dev.vars` jej může
přepsat pomocí `FORMSPREE_ENDPOINT=...`. Next.js dev server sám
Worker API neobsluhuje. Skutečný endpoint při ručním odeslání odešle skutečný e-mail.

Automatické kontroly používají mock Formspree a nic neodesílají:
`node --test worker/contact.test.mjs worker/contact.runtime.test.mjs` (Node.js 22.18+).
Runtime test spouští skutečný Workers runtime přes Miniflare s mockovaným Formspree;
ověřuje přijetí zprávy i odmítnutí přesměrování bez následování cílové adresy.

### Oprava kompatibility s Workers

Původní odesílání používalo `redirect: 'error'`. Cloudflare Workers tento režim
nepodporuje a vyhodí výjimku ještě před odesláním požadavku. Node.js testy s mockovaným
`fetch` rozdíl runtime nezachytily. Odesílání nyní používá `redirect: 'manual'`;
případná odpověď 3xx neprojde kontrolou `response.ok` a nepotvrdí falešný úspěch.
Regresní runtime test před opravou reprodukoval HTTP 502 se stejnou chybou jako na webu.
Po opravě prošlo všech sedm kontrol. Oprava je nasazená ve verzi
`8bb54765-e385-42a2-9655-8417fc400c0e`. Doručení do cílové schránky tímto testem
ověřené není, protože runtime test používá simulované Formspree.
Viz [dokumentace Request v Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/request/).

Dokumentace: [odesílání bez přesměrování](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax),
[pole pro odpověď a předmět](https://help.formspree.io/articles/building-your-form/special-fields),
[Cloudflare Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/).
