import { defineConfig } from 'tinacms';

// Název souboru je vždy podle data (ne podle titulku), aby dvě aktuality
// se stejným názvem nekolidovaly a diakritika v titulku nedělala problém.
function formatDateSlug(dateValue?: string): string {
  const d = dateValue ? new Date(dateValue) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || undefined,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  // Bez media manageru - klient nemá nahrávat/upravovat fotky přes admin.

  schema: {
    collections: [
      // Pozn.: pole nepřítomná ve schématu se u markdown souborů (frontmatter)
      // při uložení zachovají beze změny - proto tu jsou jen availability + body
      // (body musí zůstat, jinak by se při uložení smazal text popisu).
      {
        name: 'product',
        label: 'Dostupnost medů',
        path: 'content/products',
        format: 'md',
        // Jen med (soubory med-*.md) – propolis a medovina se přes admin needitují.
        match: { include: 'med-*' },
        ui: {
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'string',
            name: 'availability',
            label: 'Dostupnost',
            options: [
              { value: 'available', label: 'Skladem' },
              { value: 'sold-out', label: 'Vyprodáno' },
            ],
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Plný popis (needitovat)',
            isBody: true,
          },
        ],
      },
      // Pozn.: JSON kolekce (ceník) se při uložení přepíší celé podle schématu -
      // pole, která tu nejsou, by se nenávratně smazala. Proto musí být
      // deklarovaná úplně všechna, i ta needitovatelná (jen jsou jasně popsaná).
      {
        name: 'pricing',
        label: 'Ceník',
        path: 'content/pricing',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
        },
        match: { include: 'cenik' },
        fields: [
          { type: 'string', name: 'effectiveFrom', label: 'Ceník platný od (needit)' },
          { type: 'string', name: 'note', label: 'Poznámka k ceníku (needit)', ui: { component: 'textarea' } },
          {
            type: 'object',
            name: 'honey',
            label: 'Med – ceny podle velikosti',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.size }),
            },
            fields: [
              { type: 'string', name: 'size', label: 'Velikost (needit)' },
              { type: 'number', name: 'price', label: '💰 Cena – upravujte pouze toto' },
              { type: 'string', name: 'unit', label: 'Jednotka (needit)' },
            ],
          },
          {
            type: 'object',
            name: 'propolis',
            label: 'Propolisové produkty',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.name }),
            },
            fields: [
              { type: 'string', name: 'name', label: 'Název (needit)' },
              { type: 'string', name: 'size', label: 'Velikost (needit)' },
              { type: 'number', name: 'price', label: '💰 Cena – upravujte pouze toto' },
              { type: 'string', name: 'unit', label: 'Jednotka (needit)' },
            ],
          },
          {
            type: 'object',
            name: 'giftSets',
            label: 'Dárková balení',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.name }),
            },
            fields: [
              { type: 'string', name: 'name', label: 'Název (needit)' },
              { type: 'number', name: 'price', label: '💰 Cena – upravujte pouze toto' },
              { type: 'string', name: 'unit', label: 'Jednotka (needit)' },
            ],
          },
          {
            type: 'object',
            name: 'mead',
            label: 'Medovina (needitovatelné, jen zmínka bez ceny)',
            fields: [
              { type: 'string', name: 'name', label: 'Název (needit)' },
              { type: 'string', name: 'variants', label: 'Varianty (needit)', list: true },
              { type: 'string', name: 'note', label: 'Poznámka (needit)', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'jarDeposit',
            label: 'Záloha na sklenici',
            fields: [
              { type: 'number', name: 'amount', label: '💰 Výše zálohy – upravujte pouze toto' },
              { type: 'string', name: 'currency', label: 'Měna (needit)' },
              { type: 'string', name: 'note', label: 'Poznámka (needit)', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'string',
            name: 'namingNote',
            label: 'Poznámka k názvu sekce (needit)',
            ui: { component: 'textarea' },
          },
        ],
      },
      {
        name: 'news',
        label: 'Aktuality',
        path: 'content/news',
        format: 'md',
        ui: {
          filename: {
            slugify: (values) => `prispevek_${formatDateSlug(values?.date)}`,
          },
          defaultItem: () => ({
            date: new Date().toISOString(),
          }),
        },
        fields: [
          { type: 'string', name: 'title', label: 'Název', isTitle: true, required: true },
          { type: 'datetime', name: 'date', label: 'Datum', required: true },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Zpráva',
            isBody: true,
          },
        ],
      },
    ],
  },
});
