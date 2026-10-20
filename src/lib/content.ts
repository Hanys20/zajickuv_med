import siteJson from '@content/settings/site.json';
import cenikJson from '@content/pricing/cenik.json';
import faqJson from '@content/faq/faq.json';
import salesPointsJson from '@content/sales-points/sales-points.json';
import type { Cenik } from './pricing';

export type SiteSettings = typeof siteJson;
export type { Cenik, PricedItem } from './pricing';
export type FaqItem = { question: string; answer: string };
export type SalesPoints = typeof salesPointsJson;

export const site: SiteSettings = siteJson;
export const cenik = cenikJson as Cenik;
export const faq: FaqItem[] = faqJson.items;
export const salesPoints: SalesPoints = salesPointsJson;
