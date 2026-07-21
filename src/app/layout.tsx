import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/layout/BackToTop';
import '@/styles/globals.css';

const workSans = Work_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zajíčkův med — poctivý med z Opavy-Podvihova',
    template: '%s — Zajíčkův med',
  },
  description:
    'Rodinná včelí farma v Opavě-Podvihově. Poctivý český med a propolisové produkty z vlastních stanovišť u Libavé a Nízkého Jeseníku. Ostrava, Opava, Studénka.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={workSans.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
