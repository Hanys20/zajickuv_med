import Link from 'next/link';
import { getHoneys, getPropolis, type Availability } from '@/lib/products';
import { cenik } from '@/lib/content';
import HoneyCards from './HoneyCards';
import PricingTable from './PricingTable';
import OfferCards, { type OfferProduct } from './OfferCards';
import Reveal from '@/components/ui/Reveal';

type AdditionalProduct = {
  name: string;
  description: string;
  photo: string;
  slug: string;
  availability: Availability;
};

const ADDITIONAL_PRODUCTS: {
  waxAndCandles: AdditionalProduct[];
  nucs: AdditionalProduct[];
} = {
  waxAndCandles: [
    {
      name: 'Včelí vosk',
      description: 'Včelí vosk z naší farmy. Konkrétní balení, dostupnost a další podrobnosti doplníme.',
      photo: '/images/photos/vceli-vosk.webp',
      slug: 'vceli-vosk',
      availability: 'available',
    },
    {
      name: 'Svíčky z mezistěn',
      description: 'Svíčky vyráběné z mezistěn. Varianty, rozměry a dostupnost doplníme.',
      photo: '/images/photos/svicky-z-mezisten.webp',
      slug: 'svicky-z-mezisten',
      availability: 'available',
    },
  ],
  nucs: [
    {
      name: 'Klasický oddělek',
      description: 'Připravené místo pro doplnění konkrétních parametrů a dostupnosti tohoto typu oddělku.',
      photo: '/images/photos/oddelek-klasicky.webp',
      slug: 'oddelek-klasicky',
      availability: 'sold-out',
    },
    {
      name: 'Sběrný oddělek',
      description: 'Připravené místo pro doplnění konkrétních parametrů a dostupnosti tohoto typu oddělku.',
      photo: '/images/photos/oddelek-sberny.webp',
      slug: 'oddelek-sberny',
      availability: 'sold-out',
    },
  ],
};

export default function ProductsPricing() {
  const honeys = getHoneys();
  const propolis = getPropolis();
  const offerProducts: OfferProduct[] = [
    ...propolis.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: 'Propolis',
      description: product.shortDescription,
      photo:
        product.slug === 'propolisova-tinktura'
          ? '/images/photos/propolisova-tinktura.webp'
          : '/images/photos/propolis-skrabany.webp',
      href: `/kontakt?produkt=${product.slug}#kontakt`,
      availability: product.availability,
    })),
    ...ADDITIONAL_PRODUCTS.waxAndCandles.map((product) => ({
      ...product,
      category: 'Vosk a svíčky',
      href: `/kontakt?produkt=${product.slug}#kontakt`,
      note: 'Podrobnosti připravujeme',
    })),
    ...ADDITIONAL_PRODUCTS.nucs.map((product) => ({
      ...product,
      category: 'Včelí oddělky',
      href: `/kontakt?produkt=${product.slug}#kontakt`,
      cta: 'Poptat',
      note: 'Parametry a cena budou doplněny',
    })),
  ];

  return (
    <section id="nabidka" className="scroll-mt-24 border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <Reveal className="mx-auto max-w-content">
        <div className="text-center">
          <span className="eyebrow">Naše nabídka</span>
          <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Co vám můžeme nabídnout</h2>
          <p className="mx-auto mt-2.5 max-w-[60ch] text-[14.5px] text-ink-dim">
            Vedle našich medů u nás najdete také propolis, včelí vosk, svíčky z mezistěn a včelí oddělky.
          </p>
          <nav aria-label="Kategorie nabídky" className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="#med" className="rounded-full border border-honey-300 bg-honey-50 px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-honey-100">Med</Link>
            <Link href="#propolis" className="rounded-full border border-honey-300 bg-honey-50 px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-honey-100">Propolis</Link>
            <Link href="#vosk-a-svicky" className="rounded-full border border-honey-300 bg-honey-50 px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-honey-100">Vosk &amp; svíčky</Link>
            <Link href="#oddelky" className="rounded-full border border-honey-300 bg-honey-50 px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-honey-100">Oddělky</Link>
          </nav>
        </div>

        <div id="med" className="scroll-mt-28 pt-9">
          <span className="eyebrow">Med</span>
          <h3 className="mt-1 text-lg font-extrabold md:text-xl">Vyberte si med podle své chuti</h3>
          <p className="mt-2 max-w-[68ch] text-[14px] text-ink-dim">
            Každý med je trochu jiný — jeho barvu, vůni i chuť ovlivňuje krajina, počasí a rostliny, které v době snůšky právě kvetou.
          </p>
        </div>
        <div className="mt-4">
          <HoneyCards initialHoneys={honeys} />
        </div>

        <div id="dalsi-nabidka" className="relative mt-10 scroll-mt-28 border-t border-border pt-8">
          <span id="propolis" className="absolute -top-24" aria-hidden="true" />
          <span id="vosk-a-svicky" className="absolute -top-24" aria-hidden="true" />
          <span id="oddelky" className="absolute -top-24" aria-hidden="true" />
          <span className="eyebrow">Dále nabízíme</span>
          <h3 className="mt-1 text-lg font-extrabold md:text-xl">Další produkty z naší včelí farmy</h3>
          <p className="mt-2 max-w-[68ch] text-[13px] text-ink-dim">
            Propolis, včelí vosk, svíčky z mezistěn a připravované včelí oddělky.
          </p>
        </div>

        <div className="mt-4">
          <OfferCards initialProducts={offerProducts} />
        </div>

        <div id="cenik" className="scroll-mt-28 pt-4">
          <PricingTable initialCenik={cenik} />
        </div>
      </Reveal>
    </section>
  );
}
