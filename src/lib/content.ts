import siteJson from '@content/settings/site.json';
import cenikJson from '@content/pricing/cenik.json';
import faqJson from '@content/faq/faq.json';
import salesPointsJson from '@content/sales-points/sales-points.json';

export type SiteSettings = typeof siteJson;
export type PricedItem = {
  name: string;
  size: string | null;
  price: number | null;
  unit: string;
};
export type Cenik = Omit<typeof cenikJson, 'waxAndCandles' | 'nucs'> & {
  waxAndCandles: PricedItem[];
  nucs: PricedItem[];
};
export type FaqItem = { question: string; answer: string };
export type SalesPoints = typeof salesPointsJson;

export const site: SiteSettings = siteJson;
export const cenik = cenikJson as Cenik;
export const faq: FaqItem[] = faqJson.items;
export const salesPoints: SalesPoints = salesPointsJson;
