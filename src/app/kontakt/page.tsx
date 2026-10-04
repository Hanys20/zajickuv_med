import type { Metadata } from 'next';
import Image from 'next/image';
import ContactSection from '@/components/sections/ContactSection';
import FaqTeaser from '@/components/sections/FaqTeaser';
import { salesPoints } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktujte Zajíčkův med v Opavě-Podvihově — objednávka medu, telefon, WhatsApp, prodejní místa a rozvoz do Opavy a Studénky.',
};

export default function KontaktPage() {
  return (
    <>
      <section className="px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <span className="eyebrow">Objednávka / dotaz</span>
          <h1 className="mt-1.5 text-2xl font-extrabold md:text-[28px]">Kontakt</h1>
          <ContactSection bare />
        </div>
      </section>

      <section className="section-dark border-t border-honey-900/50 px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
            <div>
              <span className="eyebrow-invert">Prodej a předání</span>
              <h2 className="mb-2.5 mt-1 text-xl font-extrabold text-white md:text-2xl">Kde nás najdete</h2>
              <p className="mb-5 max-w-[60ch] text-[14.5px] text-honey-50/80">
                Vyberte si způsob nákupu nebo předání, který vám vyhovuje.
              </p>

              {salesPoints.resellers.map((r) => (
                <div
                  key={r.name}
                  className="mb-2.5 flex items-start gap-3 rounded-md border border-honey-50/15 bg-honey-50/10 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-honey-200 bg-honey-50">
                    <Image src="/images/icons/house.svg" alt="" width={17} height={17} />
                  </span>
                  <div>
                    <strong className="text-[13.5px] text-white">Prodej na {r.name}</strong>
                    <p className="mt-1 text-[12.5px] text-honey-50/70">
                      {r.address} · {r.contactPerson} · {r.note}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3 rounded-md border border-honey-50/15 bg-honey-50/10 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-honey-200 bg-honey-50">
                  <Image src="/images/icons/car.svg" alt="" width={17} height={17} />
                </span>
                <div>
                  <strong className="text-[13.5px] text-white">Možnost rozvozu po Opavě a Studénce</strong>
                  <p className="mt-1 text-[12.5px] text-honey-50/70">{salesPoints.delivery.note}</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto hidden h-56 w-56 sm:block sm:h-64 sm:w-64 lg:h-full lg:w-full lg:max-w-none">
              <Image
                src="/images/watercolor/honey-jar.png"
                alt="Sklenice medu, malovaná ilustrace akvarelem"
                fill
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <FaqTeaser />
    </>
  );
}
