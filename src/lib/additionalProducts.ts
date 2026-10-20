export type AdditionalProduct = {
  slug: string;
  name: string;
  description: string;
  photo: string;
  group: 'waxAndCandles' | 'nucs';
  availability: 'available' | 'sold-out';
};

export const ADDITIONAL_PRODUCTS: AdditionalProduct[] = [
  {
    slug: 'vceli-vosk',
    name: 'Včelí vosk',
    description: 'Včelí vosk z našich vlastních včelstev. Sami ho čistíme a vyrábíme z něj mezistěny.',
    photo: '/images/photos/vceli-vosk.webp',
    group: 'waxAndCandles',
    availability: 'available',
  },
  {
    slug: 'motane-svicky',
    name: 'Motané svíčky',
    description: 'Svíčky z včelího vosku. Průměr 50 mm, výška 110 mm, hmotnost 80 g.',
    photo: '/images/photos/motane-svicky.webp',
    group: 'waxAndCandles',
    availability: 'available',
  },
  {
    slug: 'vyzimovane-vcelstvo',
    name: 'Vyzimované včelstvo',
    description: 'Včelstvo s mladou značenou matkou na 10–11 rámcích.',
    photo: '/images/photos/vyzimovane-vcelstvo.webp',
    group: 'nucs',
    availability: 'sold-out',
  },
  {
    slug: 'vyzimovany-oddelek',
    name: 'Vyzimovaný oddělek',
    description: 'Včelstvo s mladou značenou matkou na 6 rámcích.',
    photo: '/images/photos/vyzimovany-oddelek.webp',
    group: 'nucs',
    availability: 'sold-out',
  },
  {
    slug: 'letni-oddelek',
    name: 'Letní oddělek',
    description: 'Včelstvo s mladou značenou matkou na 5–6 rámcích.',
    photo: '/images/photos/letni-oddelek.webp',
    group: 'nucs',
    availability: 'sold-out',
  },
];
