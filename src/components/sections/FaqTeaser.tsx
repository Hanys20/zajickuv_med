import Link from 'next/link';
import { faq } from '@/lib/content';
import FaqAccordion from './FaqAccordion';

export default function FaqTeaser() {
  return (
    <section className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Nejčastější dotazy</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">FAQ</h2>

        <div className="mt-5">
          <FaqAccordion items={faq.slice(0, 3)} />
        </div>

        <div className="mt-4">
          <Link href="/faq" className="btn btn-secondary">
            Zobrazit všechny otázky →
          </Link>
        </div>
      </div>
    </section>
  );
}
