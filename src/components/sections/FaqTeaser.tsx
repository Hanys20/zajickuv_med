import Link from 'next/link';
import { faq } from '@/lib/content';
import FaqAccordion from './FaqAccordion';

// Nejdůležitější otázky pro homepage z pohledu nového/váhajícího zákazníka
// (proces nákupu, důvěryhodnost/původ, praktická logistika) - ne nutně první
// tři v content/faq/faq.json.
const HOMEPAGE_QUESTIONS = ['Jak probíhá nákup medu?', 'Odkud váš med pochází?', 'Mohu vám vrátit prázdnou sklenici?'];

export default function FaqTeaser() {
  const items = HOMEPAGE_QUESTIONS.map((q) => faq.find((item) => item.question === q)).filter(
    (item): item is (typeof faq)[number] => Boolean(item)
  );

  return (
    <section className="section-tint border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <span className="eyebrow">Nejčastější dotazy</span>
            <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Co vás asi zajímá</h2>
            <p className="mt-2.5 max-w-[42ch] text-[14.5px] text-ink-dim">
              Odpovědi na otázky, které nám zákazníci pokládají nejčastěji — o nákupu, původu medu
              i vratných sklenicích.
            </p>
            <div className="mt-4">
              <Link href="/faq" className="btn btn-secondary">
                Zobrazit všechny otázky →
              </Link>
            </div>
          </div>

          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
