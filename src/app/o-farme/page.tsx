import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ValuesGrid from '@/components/sections/ValuesGrid';
import Timeline from '@/components/sections/Timeline';
import StoryBlock from '@/components/sections/StoryBlock';

export const metadata: Metadata = {
  title: 'O farmě',
  description:
    'Rodinná tradice včelaření sahající do devatenáctého století. Poznejte příběh farmy Zajíčkův med v Opavě-Podvihově a způsob, jakým se šetrně staráme o naše včely.',
};

export default function OFarmePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-honey-100/70 via-honey-50/40 to-paper">
        <div className="relative mx-auto max-w-hero px-4 pb-6 pt-12 sm:px-6 sm:py-16 md:py-20 lg:px-10">
          <div className="grid items-center gap-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
            <div className="max-w-[560px]">
              <span className="eyebrow">O farmě</span>
              <h1 className="mt-2.5 text-[26px] font-extrabold leading-tight md:text-[38px]">
                Rodinná farma s kořeny až v 19. století
              </h1>
              <p className="mt-3 max-w-[54ch] text-[14.5px] text-ink-dim">
                Naše včelaření není jen způsobem získávání medu — je to rodinná tradice předávaná
                z generace na generaci.
              </p>
            </div>

            <div className="relative mx-auto h-[260px] w-full max-w-[460px] sm:h-[320px] md:h-[400px] md:max-w-none lg:h-[460px]">
              <Image
                src="/images/watercolor/family-tradition.png"
                alt="Rodinná tradice včelaření, malovaná ilustrace akvarelem"
                fill
                priority
                sizes="(min-width: 768px) 45vw, 90vw"
                className="-scale-x-100 object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-dark border-b border-honey-900/50 px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow-invert">Naše hodnoty</span>
          <h2 className="mb-5 mt-1 text-xl font-extrabold text-white md:text-2xl">Co je pro nás důležité</h2>
          <ValuesGrid />
        </div>
      </section>

      <section id="historie" className="scroll-mt-24 border-b border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-stretch lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
            <div className="text-center md:text-left lg:order-1">
              <span className="eyebrow">Historie</span>
              <h2 className="mb-5 mt-1 text-xl font-extrabold md:text-2xl lg:mb-8 lg:text-[34px]">
                Naše cesta ve zkratce
              </h2>
              <Timeline />
            </div>
            <div className="relative mx-auto h-[240px] w-full max-w-[360px] sm:h-[300px] md:h-auto md:min-h-[320px] md:max-w-none lg:order-2 lg:h-[360px] lg:min-h-0 lg:max-w-[400px] xl:h-[390px]">
              <Image
                src="/images/watercolor/old-smoker.png"
                alt="Starý dýmák, malovaná ilustrace akvarelem"
                fill
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-dark border-b border-honey-900/50 px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow-invert">Celý příběh</span>
          <h2 className="mb-5 mt-1 text-xl font-extrabold text-white md:text-2xl">Jak to celé začalo</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <StoryBlock title="Příběh rodiny" dark>
                Počátky včelaření jsou spojeny s Volyní, dnešní Ukrajinou, kde žil strýc otce. Po
                druhé světové válce se rodina vracela do Československa, včely ale nebylo možné
                převézt — tradice byla na čas přerušena, než se k ní jako chlapec vrátil otec.
              </StoryBlock>
              <StoryBlock title="Návrat ke včelám" dark>
                Aktivně včelařit jsem začal kolem svých 30. narozenin — první vlastní včelstvo
                jako dar od manželky a švagrové. Ve stejném roce jsem převzal i včelstva po otci a
                pokračuji v rodinné tradici dodnes.
              </StoryBlock>
              <StoryBlock title="Kde naše včely žijí" dark>
                Společně s manželkou pečujeme o ~40 včelstev ve výšce 200–550 m — poblíž
                vojenského prostoru Libavá a na úpatí Nízkého Jeseníku. Rozmanitost krajiny dává
                medům rozdílnou barvu, vůni i chuť.
              </StoryBlock>
            </div>
            <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-honey-50/15 shadow-warm lg:min-h-full">
              <Image
                src="/images/photos/o-farme-apiary-family.jpg"
                alt="Řada úlů na našem včelím stanovišti"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="relative order-2 min-h-[260px] overflow-hidden rounded-xl border border-honey-200/70 shadow-warm lg:order-1">
              <Image
                src="/images/photos/jak-vcelarime-honeycomb.jpg"
                alt="Detail plástu s medem a včelou na prstu včelaře"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-[center_75%] lg:object-center"
              />
            </div>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Metody</span>
              <h2 className="mb-5 mt-1 text-xl font-extrabold md:text-2xl">Jak včelaříme</h2>
              <StoryBlock title="Dřevěné úly a přírodní materiály">
                Rámková míra 390×240 mm a nízké nástavce Langstroth 448×159 mm. Dřevěné úly z
                masivu nebo izolované — bez plastových rámků a mezistěn.
              </StoryBlock>
              <StoryBlock title="Vlastní koloběh vosku">
                Výhradně vosk z vlastních včelstev. Čistíme a dezinfikujeme při vysoké teplotě,
                bez kyseliny sírové či fosforečné. Mezistěny vyrábíme sami.
              </StoryBlock>
              <StoryBlock title="Med z panenských plástů">
                Plásty, které nikdy nepřišly do styku se včelím plodem — sluníčkově žluté, voní po
                medu a vosku.
              </StoryBlock>
              <StoryBlock title="Šetrná péče o zdraví včel">
                Sledujeme výskyt Varroa destructor, používáme organické kyseliny a mechanické
                zásahy (varroapasti) místo syntetických akaricidů. Šlechtíme přirozeně odolnější
                včelstva.
              </StoryBlock>
              <StoryBlock title="Tradice, kterou předáváme dál">
                Ke včelám bereme i naše děti — chceme jim předat úctu ke včelám i vnímání
                přírody, stejně jako to bylo předáno nám.
              </StoryBlock>

            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-md border border-honey-200 bg-honey-50 p-5 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="text-base font-bold">Poznejte, co naše rodinná farma nabízí</h3>
              <p className="mt-1 text-[13px] text-ink-dim">Prohlédněte si nabídku nebo se nám ozvěte s dotazem.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 sm:justify-end">
              <Link href="/#nabidka" className="btn btn-primary">
                Naše nabídka
              </Link>
              <Link href="/kontakt" className="btn btn-secondary">
                Kontaktovat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
