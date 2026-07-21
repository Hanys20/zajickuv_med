import siteJson from '@content/settings/site.json';
import cenikJson from '@content/pricing/cenik.json';
import faqJson from '@content/faq/faq.json';
import salesPointsJson from '@content/sales-points/sales-points.json';

export type SiteSettings = typeof siteJson;
export type Cenik = typeof cenikJson;
export type FaqItem = { question: string; answer: string };
export type SalesPoints = typeof salesPointsJson;

export const site: SiteSettings = siteJson;
export const cenik: Cenik = cenikJson;
export const faq: FaqItem[] = faqJson;
export const salesPoints: SalesPoints = salesPointsJson;
