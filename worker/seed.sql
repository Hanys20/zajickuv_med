-- Naplnění lokální D1 databáze (wrangler d1 execute --local) daty odpovídajícími
-- obsahu content/ v okamžiku zavedení vlastního admin systému. Slouží jen pro
-- lokální vývoj/test - produkční (remote) databázi spravuje admin přes /sprava.

INSERT OR IGNORE INTO admin_user (id, username, password_hash, password_salt) VALUES (
  1,
  'pavel',
  '6d067f6ce0a342d2ee77bfc91470931271e45a8b240f7cff1451970de2e8dbe0',
  '8bc714c00a89db6fdb03c06b62e8b371'
);

INSERT OR IGNORE INTO news (id, title, date, body) VALUES
  (1, 'První letošní med v roce 2026', '2026-05-29T00:00:00.000Z', 'Drazí přátele,

rok zase utekl jako voda a my Vám můžeme s radostí sdělit, že pro Vás máme připravený první letošní květový jarní med. Včely nám přezimovaly velice dobře. Počasí bylo poměrně suché, ale i přesto se s námi příroda podělila a naše pilné včely opět med donesly.

Rádi se s Vámi pozdravíme, až k nám přijedete pro med.

Hezký zbytek jara

Včelař Pavel s rodinou'),
  (2, 'Zkouška', '2026-07-21T09:00:12.620Z', 'Vážení přátele, kolegové, rodino a naši milí zákazníci.

máme za sebou první kolo vytáčení květového medu. Ani nám se letos nevyhnuly úhyny včelstev. Ztráty byly cca 10 % , navíc jsme se potýkali z vyšší uhynovostí matek v zimním období. To nás na jaře donutilo některá včelstva spojovat. Na jaře díky suchu a výraznému střídání teplot byla snůška medu nižší než jsme si v minulosti zvykli. Věříme, že nám bude počasí přát a snůška smišených a lesních medů nám vše vynahradí.

Rádi se s Vámi opět uvidíme, až k nám dorazíte pro med.

Včelař Pavel s rodinou');

INSERT OR IGNORE INTO honey_availability (slug, name, availability) VALUES
  ('med-kvetovy-jarni', 'Med květový jarní', 'available'),
  ('med-kvetovy-jarni-pastovany', 'Med květový jarní pastovaný', 'sold-out'),
  ('med-kvetovy-lipovy', 'Med květový lipový', 'available'),
  ('med-kvetovy-pohankovy', 'Med květový pohankový', 'available'),
  ('med-medovicovy-lesni', 'Med medovicový (lesní)', 'available'),
  ('med-smiseny', 'Med smíšený', 'available');

INSERT OR IGNORE INTO pricing (id, data) VALUES (1, '{"effectiveFrom":"2025-07-15","note":"Cena medu je stejná napříč všemi druhy medu, liší se pouze podle velikosti balení. Uvedené ceny zahrnují vratnou zálohu na sklenici (5 Kč).","honey":[{"size":"950g","price":190,"unit":"Kč/sklenici"},{"size":"450g","price":110,"unit":"Kč/sklenici"}],"propolis":[{"name":"Propolisová tinktura","size":"50 ml","price":180,"unit":"Kč"},{"name":"Propolis škrábaný","size":"20 g","price":110,"unit":"Kč"}],"giftSets":[{"name":"Karton 2× 450g","price":250,"unit":"Kč"},{"name":"Karton 1× 950g","price":220,"unit":"Kč"},{"name":"Karton 2× 950g","price":410,"unit":"Kč"}],"mead":{"name":"Medovina","variants":["Zlatá","Královská (s vybraným kořením)"],"note":"Vyrábí se z vlastního medu přírodním kvašením medu a vody, zraje nejméně 10 měsíců. Bez cenovky a možnosti objednání – nelze přímo prodávat, na webu jen zmínka (bez ceny a bez tlačítka objednat)."},"jarDeposit":{"amount":5,"currency":"CZK","note":"Vratná záloha na sklenici, je součástí uvedené ceny v ceníku (ne příplatek navíc)."},"namingNote":"Klient navrhuje sekci nepojmenovávat ''Naše produkty'', ale např. ''Co u nás vzniká'' nebo ''Z naší včelí farmy'' – kvůli zmínce o medovině, kterou nelze přímo prodávat."}');
