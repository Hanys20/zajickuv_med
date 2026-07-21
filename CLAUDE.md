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
- **Admin systém:** vlastní řešení na míru (ne TinaCMS – viz "Proč ne TinaCMS" níže). Cloudflare D1 databáze (`zajickuv-med-admin`) + Cloudflare Worker (`worker/worker.ts`), který zároveň servíruje statický web (`env.ASSETS`) i vlastní API (`/api/...`). Admin UI na `/admin` (`src/app/admin/page.tsx`) – přihlášení uživatelské jméno/heslo (žádný e-mail, žádné OAuth) a 3 záložky: Aktuality, Dostupnost medů, Ceník.
  - **Přihlášení:** PBKDF2-SHA256 hash hesla (100 000 iterací, sůl) v tabulce `admin_user`; po přihlášení session token v httpOnly cookie `session` (30 dní), session záznamy v tabulce `sessions` – logout je v D1 skutečně maže (ne jen cookie v prohlížeči).
  - **Editovatelné jen:** aktuality (web vždy zobrazí nejnovější podle data), dostupnost jednotlivých druhů medu (skladem/vyprodáno), ceny v ceníku (jen částky – velikosti/názvy needitovatelné). Nic jiného klient přes admin needituje.
  - **Zabezpečení je záměrně odlehčené** – klientovo rozhodnutí, na webu nejsou citlivá data: žádné 2FA, rate limiting ani reset hesla e-mailem. Hash hesla + httpOnly cookie je bráno jako nutné minimum (aby šel web triviálně "zdefacovat"), ne jako "extra" bezpečnost navíc.
  - Ostatní obsah (texty stránek, popisy produktů, FAQ, prodejní místa, nastavení) zůstává v `content/` a edituje se přímo v repozitáři – viz sekce Obsah níže.
- **Databáze:** Cloudflare D1 (`zajickuv-med-admin`, `database_id` v `wrangler.jsonc`). Schéma v `worker/schema.sql`, výchozí data pro lokální vývoj v `worker/seed.sql` (`npx wrangler d1 execute zajickuv-med-admin --local --file=worker/schema.sql` a stejně pro seed.sql).
- **Hosting:** Cloudflare Workers (statické assety z `out/` + Worker skript), nasazeno přes `npx wrangler deploy` (vyžaduje `wrangler login`). Aktuálně běží na testovací `*.workers.dev` doméně účtu vývojáře – napojení na `zajickuv-med.cz` čeká na přístupy od GDstudio (viz Kontakty výše).
- **Repozitář:** GitHub (`Hanys20/zajickuv_med`), `main` branch.
- **Styling:** Tailwind CSS, prozatímní medová paleta.

### Proč ne TinaCMS

Tina byla původně naplánovaný a reálně zprovozněný CMS (napojený na Tina Cloud, se zúženým schématem – jen aktuality, ceny, dostupnost). Po vyzkoušení klient preferoval jednodušší vlastní řešení: bez závislosti na externí platformě a jejím účtu/limitům, s plnou kontrolou nad jednoduchostí admin rozhraní pro netechnického uživatele. 2026-07-21 jsme na klientovo přání Tinu z projektu úplně odstranili (`tina/` složka, `tinacms`/`@tinacms/cli` závislosti, `public/admin` bundle) a nahradili vlastním systémem popsaným výše. Adminovi se od té doby říká `/admin` (dřív tam byla Tina, teď vlastní systém).

### Stav scaffoldingu (aktualizováno 2026-07-21)

Next.js aplikace odpovídá wireframu (`wireframes/index.html`) — `output: 'export'`, App Router, TypeScript, Tailwind CSS s prozatímní medovou paletou. Ikony pro karty/kontakty jsou zkopírované z `client-materials/Ikony` do `public/images/icons` (ASCII názvy). Fotky jsou zatím schematické placeholdery (`.imgph` bloky) – nahradit až dorazí reálné podklady od klienta. Logo je zatím jen textové + ikona včely, čeká na finální grafiku.

Vlastní admin systém (D1 + Cloudflare Worker, popsáno výše) je hotový, otestovaný lokálně (`npx wrangler dev`) i naostro nasazený a ověřený. Homepage sekce Aktuality, Dostupnost medů a Ceník si po načtení tiše donačtou živá data z D1 přes `/api/public/*`, s fallbackem na build-time obsah z `content/` pro případ výpadku API.

Zbývá:
1. Získat přístupy k doméně `zajickuv-med.cz` od GDstudio (Radim Steuer) a přesměrovat DNS na nasazený Cloudflare Worker.
2. Kontaktní formulář zatím jen otevře e-mailového klienta (mailto:) s předvyplněnou zprávou – bez backendu. Zvážit rozšíření Worker API o skutečné odeslání.
3. Nahradit placeholder fotky a barevnou paletu, jakmile klient dodá design/fotky.
4. Nastavit trvalé přihlašovací údaje do `/admin` pro Pavla (aktuální jsou vygenerované testovací, heslo v plaintextu není nikde v repozitáři).

## Cílová skupina a UX priority

- **Současní zákazníci:** muži a ženy 60+, většinou znají firmu z doporučení nebo (nově) ze sociálních sítí.
- **Cíl:** rozšířit i na 25+ generaci → **mobile-first návrh je primární**, desktop musí být plně funkční, ale mobil je hlavní use case.
- Web musí být jednoduše čitelný a použitelný i pro méně technicky zdatné starší uživatele (velké tlačítka, jasná navigace, žádné skryté komplikované interakce).

## Sitemap / struktura webu

1. **Domů (`/`)** – hero, teaser příběhu s proklikem na O farmě, "Proč si vybrat med od nás" (4 karty + "20+ let zkušeností"), produktový karusel s proklikem na ceník, zkrácený ceník, teaser recenzí, zkrácené FAQ, aktuality (mění se ~2×/rok), kontaktní formulář + mapa.
2. **O farmě (`/o-farme`)** – historie rodiny (časová osa), "co je pro nás důležité" (5 kartiček), detailní popis metod včelaření, péče o zdraví včel, koloběh vosku. Viz `content/pages/o-farme.md`.
3. **Produkty / ceník** – rozhodnout, zda samostatná stránka nebo jen sekce+scroll na homepage (klient inklinuje k druhé variantě – proklik + scroll na sekci na homepage). Název sekce zvážit jinak než "Naše produkty" kvůli medovině (viz `content/pricing/cenik.json` → `namingNote`), např. "Co u nás vzniká" / "Z naší včelí farmy".
4. **Kontakt (`/kontakt`)** – rozšířená verze kontaktní sekce z homepage: kontaktní formulář (vč. výběru medu s dostupností), mapa Opava-Podvihov, prodejní místa (Kozí farma Magdaléna – Štítina), rozvoz do Opavy a Studénky.
5. **FAQ (`/faq`)** – plný seznam otázek, viz `content/faq/faq.json`.

Menu: cca 5 položek (Domů, O farmě, Produkty/Ceník, FAQ, Kontakt).

## Obsah – zdroje pravdy

Aktuality, dostupnost medů a ceny jsou od 2026-07-21 v Cloudflare D1 a edituje je klient přes `/admin` (viz Tech stack). Zbytek obsahu zůstává v `content/` a edituje se přímo v repozitáři – žádný z těchto souborů přes admin needituje klient.

- `content/pages/` – texty stránek Domů, O farmě, Kontakt (Markdown, frontmatter + tělo).
- `content/products/` – jednotlivé druhy medu a propolisové produkty (název, kategorie, velikosti, krátký + plný popis). Pole `availability` v těchto souborech je jen build-time fallback – skutečnou dostupnost medů edituje klient v `/admin` (D1 tabulka `honey_availability`).
- `content/pricing/cenik.json` – needitovatelná pole ceníku (velikosti, názvy, medovina, poznámky) + build-time fallback cen. Skutečné ceny edituje klient v `/admin` (D1 tabulka `pricing`).
- `content/faq/faq.json` – otázky a odpovědi.
- `content/sales-points/sales-points.json` – prodejní místa a rozvoz.
- `content/settings/site.json` – kontakty, sociální sítě, SEO lokality, nastavení cookies/analytics, stav recenzí, kontakt na správce domény.
- `content/news/` – needitovatelný build-time fallback aktualit. Skutečné aktuality edituje klient v `/admin` (D1 tabulka `news`) – web vždy zobrazí nejnovější podle data.
- `content/reviews/` – recenze (zatím prázdné – žádná provozovna, žádné Google recenze; naplánováno napojení na Google recenze, až vznikne provozovna na mapách).
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
- Google mapa s odkazem na Opava-Podvihov, do budoucna oficiální provozovna na Google Maps.
- Lazy loading obrázků na homepage i podstránkách.
- Recenze zákazníků (zatím ručně vložené, později Google recenze).
- Kontaktní formulář s **výběrem medu vč. zobrazené dostupnosti** (skladem/vyprodáno) – editovatelné klientem v adminu.
- Cookie/analytics consent (klient chce sledovat návštěvnost).

## SEO lokality (do metadat i textu)

Ostrava, Opava, Podvihov, Moravskoslezský kraj, Studénka.

## Otevřené body (blokující nebo čekající na klienta)

Viz živý seznam v [client-materials/qa-klient.md](./client-materials/qa-klient.md) – zejména: přístupy k doméně, odkazy na FB/IG, ručně vybrané recenze pro spuštění, aktuální dostupnost jednotlivých medů, fotografie, design inspirace.

## Doporučený další postup

1. Získat přístupy k doméně a DNS od GDstudio, napojit `zajickuv-med.cz` na nasazený Cloudflare Worker (viz Tech stack a Stav scaffoldingu výše).
2. Až dorazí design inspirace / reálné fotky od klienta → nahradit placeholdery a doladit barevnou paletu.
3. Vyřešit skutečné odeslání kontaktního formuláře (zatím jen `mailto:`, bez backendu).
4. Nastavit klientovi trvalé přihlašovací údaje do `/admin` (aktuální jsou testovací/vygenerované).
