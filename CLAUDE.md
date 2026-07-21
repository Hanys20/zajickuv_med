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
- **Správce domény (současný):** Radim Steuer, GDstudio – +420 720 775 722 / +420 777 107 235, steuer@gdstudio.cz. Potřeba získat přístupy a přesměrovat na Cloudflare Pages.
- Strukturovaně viz `content/settings/site.json`.

Podrobné Q&A a otevřené úkoly směrem ke klientovi: [client-materials/qa-klient.md](./client-materials/qa-klient.md).

## Tech stack (rozhodnuto 2026-07-20)

- **Framework:** Next.js, `output: 'export'` (statický export).
- **CMS:** TinaCMS + Tina Cloud, přihlášení e-mailem/heslem (ne GitHub OAuth). Admin dostupný na `/admin`. Obsah se ukládá zpět do repozitáře na GitHubu přes Tina Cloud.
- **Hosting:** Cloudflare Pages.
- **Repozitář:** GitHub (zatím lokálně bez `git init` – založit při prvním scaffoldingu).
- **Styling:** zatím nerozhodnuto v detailu – výchozí předpoklad Tailwind CSS (běžná volba pro Next.js, snadné téma pro žluto-medovou paletu), potvrdit až se bude dělat skutečný scaffolding.
- Klient v adminu edituje: ceník, aktuality, dostupnost jednotlivých druhů medu (skladem/vyprodáno).

### Stav scaffoldingu (aktualizováno 2026-07-20)

Next.js aplikace je naběhlá a odpovídá wireframu (`wireframes/index.html`) — `output: 'export'`, App Router, TypeScript, Tailwind CSS s prozatímní medovou paletou. Obsah (produkty, ceník, FAQ, prodejní místa, nastavení) se čte přímo ze souborů v `content/` (produkty přes `gray-matter`, ostatní jako JSON import), takže content zůstává jediným zdrojem pravdy. Ikony pro karty/kontakty jsou zkopírované z `client-materials/Ikony` do `public/images/icons` (ASCII názvy). Fotky jsou zatím schematické placeholdery (`.imgph` bloky) – nahradit až dorazí reálné podklady od klienta. Logo je zatím jen textové + ikona včely, čeká na finální grafiku.

Zbývá:
1. Inicializovat Tina (`npx @tinacms/cli init`) a napojit na Tina Cloud, nadefinovat schema kolekcí podle `content/` (products, pricing, faq, news, pages, settings, sales-points) – teď je obsah hardcodovaný v komponentách/JSON, ne editovatelný klientem.
2. `git init`, první commit, založit GitHub repo, napojit Cloudflare Pages.
3. Kontaktní formulář zatím jen otevře e-mailového klienta (mailto:) s předvyplněnou zprávou – bez backendu. Až budeme mít Cloudflare Pages, zvážit Pages Function / Formspree apod. pro reálné odeslání.
4. Nahradit placeholder fotky a barevnou paletu, jakmile klient dodá design/fotky.

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

- `content/pages/` – texty stránek Domů, O farmě, Kontakt (Markdown, frontmatter + tělo).
- `content/products/` – jednotlivé druhy medu a propolisové produkty (název, kategorie, dostupnost, velikosti, krátký + plný popis).
- `content/pricing/cenik.json` – ceník platný od 15. 7. 2025 (med je cenově stejný napříč druhy, liší se jen velikostí balení; zvlášť propolis, dárková balení, zmínka o medovině bez ceny).
- `content/faq/faq.json` – otázky a odpovědi.
- `content/sales-points/sales-points.json` – prodejní místa a rozvoz.
- `content/settings/site.json` – kontakty, sociální sítě, SEO lokality, nastavení cookies/analytics, stav recenzí, kontakt na správce domény.
- `content/news/` – aktuality (zatím prázdné, doplní klient/agentura, mění se cca 2×/rok).
- `content/reviews/` – recenze (zatím prázdné – žádná provozovna, žádné Google recenze; naplánováno napojení na Google recenze, až vznikne provozovna na mapách).
- `client-materials/` – syrové podklady od klienta, TODO seznam otevřených bodů, prostor pro design inspiraci a fotky až dorazí.

Tyto content soubory jsou zamýšlené jako budoucí Tina kolekce (1:1 mapování na CMS schema).

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

1. **Wireframe celého webu** (low-fi, mobile-first i desktop) – další krok v této session, nezávislý na finálním designu.
2. Až dorazí design inspirace od klienta → aplikovat barevnou paletu a styl na wireframe / přejít do reálného UI.
3. Scaffolding Next.js + Tina (viz sekce Tech stack výše) až bude jasná struktura z wireframu.
