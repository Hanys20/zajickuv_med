import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ValuesGrid from '@/components/sections/ValuesGrid';
import Timeline from '@/components/sections/Timeline';
import StoryBlock from '@/components/sections/StoryBlock';

export const metadata: Metadata = {
  title: 'O farmě',
  description:
    'Rodinná tradice včelaření sahající do 19. století. Poznejte příběh farmy Zajíčkův med v Opavě-Podvihově a způsob, jakým se šetrně staráme o naše včely.',
};

export default function OFarmePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-honey-50/70 to-paper px-4 py-8 sm:px-6 md:py-12">
        <div className="relative mx-auto max-w-content">
          <span className="eyebrow">O farmě</span>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight md:text-[32px]">
            Rodinná farma s kořeny až v 19. století
          </h1>
          <p className="mt-3 max-w-[60ch] text-[14.5px] text-ink-dim">
            Naše včelaření není jen způsobem získávání medu — je to rodinná tradice předávaná
            z generace na generaci.
          </p>
        </div>
      </section>

      <section className="section-tint border-b border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow">Naše hodnoty</span>
          <h2 className="mb-5 mt-1 text-xl font-extrabold md:text-2xl">Co je pro nás důležité</h2>
          <ValuesGrid />
        </div>
      </section>

      <section className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow">Historie</span>
          <h2 className="mb-5 mt-1 text-xl font-extrabold md:text-2xl">Naše cesta ve zkratce</h2>
          <Timeline />
        </div>
      </section>

      <section className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow">Celý příběh</span>
          <h2 className="mb-5 mt-1 text-xl font-extrabold md:text-2xl">Jak to celé začalo</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <StoryBlock title="Příběh rodiny">
                Počátky včelaření jsou spojeny s Volyní, dnešní Ukrajinou, kde žil strýc otce. Po
                druhé světové válce se rodina vracela do Československa, včely ale nebylo možné
                převézt — tradice byla na čas přerušena, než se k ní jako chlapec vrátil otec.
              </StoryBlock>
              <StoryBlock title="Návrat ke včelám">
                Aktivně včelařit jsem začal kolem svých 30. narozenin — první vlastní včelstvo
                jako dar od manželky a švagrové. Ve stejném roce jsem převzal i včelstva po otci a
                pokračuji v rodinné tradici dodnes.
              </StoryBlock>
              <StoryBlock title="Kde naše včely žijí">
                Společně s manželkou pečujeme o ~40 včelstev ve výšce 200–550 m — poblíž
                vojenského prostoru Libavá a na úpatí Nízkého Jeseníku. Rozmanitost krajiny dává
                medům rozdílnou barvu, vůni i chuť.
              </StoryBlock>
            </div>
            <div className="relative min-h-[260px] overflow-hidden rounded-l border border-honey-200/70 shadow-warm lg:min-h-full">
              <Image
                src="/images/photos/o-farme-apiary-family.jpg"
                alt="Včelaři kontrolují rámek u úlů na stanovišti"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-tint border-b border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow">Metody</span>
          <h2 className="mb-5 mt-1 text-xl font-extrabold md:text-2xl">Jak včelaříme</h2>

          <div className="relative mb-6 h-[180px] overflow-hidden rounded-l border border-honey-200/70 shadow-warm sm:h-[220px]">
            <Image
              src="/images/photos/jak-vcelarime-honeycomb.jpg"
              alt="Detail panenského plástu s medem"
              fill
              sizes="(min-width: 768px) 1180px, 100vw"
              className="object-cover"
            />
          </div>

          <StoryBlock title="Dřevěné úly a přírodní materiály">
            Rámková míra 390×240 mm a nízké nástavce Langstroth 448×159 mm. Dřevěné úly z masivu
            nebo izolované — bez plastových rámků a mezistěn.
          </StoryBlock>
          <StoryBlock title="Vlastní koloběh vosku">
            Výhradně vosk z vlastních včelstev. Čistíme a dezinfikujeme při vysoké teplotě, bez
            kyseliny sírové či fosforečné. Mezistěny vyrábíme sami.
          </StoryBlock>
          <StoryBlock title="Med z panenských plástů">
            Plásty, které nikdy nepřišly do styku se včelím plodem — sluníčkově žluté, voní po
            medu a vosku.
          </StoryBlock>
          <StoryBlock title="Šetrná péče o zdraví včel">
            Sledujeme výskyt Varroa destructor, používáme organické kyseliny a mechanické zásahy
            (varroapasti) místo syntetických akaricidů. Šlechtíme přirozeně odolnější včelstva.
          </StoryBlock>
          <StoryBlock title="Tradice, kterou předáváme dál">
            Ke včelám bereme i naše děti — chceme jim předat úctu ke včelám i vnímání přírody,
            stejně jako to bylo předáno nám.
          </StoryBlock>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto flex max-w-content justify-center">
          <Link href="/#produkty" className="btn btn-primary">
            Chci ochutnat náš med
          </Link>
        </div>
      </section>
    </>
  );
}
