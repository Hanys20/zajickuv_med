import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-honey-100/70 via-honey-50/40 to-paper">
      <div className="relative mx-auto max-w-header px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
          <div className="max-w-[560px]">
            <span className="eyebrow">Rodinná včelí farma · Opava-Podvihov</span>
            <h1 className="mt-2.5 text-[30px] font-extrabold leading-tight md:text-[46px]">
              Med s rodinným příběhem
            </h1>
            <p className="mt-3 text-base font-semibold">
              Od včel, o které pečujeme s respektem k jejich přirozenosti
            </p>
            <p className="mt-3 max-w-[46ch] text-[14.5px] text-ink-dim">
              Poctivý český med z našich stanovišť v okolí Libavé a na úpatí Nízkého Jeseníku. Od
              vlastního vosku až po sklenici medu máme celý proces ve svých rukou.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link href="/#produkty" className="btn btn-primary">
                Co u nás vzniká
              </Link>
              <Link href="/#kontakt" className="btn btn-secondary">
                Kontaktovat
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-[220px] w-full max-w-[420px] sm:h-[280px] md:h-[340px] md:max-w-none lg:h-[400px]">
            <Image
              src="/images/watercolor/hives-two.png"
              alt="Dva úly, malovaná ilustrace akvarelem"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 90vw"
              className="-scale-x-100 object-contain object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
