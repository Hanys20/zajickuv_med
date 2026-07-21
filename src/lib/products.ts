import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Availability = 'available' | 'sold-out';

export type Product = {
  name: string;
  slug: string;
  category: 'med' | 'propolis';
  availability: Availability;
  sizes: string[];
  price?: number;
  priceUnit?: string;
  shortDescription: string;
  body: string;
};

const PRODUCTS_DIR = path.join(process.cwd(), 'content', 'products');

// Pořadí karet medu tak, jak je definoval klient na homepage / v ceníku.
const HONEY_ORDER = [
  'med-kvetovy-jarni',
  'med-kvetovy-jarni-pastovany',
  'med-kvetovy-lipovy',
  'med-kvetovy-pohankovy',
  'med-smiseny',
  'med-medovicovy-lesni',
];

export function getAllProducts(): Product[] {
  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      name: data.name,
      slug: data.slug,
      category: data.category,
      availability: data.availability,
      sizes: data.sizes ?? [],
      price: data.price,
      priceUnit: data.priceUnit,
      shortDescription: data.shortDescription,
      body: content.trim(),
    } satisfies Product;
  });
}

export function getHoneys(): Product[] {
  const all = getAllProducts().filter((p) => p.category === 'med');
  return HONEY_ORDER.map((slug) => all.find((p) => p.slug === slug)).filter(
    (p): p is Product => Boolean(p)
  );
}

export function getPropolis(): Product[] {
  return getAllProducts().filter((p) => p.category === 'propolis');
}
