export type NavItem = {
  label: string;
  href: string;
  cta?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Domů', href: '/' },
  { label: 'O farmě', href: '/o-farme' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Naše medy', href: '/#produkty', cta: true },
];
