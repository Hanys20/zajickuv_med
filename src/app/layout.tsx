import type { Metadata } from 'next';
import { Work_Sans, PT_Serif } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/layout/BackToTop';
import CookieConsent from '@/components/CookieConsent';
import IntroAnimation from '@/components/IntroAnimation';
import '@/styles/globals.css';

const workSans = Work_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

// Klientův brandový font - jen na nadpisy a tlačítka, ne na běžný text
// (viz CLAUDE.md/zadání: "žádné přemrštěné fonty" pro čitelnost běžného textu).
const ptSerif = PT_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zajíčkův med — poctivý med z Opavy-Podvihova',
    template: '%s — Zajíčkův med',
  },
  description:
    'Rodinná včelí farma v Opavě-Podvihově. Český med, propolis, včelí vosk, svíčky a včelí oddělky z vlastních stanovišť u Libavé a Nízkého Jeseníku.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${workSans.variable} ${ptSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <IntroAnimation />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </body>
    </html>
  );
}
