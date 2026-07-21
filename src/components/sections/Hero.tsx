import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-honey-100/70 via-honey-50/40 to-paper px-4 py-8 sm:px-6 sm:py-10 md:py-16">
      <div className="relative mx-auto grid max-w-content items-center gap-7 md:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="eyebrow">Rodinná včelí farma · Opava-Podvihov</span>
          <h1 className="mt-2.5 text-[26px] font-extrabold leading-tight md:text-[38px]">
            Med s rodinným příběhem
          </h1>
          <p className="mt-2.5 text-base font-semibold">
            Od včel, o které pečujeme s respektem k jejich přirozenosti
          </p>
          <p className="mt-2.5 max-w-[46ch] text-[14.5px] text-ink-dim">
            Poctivý český med z našich stanovišť v okolí Libavé a na úpatí Nízkého Jeseníku. Od
            vlastního vosku až po sklenici medu máme celý proces ve svých rukou.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Link href="/#produkty" className="btn btn-primary">
              Co u nás vzniká
            </Link>
            <Link href="/#kontakt" className="btn btn-secondary">
              Kontaktovat
            </Link>
          </div>
        </div>
        <div className="relative min-h-[220px] overflow-hidden rounded-l border border-honey-200/70 shadow-warm md:min-h-[320px]">
          <Image
            src="/images/photos/hero-beekeeper-apiary.jpg"
            alt="Včelař v ochranném obleku pracuje u úlů se zakuřovačem na lesním stanovišti"
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
