import { defineConfig } from 'tinacms';

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
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
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
          { type: 'string', name: 'name', label: 'Název', isTitle: true, required: true, ui: { readonly: true } },
          { type: 'string', name: 'slug', label: 'Slug', required: true, ui: { readonly: true } },
          {
            type: 'string',
            name: 'category',
            label: 'Kategorie',
            options: [
              { value: 'med', label: 'Med' },
              { value: 'propolis', label: 'Propolis' },
            ],
            required: true,
            ui: { readonly: true },
          },
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
          { type: 'string', name: 'sizes', label: 'Dostupné velikosti balení', list: true, ui: { readonly: true } },
          {
            type: 'string',
            name: 'shortDescription',
            label: 'Krátký popis (karta produktu)',
            ui: { component: 'textarea', readonly: true },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Plný popis',
            isBody: true,
            ui: { readonly: true },
          },
        ],
      },
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
          { type: 'string', name: 'effectiveFrom', label: 'Ceník platný od (YYYY-MM-DD)', ui: { readonly: true } },
          {
            type: 'string',
            name: 'note',
            label: 'Poznámka k ceníku',
            ui: { component: 'textarea', readonly: true },
          },
          {
            type: 'object',
            name: 'honey',
            label: 'Med – ceny podle velikosti',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.size }),
            },
            fields: [
              { type: 'string', name: 'size', label: 'Velikost', ui: { readonly: true } },
              { type: 'number', name: 'price', label: 'Cena' },
              { type: 'string', name: 'unit', label: 'Jednotka', ui: { readonly: true } },
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
              { type: 'string', name: 'name', label: 'Název', ui: { readonly: true } },
              { type: 'string', name: 'size', label: 'Velikost', ui: { readonly: true } },
              { type: 'number', name: 'price', label: 'Cena' },
              { type: 'string', name: 'unit', label: 'Jednotka', ui: { readonly: true } },
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
              { type: 'string', name: 'name', label: 'Název', ui: { readonly: true } },
              { type: 'number', name: 'price', label: 'Cena' },
              { type: 'string', name: 'unit', label: 'Jednotka', ui: { readonly: true } },
            ],
          },
          {
            type: 'object',
            name: 'mead',
            label: 'Medovina (needitovatelné, jen zmínka)',
            fields: [
              { type: 'string', name: 'name', label: 'Název', ui: { readonly: true } },
              { type: 'string', name: 'variants', label: 'Varianty', list: true, ui: { readonly: true } },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea', readonly: true } },
            ],
          },
          {
            type: 'object',
            name: 'jarDeposit',
            label: 'Záloha na sklenici',
            fields: [
              { type: 'number', name: 'amount', label: 'Výše zálohy' },
              { type: 'string', name: 'currency', label: 'Měna', ui: { readonly: true } },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea', readonly: true } },
            ],
          },
          {
            type: 'string',
            name: 'namingNote',
            label: 'Poznámka k názvu sekce',
            ui: { component: 'textarea', readonly: true },
          },
        ],
      },
      {
        name: 'news',
        label: 'Aktuality',
        path: 'content/news',
        format: 'md',
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
