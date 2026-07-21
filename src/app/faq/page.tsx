import type { Metadata } from 'next';
import Link from 'next/link';
import { faq } from '@/lib/content';
import FaqAccordion from '@/components/sections/FaqAccordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Odpovědi na nejčastější otázky o medu — krystalizace, skladování, nákup a původ medu od Zajíčkova medu z Opavy-Podvihova.',
};

export default function FaqPage() {
  return (
    <section className="px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Nejčastější dotazy</span>
        <h1 className="mt-1.5 text-2xl font-extrabold md:text-[28px]">FAQ</h1>

        <div className="mt-5">
          <FaqAccordion items={faq} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-[13.5px] text-ink-dim">Nenašli jste odpověď?</span>
          <Link href="/kontakt" className="btn btn-secondary">
            Napište nám
          </Link>
        </div>
      </div>
    </section>
  );
}
