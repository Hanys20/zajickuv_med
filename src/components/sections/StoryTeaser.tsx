import Link from 'next/link';
import Image from 'next/image';

export default function StoryTeaser() {
  return (
    <section className="section-dark border-b border-honey-900/40 px-4 py-10 sm:px-6 md:py-14">
      <div className="relative mx-auto grid max-w-content items-center gap-7 md:grid-cols-[1fr_1.1fr]">
        <div className="md:order-2">
          <span className="eyebrow-invert">Náš příběh</span>
          <h2 className="mt-1 text-xl font-extrabold text-white md:text-2xl">
            Včelaření, které se v naší rodině předává po generace
          </h2>
          <p className="mt-3 max-w-[60ch] text-[14.5px] leading-relaxed text-honey-100/85">
            Kořeny našeho rodinného včelaření sahají až do 19. století na Volyň. Rodinná tradice
            byla po válce na čas přerušena, ale otec se k ní vrátil — a dnes v jeho práci
            pokračujeme s dětmi po boku. Pečujeme o přibližně 40 včelstev v nadmořské výšce
            200–550 m u Libavé a na úpatí Nízkého Jeseníku.
          </p>
          <div className="mt-5">
            <Link href="/o-farme" className="btn btn-invert">
              Přečíst celý náš příběh →
            </Link>
          </div>
        </div>
        <div className="w-full overflow-hidden rounded-xl border border-honey-900/40 shadow-warm md:order-1">
          <Image
            src="/images/photos/story-rodinna-tradice.webp"
            alt="Včelař kontroluje rámek se včelami u otevřeného úlu"
            width={1400}
            height={933}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
