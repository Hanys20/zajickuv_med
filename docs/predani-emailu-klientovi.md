# Doručování klientům – aktuální nastavení

Aktualizováno 28. 10. 2026 po výslovném požadavku provozovatele. Změny jsou nasazené.

## Stav předání

- Renatina adresa je v Destination Addresses ověřená.
- Pavelova adresa v Cloudflare existuje, ale zatím čeká na jeho potvrzení.
- Obě adresy jsou nastavené ve formuláři i v přeposílání běžné pošty.
- Vývojářova adresa již není příjemcem tohoto webu. Ze společného seznamu
  Destination Addresses nebyla smazaná, protože tento seznam platí pro celý účet.
- Nebyly změněny MX, SPF, DKIM, jiné DNS záznamy ani Catch-all pravidlo.
- Klientům nebyl v rámci předání odeslán skutečný testovací e-mail.

**Zbývá pouze lidský krok:** Pavel musí ve své schránce najít ověřovací zprávu
od Cloudflare a kliknout na potvrzení. Případně zkontroluje spam.
Potom se nové zprávy začnou doručovat i jemu bez dalšího přepisování konfigurace.
Pokud ověřovací zprávu nenajde, lze v Cloudflare vyžádat její opětovné zaslání.

## Dvě cesty doručování

| Zpráva | Aktuální zpracování |
| --- | --- |
| Poptávka z webového formuláře | Worker `zajickuv-med`, dva příjemci v secretu `CONTACT_TO_EMAIL`, nezávislé stavy v D1. |
| Běžný e-mail na `info@zajickuv-med.cz` | Pravidlo Email Routing předá zprávu Workeru `zajickuv-med-email-forward`, který ji přeposílá na oba cíle z `FORWARD_TO_EMAILS`. |

Cloudflare nepovoluje přeposílat na neověřenou schránku. Neúspěch Pavelovy
destinace nesmí zrušit nezávislý pokus o doručení Renatě.

## Co se děje před a po Pavelově potvrzení

**Formulář:** každý příjemce má vlastní záznam `contact_deliveries`. Přijatá kopie
pro Renatu se při opakovaných pokusech neposílá znovu. Výslovně odmítnuté/pending
doručení se zkouší při údržbě každých 15 minut, nejvýše dvě zprávy v jednom běhu.
Po potvrzení Pavla se tak mohou doposlat i jeho bezpečně uložené čekající kopie.
Výsledky s nejasným doručením (`uncertain` nebo `sending`) se automaticky neopakují;
musí je prověřit správce. Celkový stav zprávy zůstává pending, pokud například
jedna kopie čeká a druhá už byla přijata poskytovatelem.

**Běžná pošta pro info@:** oba forwardy se provádějí nezávisle. Do potvrzení
Pavelovy schránky může být přeposlaná jen kopie Renatě. Zpětné doposílání staré
příchozí pošty tento Worker neprovádí; Renata může konkrétní starší zprávu podle
potřeby klientovi přeposlat sama. Nová pošta po ověření se přeposílá oběma.

## Budoucí změna adres

1. V **Email Service → Email Routing → Destination Addresses** přidej novou
   skutečnou cílovou schránku a nech jejího vlastníka potvrdit ověřovací zprávu.
2. Pro formulář změň **Workers & Pages → zajickuv-med → Settings → Variables and Secrets → CONTACT_TO_EMAIL**.
   Hodnotou je JSON seznam adres uložený jako **Secret**, například:

   ```json
   ["prvni@example.com", "druhy@example.com"]
   ```

3. Pro běžnou poštu změň stejný JSON seznam v secretu **FORWARD_TO_EMAILS** u Workeru
   **zajickuv-med-email-forward**. Pravidlo `info@` už směřuje na tento Worker;
   nevytvářej několik duplicitních pravidel stejného aliasu.
4. Změny secrets potvrď **Deploy** u každého změněného Workeru.
5. Aktualizuj také lokální ignorované soubory `.wrangler/contact-runtime-secrets.json`
   (položka CONTACT_TO_EMAIL) a `.wrangler/email-forward-secrets.json`
   (položka FORWARD_TO_EMAILS). Hodnota secretu v těchto souborech je text
   obsahující JSON seznam; při ruční úpravě zachovej platný vnější JSON.
   Staré lokální hodnoty by při dalším uploadu mohly vrátit předchozí příjemce.
6. Po dohodě s klientem ověř zvlášť přijetí poptávky z formuláře a běžného e-mailu
   na info@. Při rollbacku na starší verzi ověř také příjemce dané verze.

Seznam formuláře musí mít 1–5 platných adres. Původní jediná adresa je stále
podporovaná pro zpětnou kompatibilitu, ale prostý seznam oddělený čárkami není
platný JSON seznam. Alias `info@zajickuv-med.cz` nepatří mezi cíle – zabrání se tím smyčce.

## Provoz a správa

- Aktivní webová verze: `676a0c9b-2c87-4c84-b161-7a2f52df319d`.
- Přeposílací Worker: `worker/email-forward.ts`, konfigurace `wrangler.email-forward.jsonc`.
- Oba seznamy adres jsou uložené jako secrets, nikoli v browseru nebo veřejném kódu.
- D1 migrace `0002_recipient_deliveries.sql` ukládá jednotlivé pokusy odděleně.
- Úklid a bezpečné opakování pending kopií spouští cron `*/15 * * * *`.
- Retence zpráv a souvisejících doručení je 90 dní; staré záznamy odstraňuje údržba.
- Dříve již odeslané zprávy z doby před předáním se automaticky novým příjemcům nekopírují.
- Lokální správcovský příkaz `show ID` vypisuje i per-recipient stavy. Při ručním
  resolve je pro nové zprávy povinné `--recipient=konkretni_adresa`, aby se neuvolnila
  už přijatá kopie jiného příjemce.

## Podklady

- [Oficiální přeposílání přes email Worker](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)
- [Destination Addresses a ověřování](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/)
- [Správa secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
