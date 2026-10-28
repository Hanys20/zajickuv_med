# Kontaktní formulář – Cloudflare (28. 10. 2026)

Změnu příjemce při předání klientovi popisuje samostatný
[návod na předání e-mailů](predani-emailu-klientovi.md). Je nutné změnit jak Email
Routing pro běžnou poštu, tak secret `CONTACT_TO_EMAIL` pro webový formulář.

**Aktuální předání klientům:** formulář nyní podporuje 1–5 příjemců jako JSON seznam
v secretu `CONTACT_TO_EMAIL`, každý s vlastním stavem v `contact_deliveries`. Běžná
pošta pro info@ jde přes Worker `zajickuv-med-email-forward` s JSON secretem
`FORWARD_TO_EMAILS`. Renata je ověřená; Pavel při konfiguraci ještě čekal na potvrzení.
Původní vývojářova adresa již není cílem tohoto webu. Přepnutí bylo výslovně požadované
uživatelem; DNS a Catch-all zůstaly zachované. Klientům nebyly odeslány nové testy.

## Stav a struktura projektu

**Aktuální stav: formulář je od 28. 10. 2026 aktivní v produkci po výslovném souhlasu
uživatele.** Byla odeslána jedna označená testovací zpráva a její doručení bylo
ověřeno v INBOX připojeného Gmailu. DNS ani Email Routing nebyly změněny.

Aktivní verze: `67804ed1-7402-42c9-81ce-65830f204cc3` na 100 % provozu,
deployment `b3807b1d-a433-46b2-9a90-fd418f5902bb`. Obsahuje přehlednější HTML i textovou
šablonu kontaktního e-mailu; [náhled s fiktivními údaji](nahled-kontaktniho-emailu.html)
generuje `node scripts/contact-email-preview.mjs` ze stejné funkce jako odesílání.
Datum používá Europe/Prague, kontakty jsou klikatelné, Reply-To zůstává návštěvník.
Úklid a bezpečné opakování pending
kopií spouští cron `*/15 * * * *` každých 15 minut, nastavený pouze přes Worker schedules API.
Byly ověřeny HTTP odpovědi homepage, kontaktu, konfigurace Turnstile,
admin auth a dostupnosti produktů. Veřejný endpoint v produkci odmítl
neplatný Turnstile token stavem 403 a metodu GET stavem 405.

Jednorázový schválený test doručení použil správcovské spuštění stejné funkce
`sendStoredMessage` přes oficiální Wrangler `getPlatformProxy` a živé vzdálené
bindingy CONTACT_DB/CONTACT_EMAIL. Nevznikl veřejný testovací endpoint a ochrana
produkčního formuláře nebyla vypnuta. Test není pozitivním průchodem skutečným
Turnstile widgetem v prohlížeči; ten zůstává samostatnou UI kontrolou.
Zpráva `4bb9dda3-40ba-4806-b61b-c3760c80594a` má jediný pokus; po nezávislém
potvrzení INBOX a shody Message-ID/X-Contact-ID má v D1 stav `sent`.
Hlavičky doručené zprávy potvrzují SPF pass, DKIM pass a multipart/alternative.
Nebyla znovu odesílána. Stav ověření je v ignorovaných `.wrangler/contact-live-state.json`
a `.wrangler/contact-one-email-test.json`.

Po přihlášení uživatele přes Wrangler byl ověřen skutečný stav účtu:

- `zajickuv-med.cz` i `www.zajickuv-med.cz` obsluhuje existující Worker `zajickuv-med`.
- Email Routing je aktivní; pravidlo `info@zajickuv-med.cz` směřuje na ověřenou schránku.
- Byla vytvořena samostatná D1 `zajickuv-med-contact`, ID `9d3b249d-a2f3-427c-b822-587d7a6eacb4`.
- Migrace `0001_contact.sql` je na této nové databázi aplikovaná; admin DB nebyla změněna.
- Je vytvořen Managed Turnstile widget pro oba hostname; Site Key je v konfiguraci.
- Tři runtime secrets (Turnstile, hashovací klíč, cílová schránka) jsou v ignorovaném
  `.wrangler/contact-runtime-secrets.json`. Soubor obsahuje soukromé údaje, nepatří do Gitu.

Aktuální Worker používá nativní binding `CONTACT_EMAIL` (`send_email`), takže k běžnému
odesílání nepotřebuje trvalý Cloudflare API token. REST implementace zůstává jako
alternativa pro Pages a pro lokální správcovský retry. Přihlášení Wrangleru se do
runtime neukládá. Změny se do běžícího webu dostanou až samostatným schváleným nasazením.

Před schválením byla nahraná neaktivní kandidátní verze Workeru
`6f53627c-5657-4934-bad0-1db6a5731b5b` (tag `contact-ready`). API kontrola po uploadu
potvrdila zachování aktivního deploymentu `0de95443-bcb7-44f5-9bab-e78e367ecb94`,
nezměněné routing rules a přítomnost všech bindingů/secrets v kandidátu, včetně
původního `GOOGLE_PLACES_API_KEY`. Před aktivací byla kontaktní databáze prázdná.
Runtime secrets jsou již součástí nyní aktivní verze; nevyžaduje ruční doplnění tokenu.

Uživatel následně výslovně schválil aktivaci kandidáta, retenčního Cron Triggeru
a jeden skutečný testovací e-mail; všechny tři kroky byly provedeny. Upload verze sám cron nezapíná.
Při aktivaci cronu upravujte pouze Worker schedules; DNS a routing rules se nemění.
Lokální záznam kontroly je v ignorovaném `.wrangler/contact-release.json` (bez hodnot secrets).

Projekt je Next.js 14 / React 18 / TypeScript / Tailwind se statickým exportem do
`out/`. Oba formuláře (homepage a `/kontakt`) používají
`src/components/sections/ContactForm.tsx`. Formspree bylo nahrazeno vlastním API.
Design, výběr produktů, jejich dostupnost a animace zůstávají zachovány;
zpráva je nyní povinná. Byly doplněny Turnstile a přístupné české stavové hlášky.

Repozitář dosud nasazuje **Workers Static Assets** přes `npm run deploy`,
nikoli Pages. Stávající Worker obsluhuje také vlastní administraci a databázi
`zajickuv-med-admin`. Je zachován včetně všech API. Zadání ale uvádí Pages:
proto existují i `functions/api/contact.ts`, `contact-config.ts` a catch-all
`functions/api/[[path]].ts` pro ostatní stávající API.
`wrangler.jsonc` je standardní konfigurace pro Pages, protože Pages nepodporuje
vlastní cestu přes `--config`. Původní Worker má `wrangler.worker.jsonc`; npm skripty
`deploy` a `worker:dev` ho vybírají výslovně a zachovávají dosavadní hosting. Není nutné přecházet
mezi hostingy; nejdříve v dashboardu ověřte, který projekt skutečně používá doména.

Soukromá cílová adresa byla zjištěna z existujícího pravidla a ověřena vůči Destination
Addresses; není zveřejněna v repozitáři. Skutečné doručení bylo potvrzeno jedním
schváleným testovacím e-mailem. Kód úmyslně vrací 503 při chybějící konfiguraci; pro Worker stačí
nativní binding a tři secrets, zatímco REST varianta vyžaduje také API token.

## Dostupnost zdarma a stávající pošta

Podle aktuální oficiální dokumentace je odesílání **na ověřenou Destination Address
ve stejném účtu zdarma i na Workers Free a při samotném Email Routing**. Platí to
i pro REST API. Odesílatel musí být na již nastavené routing doméně. Proto se používá
`info@zajickuv-med.cz` jako From a skutečná ověřená cílová schránka jako To.
Odpovědi směřují díky `reply_to` na návštěvníka. Automatické odpovědi nejsou implementovány.

- [Email Service – ceny](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Ověřené cílové adresy a REST](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/)
- [REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/)
- [Schéma send API, včetně reply_to](https://developers.cloudflare.com/api/resources/email_sending/methods/send/)
- [Povolené e-mailové hlavičky](https://developers.cloudflare.com/email-service/reference/headers/)
- [Nativní Workers binding a strukturovaný send](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)
- [Omezení a konfigurace send_email bindingu](https://developers.cloudflare.com/email-service/configuration/send-bindings/)

**Nezapínejte placený plán ani Onboard Domain. Neměňte MX, SPF, DKIM ani routing rules.**
Plné Email Sending pro libovolné příjemce vyžaduje Workers Paid; tato implementace
ho nepotřebuje. Pokud váš účet bezplatné REST odesílání na existující Destination
Address odmítne (např. 403/not_entitled), zpráva zůstane v D1 a řešte dostupnost
s Cloudflare. Neprovádějte jako „opravu“ změny DNS nebo přechod na placený plán.

Řešení používá jen služby s Free variantou. Pro celý web stále platí společné limity
účtu: Workers/Pages Functions typicky 100 000 dynamických požadavků denně, D1
5 milionů načtených a 100 000 zapsaných řádků denně, 5 GB úložiště na účet
(max. 500 MB na jednu Free databázi); Turnstile má bezplatný plán.
Překročení Free limitů může způsobit nedostupnost, proto nelze slíbit neomezený provoz.

- [Workers limity a ceny](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 ceny](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 limity](https://developers.cloudflare.com/d1/platform/limits/)
- [Turnstile plány](https://developers.cloudflare.com/turnstile/plans/)

## Jak ověřit aktuální cílové adresy

1. Přihlaste se do účtu Cloudflare, ve kterém je `zajickuv-med.cz`.
2. V **Compute → Email Service → Email Routing → Routing Rules** zkontrolujte,
   že stávající `info@zajickuv-med.cz` směřuje na Worker `zajickuv-med-email-forward`.
3. V **Destination Addresses** ověřte stav každé cílové schránky. Neověřenému
   příjemci Cloudflare zatím nedoručuje; nesmí však zablokovat druhého příjemce.
4. Seznamy jsou v secretech `CONTACT_TO_EMAIL` (webový Worker) a `FORWARD_TO_EMAILS`
   (email Worker) a v jejich lokálních ignorovaných zálohách. Alias info@ do cílového
   seznamu nepatří. Cloudflare uložené hodnoty secrets zpětně nezobrazuje.
5. Account ID zkopírujte z přehledu téhož účtu do `CF_ACCOUNT_ID`.

## Proměnné, secrets a bindings

Hodnoty nastavte v příslušném Workers/Pages projektu. Pro Pages nastavte Production
a Preview odděleně; preview nesmí používat produkční schránku/databázi pro automatické testy.
Veřejná konfigurace v `wrangler*.jsonc` je při deployi autoritativní: veřejné vars
doplňte i do vybrané konfigurace, aby je další deploy neodstranil.

| Název | Typ | Hodnota |
| --- | --- | --- |
| `CONTACT_DB` | D1 binding | Samostatná DB `zajickuv-med-contact` – postup níže. |
| `CONTACT_EMAIL` | E-mailový binding | Již v `wrangler.worker.jsonc`; odesílá na ověřené Destination Addresses. Má přednost před REST API a nepotřebuje API token. |
| `CONTACT_ALLOWED_HOSTNAMES` | Variable | `zajickuv-med.cz,www.zajickuv-med.cz`; případně konkrétní preview hostname oddělený čárkou. Bez protokolu, portu, wildcardu a lomítka. |
| `TURNSTILE_SITE_KEY` | Variable (veřejná) | Site Key vašeho Turnstile widgetu. Získává se přes `GET /api/contact-config`, není potřeba NEXT_PUBLIC proměnná. |
| `TURNSTILE_SECRET_KEY` | Secret | Secret Key stejného widgetu. |
| `CONTACT_HASH_SECRET` | Secret | Náhodný tajný klíč alespoň 32 znaků, doporučeno 32 náhodných bajtů v hexu. Stejný pro všechny instance daného prostředí. |
| `CF_ACCOUNT_ID` | Variable | 32znakové ID účtu vlastnícího routing doménu a Destination Address. |
| `CF_EMAIL_API_TOKEN` | Volitelný secret | Potřeba pouze pro REST variantu (Pages nebo lokální správcovský retry), nikoli pro aktuální nativní Worker binding. |
| `CONTACT_TO_EMAIL` | Secret | JSON seznam 1–5 skutečných cílových schránek; pro zpětnou kompatibilitu lze použít jedinou adresu. Příjemci musí být ověření pro doručování. |
| `CONTACT_FROM_EMAIL` | Variable | `info@zajickuv-med.cz` na existující routing doméně. |
| `DB` | Stávající D1 binding | Ponechat stávající admin databázi; CONTACT_DB ji nenahrazuje. |

Žádné hodnoty secrets nevkládejte do `vars`, zdrojového kódu, GitHubu ani příkazové
řádky. Lokálně lze použít `.dev.vars` podle `.dev.vars.example`; soubor je ignorovaný
Gitem. Runtime secrets nejsou součástí statického exportu. Endpoint konfigurace
vrací pouze veřejný Site Key.

Pro Worker ukládejte secrets interaktivně, např.:

```powershell
npx.cmd wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.worker.jsonc
npx.cmd wrangler secret put CONTACT_HASH_SECRET --config wrangler.worker.jsonc
npx.cmd wrangler secret put CF_EMAIL_API_TOKEN --config wrangler.worker.jsonc
npx.cmd wrangler secret put CONTACT_TO_EMAIL --config wrangler.worker.jsonc
```

Pro Pages použijte **Settings → Variables and Secrets → Add → Encrypt** v konkrétním
projektu/prostředí. Oprávnění ke správě secrets/databáze mají mít pouze správci webu.
Vygenerování CONTACT_HASH_SECRET (výsledek patří jen do secrets):

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## API token pro odesílání

**Pro aktuální Worker není tento krok nutný.** Používá `CONTACT_EMAIL` a tři uvedené
runtime secrets. Následující postup slouží jen pro REST variantu nebo lokální CLI retry.

V Cloudflare **My Profile → API Tokens → Create Token → Create Custom Token**
zvolte oprávnění **Account → Email Sending → Edit** a omezte resources na daný účet.
Nepoužívejte Global API Key ani oprávnění DNS/Edit nebo Email Routing/Edit.
Token uložte jako `CF_EMAIL_API_TOKEN`. Tento token nepatří do prohlížeče.
Pokud toto oprávnění není ve vašem účtu dostupné, ověřte s podporou dostupnost
bezplatného verified-destination odesílání; neprovádějte onboarding DNS ani upgrade.

## D1: vytvoření, migrace a propojení

Databáze i první migrace již byly připraveny po autorizovaném přihlášení; následující
příkazy jsou referenční postup pro nové prostředí. Stávající databázi nevytvářejte znovu.

```powershell
npx.cmd wrangler d1 create zajickuv-med-contact
```

Vrácené `database_id` doplňte jako **další** položku `d1_databases` do vybraného
`wrangler.worker.jsonc` (Workers) nebo `wrangler.jsonc` (Pages):

```json
{
  "binding": "CONTACT_DB",
  "database_name": "zajickuv-med-contact",
  "database_id": "ID_VRACENE_CLOUDFLARE",
  "migrations_dir": "migrations/contact"
}
```

Ve stávající JSONC konfiguraci doplňte čárku za položkou `DB`.
ID v příkladu není funkční hodnota. Kontakt má vlastní migrace, takže se
nemigrují tabulky administrace ani cache recenzí do kontaktní databáze.

```powershell
# Lokálně (podle zvoleného configu):
npx.cmd wrangler d1 migrations apply zajickuv-med-contact --local --config wrangler.worker.jsonc
# Vzdáleně až při schváleném uvedení do provozu:
npx.cmd wrangler d1 migrations apply zajickuv-med-contact --remote --config wrangler.worker.jsonc
```

Pro D1 příkazy pro Pages použijte místo toho `--config wrangler.jsonc`. Binding `CONTACT_DB`
zkontrolujte také v Pages **Settings → Bindings**; `DB` ponechte pro existující admin API.
Pro Preview vytvořte samostatnou testovací DB. Čtecí replikaci není nutné zapínat.

## Turnstile

V účtu Cloudflare vytvořte **Turnstile → Add Widget**, režim **Managed**, hostname
`zajickuv-med.cz` a `www.zajickuv-med.cz`. Nastavte Site Key a Secret Key podle tabulky.
Pro náhled povolte jen konkrétní testovací hostname v widgetu i backendové proměnné.
Siteverify vyžaduje úspěch, přesný hostname právě navštíveného webu a `action=contact`.
Token má nejvýše 2 048 znaků a je jednorázový. Po každém pokusu se widget obnoví.

[Oficiální serverové ověřování](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## Průběh a ochrany

1. Formulář validuje povinná pole; do získání Turnstile tokenu zůstává odeslání vypnuté.
   Během odesílání jsou pole i tlačítko blokované; stav je přístupný přes aria-busy/status/alert.
2. `POST /api/contact` povoluje pouze JSON ze stejného originu a povoleného hostname,
   nejvýše 32 KiB včetně streamu bez Content-Length. GET/OPTIONS atd. vrací 405.
   Server ověřuje typy, délky, e-mail, řídicí znaky, UUID, honeypot a odmítá neznámá pole,
   včetně pokusu zadat příjemce. Limity: jméno/produkt 200, e-mail 254, telefon 80,
   zpráva 1–5 000 znaků. Telefon je nepovinný.
3. Atomické SQL v D1 povolí nejvýše 3 validně strukturované pokusy za klouzavých
   15 minut pro jednu IP (počítají se i neúspěšné Turnstile tokeny). Ukládá se HMAC-SHA256,
   nikoli IP. Používá se výhradně Cloudflare CF-Connecting-IP, nikoli X-Forwarded-For.
   Origin samotný není autentizace; ochranu přímých API požadavků zajišťuje také Siteverify.
4. Po úspěšném Siteverify se atomicky uloží zpráva. Stejné submissionId nelze použít
   pro jiný obsah a identický normalizovaný obsah se během 15 minut neukládá znovu.
   Deduplikace i limit fungují v databázi napříč serverless instancemi.
5. Až potom získá e-mailový pokus atomický D1 zámek a použije pevné serverové From/To.
   HTML je escapované, současně se posílá textová verze, Reply-To návštěvníka a X-Contact-ID.
   Worker používá nativní `send_email` binding; potvrzení s messageId ukládá jako `queued`
   (přijato poskytovatelem, doručení je třeba ověřit). Pages/CLI mohou použít REST alternativu.
   Každý příjemce má samostatný zámek a provider ID v `contact_deliveries`. Přijatá kopie
   se neopakuje kvůli selhání jiného cíle. Stav na rodičovské zprávě je agregovaný.
6. UI ukáže úspěch jen při HTTP 2xx **a** `{ok:true, accepted:true, id:...}`.
   HTTP 202 znamená bezpečné přijetí do D1, nikoli příslib doručení do inboxu.
   Při síťové chybě zůstanou pole vyplněná a stejný obsah použije stejné ID při dalším pokusu.

## Kontrola a opětovné odesílání bez veřejného adminu

Použijte lokální `scripts/contact-manage.mjs` (Node 22.18+, testováno na Node 24).
Neexistuje veřejný endpoint pro čtení zpráv či retry. Nové kontaktní tabulky nejsou
přístupné z existujícího `/admin`.

V bezpečném lokálním procesu nastavte `CF_ACCOUNT_ID`, `CONTACT_DATABASE_ID`
(ID CONTACT_DB) a `CF_CONTACT_ADMIN_TOKEN` s **Account → D1 → Edit** pro daný účet.
Tento správcovský token se nenastavuje do veřejného Workeru/Pages. D1 oprávnění mohou
pokrývat databáze celého účtu: poskytujte je pouze důvěryhodným správcům, použijte
nejmenší rozsah dostupný ve vašem účtu a nenechávejte token v historii terminálu.
Pro retry proces navíc potřebuje `CF_EMAIL_API_TOKEN`, `CONTACT_TO_EMAIL` a
`CONTACT_FROM_EMAIL` se stejnými hodnotami jako produkce. Lokální proces nemá nativní
Workers binding; tento výslovně spuštěný správcovský retry proto používá REST API
a samostatný omezený token. Běžný provoz formuláře tento token nepotřebuje.
Skript automaticky nečte `.dev.vars`.

```powershell
npm.cmd run contact:manage -- list
npm.cmd run contact:manage -- show ID_ZPRAVY
npm.cmd run contact:manage -- retry ID_ZPRAVY --send
npm.cmd run contact:manage -- cleanup
```

`list` vypíše 100 posledních stavů bez jmen/obsahu/adres návštěvníků, `show` vypíše
konkrétní zprávu pouze do lokálního terminálu správce. Nevkládejte tento výstup do
veřejných logů. Každý retry vyžaduje konkrétní ID a explicitní `--send`.

| Stav | Význam a postup |
| --- | --- |
| `pending` | Uloženo, dosud neodesláno nebo API výslovně odmítlo (včetně permanent bounce). Opravit příčinu a spustit retry. |
| `sending` | Pokus má trvalý zámek. Pokud stav zůstal po pádu procesu/chybě zápisu, nejdříve ověřit výsledek v Cloudflare. |
| `sent` | REST API uvedlo příjemce jako delivered; zkontrolovat skutečnou schránku/spam. Další retry se přeskočí. |
| `queued` | Cloudflare přijalo do vlastní fronty. Znovu neposílat; kontrolovat Activity log. |
| `uncertain` | Timeout, 5xx, redirect nebo nejednoznačná odpověď. Znovu neposílat bez ověření výsledku. |

U REST API ani nativního bindingu není zdokumentovaná idempotence odesílání; nelze slíbit přesně jedno
doručení při ztrátě odpovědi po přijetí poskytovatelem. X-Contact-ID je korelační
identifikátor, nikoli poskytovatelova deduplikace. Proto se `sending`, `queued` ani
`uncertain` automaticky znovu neposílají. V **Email Service → Activity log** ověřte
čas, příjemce a provider_message_id (je-li k dispozici), případně X-Contact-ID
v doručené zprávě. Bez průkazného výsledku zprávu ponechte k ručnímu vyřízení.

Po ověření a nejdříve 15 minut po posledním pokusu:

```powershell
# Pouze pokud poskytovatel prokazatelně zprávu nepřijal / definitivně nedoručí:
npm.cmd run contact:manage -- resolve ID_ZPRAVY --recipient=ADRESA_PRIJEMCE --confirmed-not-accepted
# Potom případně explicitní retry --send.
# Pokud poskytovatel přijetí/doručení potvrdil:
npm.cmd run contact:manage -- resolve ID_ZPRAVY --recipient=ADRESA_PRIJEMCE --confirmed-delivered
```

Pro nové zprávy je nutné vybrat konkrétního příjemce; u starších zpráv bez per-recipient
záznamů je podporován původní příkaz bez --recipient. Resolve sám e-mail neposílá. Nelze bezpečně uvolnit stále běžící či stále frontovanou
zprávu jen proto, že se dosud neobjevila v inboxu. Pravidelně kontrolujte pending/uncertain;
Automatická údržba nyní opakuje jen výslovně odmítnuté/pending kopie aktuálně
nakonfigurovaných příjemců. Queued/sent/sending/uncertain kopie neopakuje.

## Retence a úklid

`cleanupContact` maže zprávy všech stavů staré nejméně 90 dní a IP HMAC záznamy
staré nejméně 15 minut. Worker má Cron Trigger **každých 15 minut**.
Staré řádky se fyzicky odstraní při nejbližším běhu; je třeba monitorovat jeho
úspěch. Záměrně neuchováváme plné odpovědi externích API, raw tokeny ani raw IP.

**Pages nemá Cron Triggers.** Pro Pages nastavte v `wrangler.contact-cleanup.jsonc`
pouze binding CONTACT_DB se stejným ID a nasazení malého maintenance Workeru
`worker/contact-cleanup.ts` naplánujte jako součást schváleného uvedení do provozu.
Nemá veřejný admin, e-mailové secrets ani přístup do admin DB; HTTP vrací pouze 404.
Alternativou je spouštět `contact:manage -- cleanup` denně na zabezpečeném stroji.
Bez naplánovaného a monitorovaného úklidu nelze garantovat retenční dobu.

```powershell
# Až po schválení, pouze pro variantu Pages:
npx.cmd wrangler deploy --config wrangler.contact-cleanup.jsonc
```

Výmaz z D1 neodstraňuje již doručené e-maily. D1 Time Travel může obsahovat
obnovitelné kopie ještě po dobu služby (Free: 7 dní). Omezte přístup k databázi,
zálohám a schránce. Retence korespondence ve schránce je samostatná.

## Testování a uvedení do provozu

Automaticky ověřeno s mockovaným externím fetch a skutečným SQLite/D1 Miniflare:

Prošlo 35 kontrol kontaktního backendu (včetně nativního e-mailového bindingu s mockem)
a 1 integrační test sestavených Pages Functions
(včetně zachování public/admin API a předání statických stránek).

Po rozšíření na dva příjemce prošlo 43 backend/forwarding kontrol + 1 integrační
Pages test. Navíc ověřeno: nezávislé doručení, neověření druhého cíle neblokující první,
opakování pouze pending kopie, souběžné retry bez duplicit, izolace nejistého výsledku,
ochrana starých odeslaných zpráv před kopírováním novým příjemcům a email forwarding.

- uložení před e-mailem, HTML escaping, Reply-To, pevný příjemce;
- validace, prázdná pole, neplatný JSON, velikost těla, metody/origin/hostname;
- chybějící, neplatný a opakovaný token; nesprávný hostname/action a výpadek Siteverify;
- honeypot, rate limit, expirace okna, souběžné pokusy, duplicity a konflikt ID;
- odmítnutí poskytovatelem, fronta, timeout, redirect, 5xx a neúplná odpověď;
- selhání D1 před uložením i po odeslání; zámek zabraňující slepému retry;
- retenční výmaz a omezená veřejná konfigurace.

```powershell
npm.cmd run test:contact
npm.cmd run test:pages
npm.cmd run check:worker
npm.cmd run build
npx.cmd wrangler deploy --config wrangler.worker.jsonc --dry-run --outdir .wrangler/contact-dry-run
npx.cmd wrangler pages functions build --outdir .wrangler/contact-pages-build
```

Pro klikací test **bez skutečného Turnstile/API/e-mailu** po buildu spusťte:

```powershell
node scripts/contact-ui-preview.mjs
```

Otevřete `http://127.0.0.1:8799/kontakt` nebo `/`. Jde výhradně o lokální mock:
tlačítko „Testovací ověření (mock)“ nahradí Turnstile. Zpráva obsahující `chyba`
simuluje 503; `nepotvrzeno` simuluje HTTP 200 bez potvrzení přijetí (UI musí hlásit
chybu); ostatní text simuluje bezpečné přijetí. Zkontrolujte klávesnici, blokování
dvojkliku, české hlášky, zachování polí při chybě, vymazání po úspěchu a mobilní šířky
320/375/768 px. Tento fixture se nesmí publikovat jako produkční server.

Klikací a vizuální test se v této relaci nepodařilo dokončit: nástroj pro ovládání
prohlížeče jej zastavil, protože ve Windows nedokázal spolehlivě určit aktuální URL.
Proběhl build/typecheck; interaktivní zobrazení stavů je nutné ještě ručně ověřit.

Před produkčním deployem ověřte hosting, bindingy, migraci, všechny secrets, hostname
a naplánovaný úklid. Pages Git build: `npm run build`, output `out`, Functions jsou
v kořenovém `functions/` a standardní konfigurace v `wrangler.jsonc`.
Jméno Pages projektu v konfiguraci musí odpovídat vašemu skutečnému projektu.
Případný schválený CLI deploy Pages používá `npx.cmd wrangler pages deploy out`,
nikoli vlastní cestu `--config` (instalovaná verze ji pro Pages nepodporuje).
Pro původní Worker slouží nadále `npm run deploy`, nyní s výslovným
`--config wrangler.worker.jsonc`. Konkrétní Git integraci zkontrolujte v nastavení
projektu. Žádný Git push ani deployment zde nebyl proveden.

[Oficiální konfigurace Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)

**Skutečné doručení ověřte až po výslovném souhlasu s testovacím e-mailem a nasazením:**
odešlete jedinou jasně označenou testovací zprávu z formuláře, ověřte záznam v D1,
stav v Email Service Activity logu a příjem v téže schránce, kam chodí pošta pro info@.
Zkontrolujte spam a Reply-To. HTTP 202 samo o sobě nepotvrzuje doručení do schránky.
Ověřte také běh retenčního Cron Triggeru. Neukládejte testovací obsah s reálnými
osobními údaji. Funkční příjem pošty pro info@ se znovu nenastavuje.
