# Google recenze

Homepage načítá recenze provozovny Zajíčkův med přes Cloudflare Worker (`GET /api/public/reviews`).
Worker používá Google Places API (New); klíč nikdy neposílá do prohlížeče. Pokud klíč chybí
nebo Google neodpoví, sekce stále odkazuje na správný profil na Google Maps a nezobrazuje
žádné vymyšlené recenze ani hodnocení.

## Zapnutí

1. V Google Cloud zapněte účtování a **Places API (New)**. Vytvořte samostatný API klíč
   omezený na tuto API. Nastavte kvótu a upozornění na útratu.
2. Přihlaste se do správného Cloudflare účtu a uložte klíč jako Worker secret:
   `npx wrangler secret put GOOGLE_PLACES_API_KEY`. Alternativně jej nastavte v nastavení
   Workeru v Cloudflare dashboardu. Klíč neukládejte do Gitu ani do `wrangler.jsonc`.
3. Volitelně nastavte `GOOGLE_PLACE_ID` na textové ID provozovny z Places API.
   Odkaz na Google Maps ani hexadecimální identifikátor z jeho URL nejsou Place ID.
   Bez `GOOGLE_PLACE_ID` Worker vyhledá provozovnu podle názvu, adresy a souřadnic.
4. Po nastavení klíče nasazení ověřte na `/api/public/reviews` a na úvodní stránce.

Pro místní vývoj lze použít ignorovaný soubor `.dev.vars` s řádkem
`GOOGLE_PLACES_API_KEY=...`. Volání API může být účtované. Worker výsledek
globálně ukládá do D1 na 24 hodin. Atomický zámek dovolí nejvýše jeden pokus o
volání Google Places za klouzavých 24 hodin, bez ohledu na počet návštěv webu;
na stejnou dobu se uloží i neúspěšná odpověď. Google vrací nejvýše pět recenzí
podle relevance. Web všech pět zobrazuje v carouselu s textem, jménem autora,
jeho atribucí a odkazem na originál.

Dokumentace: [Places API (New)](https://developers.google.com/maps/documentation/places/web-service/overview),
[pravidla atribuce](https://developers.google.com/maps/documentation/places/web-service/policies).
