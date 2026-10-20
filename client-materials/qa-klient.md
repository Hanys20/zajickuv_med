# Otázky a odpovědi od klienta

Zdroj: textové podklady zaslané klientem, 2026-07-20.

- **IČO** – Není. Jedná se o prodej přebytků ze dvora, ne o podnikání s IČO.
- **Oblíbený včelařský citát** – Klient žádný nemá. Místo klasického citátu lze použít osobní vyznění: *"Je to pro taťku prostě radost, naplňuje ho to."* (viz `content/pages/o-farme.md`, sekce "Návrat ke včelám").
- **Návštěvnost / cookies** – Ano, klient chce sledovat návštěvnost. Web potřebuje cookie lištu / consent řešení (uloženo v `content/settings/site.json` → `analytics`).
- **Recenze** – Původní dotaz klienta se týkal propojení s Google Maps. Provozovna už existuje a web má připravené načítání recenzí přes Places API (New). Klient zatím nemá API klíč; do jeho nastavení sekce odkazuje přímo na profil (viz `docs/google-reviews.md`).
- **Doména** – Aktuálně vedená u Radima Steuera (GDstudio), kontakt uložen v `content/settings/site.json` → `domainRegistrar`. Potřeba zjistit přihlašovací údaje / doménu přesměrovat na Cloudflare Pages.

## Otevřené body / TODO směrem ke klientovi

- [ ] Získat přístupové údaje k doméně zajickuv-med.cz od Radima Steuera (GDstudio).
- [ ] Získat odkazy na Facebook a Instagram, jakmile budou profily hotové.
- [ ] V Google Cloud vytvořit klíč pro Places API (New) s aktivním účtováním a vložit jej do Cloudflare Worker secret `GOOGLE_PLACES_API_KEY` (viz `docs/google-reviews.md`).
- [ ] Potvrdit dostupnost jednotlivých druhů medu (které jsou aktuálně vyprodané) pro spuštění webu.
- [ ] Fotografie – včelařství, produkty, rodina, stanoviště (pro hero a produktové karty).
- [ ] Design inspirace od klienta – zatím nedorazila jako příloha v konverzaci, doplnit do této složky (`client-materials/`), případně do `MOJE PODKLADY - NESAHAT/`.
- [ ] Rozhodnout finální název sekce produktů (klient navrhuje "Co u nás vzniká" nebo "Z naší včelí farmy" kvůli medovině, kterou nelze přímo prodávat).
