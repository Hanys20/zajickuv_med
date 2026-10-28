# Zajíčkův med – web na míru

Paměťový soubor pro práci na projektu. Čti před zahájením jakékoli práce, aktualizuj při zásadních rozhodnutích.

## Přehled projektu

- **Klient / firma:** Zajíčkův med, kontaktní osoba a majitel Pavel Zajíček.
- **Charakter:** Prodej přebytků medu a včelích produktů ze dvora – **bez IČO**, nejedná se o formální podnikání.
- **Lokalita:** Opava-Podvihov (Raduňská 5/20, 747 06), Moravskoslezský kraj. Na trhu 20+ let, cca 40 včelstev na stanovištích u Libavé a na úpatí Nízkého Jeseníku (200–550 m n. m.).
- **Stávající web (nahrazujeme):** https://www.zajickuv-med.cz/ – použít jen jako doplňkový zdroj. **Texty a ceny, které klient zaslal přímo, mají vždy přednost před starým webem** – starý web může obsahovat neaktuální informace.
- **Cíl webu:** prodej medu/produktů online (přes kontaktní formulář + telefon/WhatsApp, ne e-shop s platbou), informovat o cenách/produktech/značce, zpřístupnit nákup i mladší generaci (25+), ne jen dosavadním zákazníkům 60+.
- **Nejhodnotnější akce návštěvníka:** objednávka medu / vyplnění kontaktního formuláře.
- **Diferenciace vůči konkurenci:** šetrné metody zacházení se včelami, přírodní materiály na úlech, vlastní uzavřený koloběh vosku, rodinná tradice – vyzdvihnout v sekci O farmě.
- **3 slova, kterými by klient popsal firmu:** osobní přístup, kvalita, dobré ceny.

## Kontakty

- **E-mail:** info@zajickuv-med.cz
- **Telefon / WhatsApp:** +420 603 162 501
- **Adresa:** Raduňská 5/20, 747 06 Opava-Podvihov
- **Sociální sítě:** Facebook a Instagram se teprve zakládají (stav 2026-07-20) – zatím bez odkazů, doplnit později. Ikony FB/IG/WhatsApp musí být na webu připravené.
- **Správce domény (současný):** Radim Steuer, GDstudio – +420 720 775 722 / +420 777 107 235, steuer@gdstudio.cz. Potřeba získat přístupy a přesměrovat DNS na nasazený Cloudflare Worker (viz Tech stack).
- Strukturovaně viz `content/settings/site.json`.

Podrobné Q&A a otevřené úkoly směrem ke klientovi: [client-materials/qa-klient.md](./client-materials/qa-klient.md).

## Tech stack (rozhodnuto 2026-07-20, admin systém přepracován 2026-07-21)

- **Framework:** Next.js, `output: 'export'` (statický export).
- **Admin systém:** vlastní řešení na míru (ne TinaCMS – viz "Proč ne TinaCMS" níže). Cloudflare D1 databáze (`zajickuv-med-admin`) + Cloudflare Worker (`worker/worker.ts`), který zároveň servíruje statický web (`env.ASSETS`) i vlastní API (`/api/...`). Admin UI na `/admin` (`src/app/admin/page.tsx`) – přihlášení uživatelské jméno/heslo (žádný e-mail, žádné OAuth) a 3 záložky: Aktuality, Dostupnost, Ceník.
  - **Přihlášení:** PBKDF2-SHA256 hash hesla (100 000 iterací, sůl) v tabulce `admin_user`; po přihlášení session token v httpOnly cookie `session` (30 dní), session záznamy v tabulce `sessions` – logout je v D1 skutečně maže (ne jen cookie v prohlížeči).
  - **Editovatelné jen:** aktuality (web vždy zobrazí nejnovější podle data), dostupnost medů i ostatních produktů (skladem/vyprodáno), ceny v ceníku (jen částky – velikosti/názvy needitovatelné). Nic jiného klient přes admin needituje.
  - **Zabezpečení je záměrně odlehčené** – klientovo rozhodnutí, na webu nejsou citlivá data: žádné 2FA, rate limiting ani reset hesla e-mailem. Hash hesla + httpOnly cookie je bráno jako nutné minimum (aby šel web triviálně "zdefacovat"), ne jako "extra" bezpečnost navíc.
  - Ostatní obsah (texty stránek, popisy produktů, FAQ, prodejní místa, nastavení) zůstává v `content/` a edituje se přímo v repozitáři – viz sekce Obsah níže.
- **Databáze:** Cloudflare D1 (`zajickuv-med-admin`, `database_id` v `wrangler.worker.jsonc`). Schéma v `worker/schema.sql`, výchozí data pro lokální vývoj v `worker/seed.sql` (`npx wrangler d1 execute zajickuv-med-admin --local --file=worker/schema.sql` a stejně pro seed.sql).
- **Hosting:** Cloudflare Workers (statické assety z `out/` + Worker skript), nasazeno přes `npx wrangler deploy` (vyžaduje `wrangler login`). Aktuálně běží na testovací `zajickuv-med.jan-kielkovsky.workers.dev` – napojení na `zajickuv-med.cz` čeká na přístupy od GDstudio (viz Kontakty výše). **Nepoužívat Cloudflare Pages** – existoval k tomu automaticky napojený (Git integrace) Pages projekt `zajickuv-med.pages.dev`, který se přebuildovával při každém pushi, ale servíroval jen statický web bez Worker API/D1 (přihlášení do `/admin` tam nefungovalo). 2026-07-21 jsme ho smazali, ať nevzniká matoucí druhá "poloviční" URL – jediná živá adresa je ta workers.dev výše.
- **Repozitář:** GitHub (`Hanys20/zajickuv_med`), `main` branch.
- **Styling:** Tailwind CSS, prozatímní medová paleta.

### Proč ne TinaCMS

Tina byla původně naplánovaný a reálně zprovozněný CMS (napojený na Tina Cloud, se zúženým schématem – jen aktuality, ceny, dostupnost). Po vyzkoušení klient preferoval jednodušší vlastní řešení: bez závislosti na externí platformě a jejím účtu/limitům, s plnou kontrolou nad jednoduchostí admin rozhraní pro netechnického uživatele. 2026-07-21 jsme na klientovo přání Tinu z projektu úplně odstranili (`tina/` složka, `tinacms`/`@tinacms/cli` závislosti, `public/admin` bundle) a nahradili vlastním systémem popsaným výše. Adminovi se od té doby říká `/admin` (dřív tam byla Tina, teď vlastní systém).

### Stav scaffoldingu (aktualizováno 2026-07-21)

Next.js aplikace odpovídá wireframu (`wireframes/index.html`) — `output: 'export'`, App Router, TypeScript, Tailwind CSS s prozatímní medovou paletou. Ikony pro karty/kontakty jsou zkopírované z `client-materials/Ikony` do `public/images/icons` (ASCII názvy). Produktové karty používají reálné fotky dodané klientem v `client-materials/Fotky/Vcely/`, zpracované do `public/images/photos/`. Logo je zatím jen textové + ikona včely, čeká na finální grafiku.

Vlastní admin systém (D1 + Cloudflare Worker, popsáno výše) je hotový, otestovaný lokálně (`npx wrangler dev`) i naostro nasazený a ověřený. Homepage sekce Aktuality, Dostupnost produktů a Ceník si po načtení tiše donačtou živá data z D1 přes `/api/public/*`, s fallbackem na build-time obsah z `content/` pro případ výpadku API.

Zbývá:
1. Získat přístupy k doméně `zajickuv-med.cz` od GDstudio (Radim Steuer) a přesměrovat DNS na nasazený Cloudflare Worker.
2. Kontaktní formulář je aktivní přes `POST /api/contact`, nativní Cloudflare send_email binding, Turnstile a CONTACT_DB. Po požadovaném předání dvěma klientským příjemcům běží verze `676a0c9b-2c87-4c84-b161-7a2f52df319d`, každý příjemce má vlastní stav v D1. info@ vede přes samostatný email Worker. Renata je ověřená, Pavel čekal na potvrzení. Vývojář již není příjemcem. Cron úklidu/retry je každých 15 minut; detaily viz `docs/predani-emailu-klientovi.md`.
3. Doladit barevnou paletu, jakmile klient dodá finální design.
4. Nastavit trvalé přihlašovací údaje do `/admin` pro Pavla (aktuální jsou vygenerované testovací, heslo v plaintextu není nikde v repozitáři).

## Cílová skupina a UX priority

- **Současní zákazníci:** muži a ženy 60+, většinou znají firmu z doporučení nebo (nově) ze sociálních sítí.
- **Cíl:** rozšířit i na 25+ generaci → **mobile-first návrh je primární**, desktop musí být plně funkční, ale mobil je hlavní use case.
- Web musí být jednoduše čitelný a použitelný i pro méně technicky zdatné starší uživatele (velké tlačítka, jasná navigace, žádné skryté komplikované interakce).

## Sitemap / struktura webu

1. **Domů (`/`)** – hero, teaser příběhu s proklikem na O farmě, "Proč si vybrat med od nás" (4 karty + "20+ let zkušeností"), produktový karusel s proklikem na ceník, zkrácený ceník, teaser recenzí, zkrácené FAQ, aktuality (mění se ~2×/rok), kontaktní formulář + mapa.
2. **O farmě (`/o-farme`)** – historie rodiny (časová osa), "co je pro nás důležité" (5 kartiček), detailní popis metod včelaření, péče o zdraví včel, koloběh vosku. Viz `content/pages/o-farme.md`.
3. **Nabídka (`/#nabidka`)** – sekce na homepage: med, propolis, vosk a motané svíčky, vyzimované včelstvo, vyzimovaný a letní oddělek. Kategorie mají samostatné carousely s reálnými fotografiemi.
4. **Ceník (`/#cenik`)** – sekce na homepage. Dárkové balení medu následuje hned po medech. Vosk, svíčky a tři typy včelstev mají uvedené ceny editovatelné v administraci. Nový katalog má `catalogVersion: 2`; Worker při čtení starších dat z D1 zachová dříve editované ceny medu, propolisu a dárkových balení a doplní nové položky.
5. **Kontakt (`/kontakt`)** – rozšířená verze kontaktní sekce z homepage: kontaktní formulář (vč. výběru produktů), mapa Opava-Podvihov, prodej na Kozí farmě Magdaléna a rozvoz po Opavě a Studénce.
6. **FAQ (`/faq`)** – plný seznam otázek, viz `content/faq/faq.json`.

Menu: Domů, O farmě, Nabídka (odkazy na sekce homepage: Med, Propolis, Vosk & svíčky, Včelí oddělky a včelstva), Ceník (sekce homepage), FAQ, Kontakt.

## Obsah – zdroje pravdy

Aktuality, dostupnost všech produktů a ceny jsou v Cloudflare D1 a edituje je klient přes `/admin` (viz Tech stack). Zbytek obsahu zůstává v `content/` a edituje se přímo v repozitáři – žádný z těchto souborů přes admin needituje klient.

- `content/pages/` – texty stránek Domů, O farmě, Kontakt (Markdown, frontmatter + tělo).
- `content/products/` – jednotlivé druhy medu a propolisové produkty (název, kategorie, velikosti, krátký + plný popis). Pole `availability` v těchto souborech je jen build-time fallback – skutečnou dostupnost všech produktů edituje klient v `/admin` (D1 tabulka `honey_availability`, historický název tabulky).
- `content/pricing/cenik.json` – needitovatelná pole ceníku (velikosti, názvy, medovina, poznámky) + build-time fallback cen. Skutečné ceny edituje klient v `/admin` (D1 tabulka `pricing`).
- `content/faq/faq.json` – otázky a odpovědi.
- `content/sales-points/sales-points.json` – prodejní místa a rozvoz.
- `content/settings/site.json` – kontakty, sociální sítě, SEO lokality, nastavení cookies/analytics, stav recenzí, kontakt na správce domény.
- `content/news/` – needitovatelný build-time fallback aktualit. Skutečné aktuality edituje klient v `/admin` (D1 tabulka `news`) – web vždy zobrazí nejnovější podle data.
- Recenze na homepage se načítají z Google Places API (New) přes Worker `/api/public/reviews`. Provozovna na Google Maps existuje; k aktivaci živých recenzí chybí Worker secret `GOOGLE_PLACES_API_KEY`. Bez klíče je v sekci přímý odkaz na profil. Postup viz `docs/google-reviews.md`.
- `client-materials/` – syrové podklady od klienta, TODO seznam otevřených bodů, prostor pro design inspiraci a fotky až dorazí.
- `worker/schema.sql`, `worker/seed.sql` – schéma a výchozí data D1 databáze pro lokální vývoj. Produkční databázi spravuje klient přes `/admin`, ne přímo SQL.

## Design direction (design/mockupy klient dodá později, tohle jsou zadané mantinely)

- **Barvy:** žlutá a medová jako hlavní, kombinace s černou, bílou, případně hnědou.
- **Styl:** jednoduchý, elegantní, minimalistický, čistý; přírodní/organický, ale zároveň hravý, barevný a dobře čitelný. Inspirace akvarelovým stylem, motiv květin.
- **Fonty:** žádné přemrštěné/ozdobné fonty – dobrá čitelnost na prvním místě.
- Design mockupy klient zpracuje a dodá později – wireframe (níže) vzniká nezávisle na finálním vizuálu.

## Klíčové UX/marketingové prvky (musí být ve finálním webu)

- Sticky (přilepené) menu, konzistentní tlačítka/odkazy, opakované ale ne přehnané CTA napříč sekcemi.
- Hero sekce s jasným sdělením a kvalitní fotkou.
- Tlačítko "zpět nahoru" při scrollování.
- Patička: kontakty, rychlé odkazy, sociální ikony (FB/IG/WhatsApp).
- Google mapa a odkaz na existující profil provozovny Zajíčkův med na Google Maps.
- Lazy loading obrázků na homepage i podstránkách.
- Recenze zákazníků z Google Places API (New) po nastavení API klíče; do té doby odkaz na profil.
- Kontaktní formulář s **výběrem produktů vč. zobrazené dostupnosti** (skladem/vyprodáno) – editovatelné klientem v adminu.
- Cookie/analytics consent (klient chce sledovat návštěvnost).

## SEO lokality (do metadat i textu)

Ostrava, Opava, Podvihov, Moravskoslezský kraj, Studénka.

## Otevřené body (blokující nebo čekající na klienta)

Viz živý seznam v [client-materials/qa-klient.md](./client-materials/qa-klient.md) – zejména: přístupy k doméně, odkazy na FB/IG, Google Places API klíč pro živé recenze, aktuální dostupnost jednotlivých medů, fotografie, design inspirace.

## Doporučený další postup

1. Získat přístupy k doméně a DNS od GDstudio, napojit `zajickuv-med.cz` na nasazený Cloudflare Worker (viz Tech stack a Stav scaffoldingu výše).
2. Až dorazí finální design inspirace od klienta → doladit barevnou paletu.
3. Nakonfigurovat nový Cloudflare kontaktní formulář podle `docs/contact-form.md`, ověřit skutečný hosting a po schválení nasazení/testovacího e-mailu ověřit doručení. Stávající Email Routing ani DNS se nemění.
4. Nastavit klientovi trvalé přihlašovací údaje do `/admin` (aktuální jsou testovací/vygenerované).

## Vzhled kontaktního e-mailu – nasazeno 2026-10-28

Následně uživatel výslovně požádal o test na vlastní adresu. Jediný pokus přes nativní remote binding Cloudflare skončil `temporary delivery failure` bez messageId, souběžné workerd síťové chyby. Neopakovat tento pokus naslepo; stav `.wrangler/contact-format-one-email-test.json`. Opakované hledání Gmailu zprávu nenašlo. Náhled stejné šablony s jasně označenými fiktivními údaji byl následně odeslán přes autorizovaný Gmail uživateli samotnému; ID `1a1833d62934bedb`, INBOX potvrzen v odpovědi konektoru. Předmět `TEST vzhledu e-mailu – Zajíčkův med (náhled)`. Tento náhled nepotvrzuje aktuální odesílání přes Cloudflare. Produkční secrets, příjemci, routing ani D1 nebyly při testu změněny.

Novější aktivní verze Workeru je `67804ed1-7402-42c9-81ce-65830f204cc3`, deployment `b3807b1d-a433-46b2-9a90-fd418f5902bb`, 100 % provozu. `formatContactEmail` v `worker/contact.ts` sdílí šablonu pro oba transporty: medové barvy, kontakty, produkt, zpráva se zachovanými řádky, odkaz k odpovědi, datum Europe/Prague a malé ID v patičce. Všechny vložené hodnoty jsou escapované; zůstává textová alternativa i Reply-To. Náhled s fiktivními údaji generuje `node scripts/contact-email-preview.mjs` do `docs/nahled-kontaktniho-emailu.html`. Prošlo 43 kontrol a TypeScript; aktivace, HTTP, zachování routingu, cronu a Google secretu ověřeny. Příjemci zůstávají z předání níže. Žádný nový testovací e-mail neodeslán. Vizuální kontrola browseru byla blokována nástrojem kvůli nemožnosti určit aktuální URL; HTML náhled proto není screenshot z poštovního klienta. Výsledek v `.wrangler/contact-format-result.json`.

## Kontaktní formulář – lokální implementace 2026-10-28

Na výslovnou žádost uživatele je připravena také varianta Pages Functions. Standardní `wrangler.jsonc` je nyní pro Pages (CLI nepodporuje vlastní cestu konfigurace Pages); původní konfigurace Workeru je v `wrangler.worker.jsonc`. Skripty `npm run deploy` a `worker:dev` nadále používají původní Worker výslovným --config. Historické rozhodnutí výše nepoužívat Pages popisuje předchozí stav; nová varianta je autorizovaná aktuálním zadáním. Skutečný hosting domény je nutné ověřit v účtu. Žádný deploy, produkční migrace, změny DNS/routingu ani skutečný testovací e-mail v této implementaci neproběhly. Samostatné příkazy wrangler dev/deploy/secret pro původní Worker nyní vyžadují `--config wrangler.worker.jsonc`.

Kontakt je na homepage i /kontakt ve stejné komponentě. Secrets/cílová schránka zůstávají serverové; veřejný endpoint vrací jen Turnstile Site Key. CLI `scripts/contact-manage.mjs` nabízí list/show/retry/resolve/cleanup bez veřejného adminu. Zprávy s nejasným výsledkem (timeout/pád po odeslání) se slepě znovu neposílají. Pages vyžaduje samostatný retenční cron Worker nebo plánované CLI cleanup; hlavní Worker má vlastní daily cron. Backend má automatické kontroly; browser UI kontrola nebyla dostupná kvůli blokaci URL kontroly nástroje.

### Příprava účtu po autorizovaném přihlášení (2026-10-28)

Skutečný hosting byl ověřen přes API: domény zajickuv-med.cz a www.zajickuv-med.cz obsluhuje Worker zajickuv-med. Stávající info@ routing je aktivní a cíl je ověřený. Nová kontaktní D1 zajickuv-med-contact má ID 9d3b249d-a2f3-427c-b822-587d7a6eacb4; první migrace byla aplikována pouze na tuto novou databázi. Je vytvořen Managed Turnstile widget pro oba hostname. Veřejné hodnoty a D1 bindingy jsou v konfiguraci; tři soukromé runtime hodnoty jsou pouze v ignorovaném .wrangler/contact-runtime-secrets.json. Nikdy nevypisovat ani commitovat.

Pro skutečný Worker je přidán nativní CONTACT_EMAIL send_email binding, který odesílá strukturovaný e-mail na ověřenou cílovou adresu bez API tokenu. REST varianta zůstává pro Pages a lokální správcovský retry (ten samostatný token vyžaduje). Nové odpovědi bindingu mají stav queued a provider messageId; timeout a nejasné výsledky se nikdy slepě neopakují. Prošlo 35 backend kontrol s mocky. Produkční aktivace ani skutečný testovací e-mail nejsou autorizované; DNS a Email Routing se nemění.

Do Cloudflare je nahrána neaktivní verze `6f53627c-5657-4934-bad0-1db6a5731b5b` (contact-ready) včetně tří secrets. Produkce byla po uploadu ověřena beze změny (deployment `0de95443-bcb7-44f5-9bab-e78e367ecb94`), stejně jako email routing a zachování původního Google API secretu v kandidátu. Kontaktní DB je prázdná. Celkem 35 backend kontrol + 1 integrační Pages test prošlo. Retenční cron musí být po schválení aktivován samostatně, ideálně jen přes Worker schedules API, aby se neměnily domény/routing. Stav v `.wrangler/contact-release.json`.

### Produkční aktivace a ověření po souhlasu uživatele (2026-10-28)

Aktuální nastavení příjemců a postup předání jsou v `docs/predani-emailu-klientovi.md`. Routing a formulář jsou nezávislé; nyní oba podporují dva klientské příjemce přes secrets. Viz novější záznam předání níže; starší popis jediného příjemce již neplatí.

Uživatel schválil aktivaci i jeden testovací e-mail zprávou „Ok zkus to“. Verze `6f53627c-5657-4934-bad0-1db6a5731b5b` byla aktivována na 100 % (deployment `e6923f08-ce6e-45df-8998-24657114b856`). Cron `17 2 * * *` byl zapnut pouze přes Worker schedules API. HTTP kontroly webu/API prošly včetně odmítnutí neplatného Turnstile tokenu (403) a GET kontaktu (405).

Jeden označený test e-mailu byl uložen do D1 a odeslán stejnou sendStoredMessage funkcí přes oficiální getPlatformProxy s remote bindingy, bez veřejného test endpointu a bez oslabení antispamu. Záznam `4bb9dda3-40ba-4806-b61b-c3760c80594a`, jeden pokus. Připojený Gmail potvrdil zprávu v INBOX dle konkrétního Message-ID a X-Contact-ID; SPF i DKIM pass, multipart/alternative a Reply-To ověřené v metadatech. Po potvrzení je D1 stav sent. Nešlo o pozitivní browser průchod Turnstile; ten zůstává samostatnou UI kontrolou. DNS a routing rules byly po dokončení ověřeny beze změn. Žádný další testovací e-mail neodesílat bez další autorizace. Stav v `.wrangler/contact-live-state.json` a `.wrangler/contact-one-email-test.json`.

### Předání dvěma klientským příjemcům (2026-10-28)

Uživatel výslovně požádal o nasazení doručování pro Renatu a Pavla a odebrání své adresy. Oba seznamy jsou jako JSON secrets: CONTACT_TO_EMAIL u hlavního Workeru a FORWARD_TO_EMAILS u zajickuv-med-email-forward. Přesné adresy jsou pouze v Cloudflare a ignorovaných lokálních secrets souborech. Renata byla ověřená, Pavel v době předání pending; musí sám potvrdit ověřovací e-mail. Po potvrzení se nové zprávy automaticky doručují i jemu. Není potřeba další změna konfigurace.

Webová verze 676a0c9b-2c87-4c84-b161-7a2f52df319d běží na 100 procent (deployment 182c0545-5a13-41c8-9944-ea35b8d49807). Nová migrace 0002_recipient_deliveries.sql sleduje doručení samostatně, zabraňuje duplicitám úspěšného příjemce a izoluje nejasné výsledky. Cron */15 * * * * provádí úklid a retry jen pending kopií aktuálních příjemců, nejvýše dvě zprávy za běh. info@ pravidlo d883e1fa82e84dac8fc7c527e44c3c43 nyní směřuje na zajickuv-med-email-forward; source worker/email-forward.ts, config wrangler.email-forward.jsonc, verze ab24335b-d53b-4fe9-b741-0aa936a24e18. Jeho forwardy jsou nezávislé, neověřený cíl neblokuje ověřený. Starší běžná pošta se zpětně nedoposílá.

Vývojářova adresa již není v aktivních cílech tohoto webu; jeho account-wide Destination Address nebyla odstraněna. Catch-all, ostatní pravidla a DNS nebyly změněny. Google secret zachován. Prošlo 43 backend/forwarding kontrol a 1 Pages integrační test; produkční HTTP kontroly prošly. Nebyly odeslány žádné nové skutečné testovací e-maily klientům. Výsledek v .wrangler/contact-handover-result.json, aktuální návod docs/predani-emailu-klientovi.md.
