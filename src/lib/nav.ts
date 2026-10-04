export type NavItem = {
  label: string;
  href: string;
  cta?: boolean;
  children?: Array<{ label: string; href: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Domů', href: '/' },
  { label: 'O farmě', href: '/o-farme' },
  {
    label: 'Nabídka',
    href: '/#nabidka',
    children: [
      { label: 'Med', href: '/#med' },
      { label: 'Propolis', href: '/#propolis' },
      { label: 'Vosk & svíčky', href: '/#vosk-a-svicky' },
      { label: 'Oddělky', href: '/#oddelky' },
    ],
  },
  { label: 'Ceník', href: '/#cenik' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt', cta: true },
];
