import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/photos/hero-beekeeper-apiary.jpg"
          alt="Včelař v ochranném obleku pracuje u úlů se zakuřovačem na lesním stanovišti"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-ink/60 sm:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent sm:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/92 via-ink/60 to-ink/10 sm:block" />
      </div>

      <div className="relative mx-auto max-w-header px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-10">
        <div className="max-w-[560px]">
          <span className="eyebrow-invert">Rodinná včelí farma · Opava-Podvihov</span>
          <h1 className="mt-2.5 text-[30px] font-extrabold leading-tight text-white md:text-[46px]">
            Med s rodinným příběhem
          </h1>
          <p className="mt-3 text-base font-semibold text-honey-100">
            Od včel, o které pečujeme s respektem k jejich přirozenosti
          </p>
          <p className="mt-3 max-w-[46ch] text-[14.5px] text-honey-50/85">
            Poctivý český med z našich stanovišť v okolí Libavé a na úpatí Nízkého Jeseníku. Od
            vlastního vosku až po sklenici medu máme celý proces ve svých rukou.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link href="/#produkty" className="btn btn-primary">
              Co u nás vzniká
            </Link>
            <Link href="/#kontakt" className="btn btn-invert">
              Kontaktovat
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
