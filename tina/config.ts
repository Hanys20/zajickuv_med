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
        label: 'Produkty (med, propolis)',
        path: 'content/products',
        format: 'md',
        ui: {
          router: () => '/',
        },
        fields: [
          { type: 'string', name: 'name', label: 'Název', isTitle: true, required: true },
          { type: 'string', name: 'slug', label: 'Slug (identifikátor, needit bez důvodu)', required: true },
          {
            type: 'string',
            name: 'category',
            label: 'Kategorie',
            options: [
              { value: 'med', label: 'Med' },
              { value: 'propolis', label: 'Propolis' },
            ],
            required: true,
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
          {
            type: 'string',
            name: 'sizes',
            label: 'Dostupné velikosti balení',
            list: true,
          },
          {
            type: 'string',
            name: 'shortDescription',
            label: 'Krátký popis (karta produktu)',
            ui: { component: 'textarea' },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Plný popis',
            isBody: true,
          },
        ],
      },
      {
        name: 'news',
        label: 'Aktuality',
        path: 'content/news',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Titulek', isTitle: true, required: true },
          { type: 'datetime', name: 'date', label: 'Datum', required: true },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Text aktuality',
            isBody: true,
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
          { type: 'string', name: 'effectiveFrom', label: 'Ceník platný od (YYYY-MM-DD)' },
          { type: 'string', name: 'note', label: 'Poznámka k ceníku', ui: { component: 'textarea' } },
          {
            type: 'object',
            name: 'honey',
            label: 'Med – ceny podle velikosti',
            list: true,
            fields: [
              { type: 'string', name: 'size', label: 'Velikost' },
              { type: 'number', name: 'price', label: 'Cena' },
              { type: 'string', name: 'unit', label: 'Jednotka' },
            ],
          },
          {
            type: 'object',
            name: 'propolis',
            label: 'Propolisové produkty',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Název' },
              { type: 'string', name: 'size', label: 'Velikost' },
              { type: 'number', name: 'price', label: 'Cena' },
              { type: 'string', name: 'unit', label: 'Jednotka' },
            ],
          },
          {
            type: 'object',
            name: 'giftSets',
            label: 'Dárková balení',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Název' },
              { type: 'number', name: 'price', label: 'Cena' },
              { type: 'string', name: 'unit', label: 'Jednotka' },
            ],
          },
          {
            type: 'object',
            name: 'mead',
            label: 'Medovina (bez ceny, jen zmínka)',
            fields: [
              { type: 'string', name: 'name', label: 'Název' },
              { type: 'string', name: 'variants', label: 'Varianty', list: true },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'jarDeposit',
            label: 'Záloha na sklenici',
            fields: [
              { type: 'number', name: 'amount', label: 'Výše zálohy' },
              { type: 'string', name: 'currency', label: 'Měna' },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
          { type: 'string', name: 'namingNote', label: 'Poznámka k názvu sekce', ui: { component: 'textarea' } },
        ],
      },
      {
        name: 'faq',
        label: 'FAQ',
        path: 'content/faq',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
        },
        match: { include: 'faq' },
        fields: [
          {
            type: 'object',
            name: 'items',
            label: 'Otázky a odpovědi',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.question }),
            },
            fields: [
              { type: 'string', name: 'question', label: 'Otázka', required: true },
              { type: 'string', name: 'answer', label: 'Odpověď', ui: { component: 'textarea' }, required: true },
            ],
          },
        ],
      },
      {
        name: 'salesPoints',
        label: 'Prodejní místa a rozvoz',
        path: 'content/sales-points',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
        },
        match: { include: 'sales-points' },
        fields: [
          {
            type: 'object',
            name: 'resellers',
            label: 'Prodejní místa',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Název' },
              { type: 'string', name: 'contactPerson', label: 'Kontaktní osoba' },
              { type: 'string', name: 'address', label: 'Adresa' },
              { type: 'string', name: 'note', label: 'Poznámka' },
            ],
          },
          {
            type: 'object',
            name: 'delivery',
            label: 'Rozvoz',
            fields: [
              { type: 'string', name: 'areas', label: 'Oblasti rozvozu', list: true },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
        ],
      },
      {
        name: 'settings',
        label: 'Nastavení webu',
        path: 'content/settings',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
        },
        match: { include: 'site' },
        fields: [
          {
            type: 'object',
            name: 'company',
            label: 'Firma',
            fields: [
              { type: 'string', name: 'name', label: 'Název' },
              { type: 'string', name: 'owner', label: 'Majitel' },
              { type: 'string', name: 'ico', label: 'IČO' },
              { type: 'string', name: 'icoNote', label: 'Poznámka k IČO', ui: { component: 'textarea' } },
              { type: 'string', name: 'yearsOnMarket', label: 'Let na trhu' },
              { type: 'string', name: 'beehivesCount', label: 'Počet včelstev' },
              { type: 'string', name: 'region', label: 'Region' },
            ],
          },
          {
            type: 'object',
            name: 'contact',
            label: 'Kontakt',
            fields: [
              { type: 'string', name: 'person', label: 'Kontaktní osoba' },
              {
                type: 'object',
                name: 'address',
                label: 'Adresa',
                fields: [
                  { type: 'string', name: 'street', label: 'Ulice' },
                  { type: 'string', name: 'city', label: 'Obec' },
                  { type: 'string', name: 'zip', label: 'PSČ' },
                ],
              },
              { type: 'string', name: 'phone', label: 'Telefon' },
              { type: 'string', name: 'email', label: 'E-mail' },
            ],
          },
          {
            type: 'object',
            name: 'socials',
            label: 'Sociální sítě',
            fields: [
              { type: 'string', name: 'facebook', label: 'Facebook (odkaz)' },
              { type: 'string', name: 'instagram', label: 'Instagram (odkaz)' },
              { type: 'string', name: 'whatsapp', label: 'WhatsApp (telefon)' },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'salesPoints',
            label: 'Prodejní místa (zobrazená na webu)',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Název' },
              { type: 'string', name: 'contactPerson', label: 'Kontaktní osoba' },
              { type: 'string', name: 'address', label: 'Adresa' },
              { type: 'string', name: 'note', label: 'Poznámka' },
            ],
          },
          {
            type: 'object',
            name: 'delivery',
            label: 'Rozvoz',
            fields: [{ type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } }],
          },
          { type: 'string', name: 'seoLocations', label: 'SEO lokality', list: true },
          {
            type: 'object',
            name: 'analytics',
            label: 'Analytika / cookies',
            fields: [
              { type: 'boolean', name: 'cookieConsentRequired', label: 'Vyžadovat cookie souhlas' },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'reviews',
            label: 'Recenze',
            fields: [
              { type: 'string', name: 'status', label: 'Stav' },
              { type: 'string', name: 'plan', label: 'Plán', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'domainRegistrar',
            label: 'Správce domény',
            fields: [
              { type: 'string', name: 'contactPerson', label: 'Kontaktní osoba' },
              { type: 'string', name: 'phone', label: 'Telefon(y)', list: true },
              { type: 'string', name: 'email', label: 'E-mail' },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
          { type: 'string', name: 'pricingEffectiveFrom', label: 'Ceník platný od' },
          {
            type: 'object',
            name: 'jarDeposit',
            label: 'Záloha na sklenici',
            fields: [
              { type: 'number', name: 'amount', label: 'Výše zálohy' },
              { type: 'string', name: 'currency', label: 'Měna' },
              { type: 'string', name: 'note', label: 'Poznámka', ui: { component: 'textarea' } },
            ],
          },
        ],
      },
    ],
  },
});
