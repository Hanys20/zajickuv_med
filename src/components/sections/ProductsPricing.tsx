import { getHoneys } from '@/lib/products';
import { cenik } from '@/lib/content';
import HoneyCards from './HoneyCards';
import PricingTable from './PricingTable';

export default function ProductsPricing() {
  const honeys = getHoneys();

  return (
    <section id="produkty" className="scroll-mt-20 border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Co u nás vzniká</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Vyberte si med podle své chuti</h2>
        <p className="mt-2.5 max-w-[60ch] text-[14.5px] text-ink-dim">
          Každý med je trochu jiný — jeho barvu, vůni i chuť ovlivňuje krajina, počasí a
          rostliny, které v době snůšky právě kvetou.
        </p>

        <div className="mt-5">
          <HoneyCards initialHoneys={honeys} />
        </div>

        <PricingTable initialCenik={cenik} />
      </div>
    </section>
  );
}
