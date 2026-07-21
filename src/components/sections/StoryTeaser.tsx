import Link from 'next/link';

export default function StoryTeaser() {
  return (
    <section className="section-dark border-b border-honey-900/40 px-4 py-10 sm:px-6 md:py-14">
      <div className="relative mx-auto max-w-content">
        <span className="eyebrow-invert">Náš příběh</span>
        <h2 className="mt-1 text-xl font-extrabold text-white md:text-2xl">
          Včelaření, které se v naší rodině předává po generace
        </h2>
        <p className="mt-3 max-w-[60ch] text-[14.5px] leading-relaxed text-honey-100/85">
          Kořeny našeho rodinného včelaření sahají až do 19. století na Volyň. Rodinná tradice
          byla po válce na čas přerušena, ale otec se k ní vrátil — a dnes v jeho práci
          pokračujeme s dětmi po boku. Pečujeme o přibližně 40 včelstev v nadmořské výšce
          200–550 m u Libavé a na úpatí Nízkého Jeseníku.
        </p>
        <div className="mt-5">
          <Link href="/o-farme" className="btn btn-invert">
            Přečíst celý náš příběh →
          </Link>
        </div>
      </div>
    </section>
  );
}
