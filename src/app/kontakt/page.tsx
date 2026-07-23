import type { Metadata } from 'next';
import Image from 'next/image';
import ContactSection from '@/components/sections/ContactSection';
import FaqTeaser from '@/components/sections/FaqTeaser';
import { salesPoints } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktujte Zajíčkův med v Opavě-Podvihově — objednávka medu, telefon, WhatsApp, prodejní místa a rozvoz do Opavy a Studénky.',
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
          <span className="eyebrow-invert">Prodejní místa a rozvoz</span>
          <h2 className="mb-2.5 mt-1 text-xl font-extrabold text-white md:text-2xl">Kde jinde med seženete</h2>
          <p className="mb-5 max-w-[60ch] text-[14.5px] text-honey-50/80">
            Med od nás seženete i mimo naši farmu — u vybraného prodejce, nebo přímo u vás doma
            díky rozvozu po dohodě.
          </p>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              {salesPoints.resellers.map((r) => (
                <div
                  key={r.name}
                  className="mb-2.5 flex items-start gap-3 rounded-md border border-border bg-paper-raised p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-honey-200 bg-honey-50">
                    <Image src="/images/icons/house.svg" alt="" width={17} height={17} />
                  </span>
                  <div>
                    <strong className="text-[13.5px] text-ink">
                      {r.name} — {r.contactPerson}
                    </strong>
                    <p className="mt-1 text-[12.5px] text-ink-dim">
                      {r.address} · {r.note}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3 rounded-md border border-border bg-paper-raised p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-honey-200 bg-honey-50">
                  <Image src="/images/icons/car.svg" alt="" width={17} height={17} />
                </span>
                <div>
                  <strong className="text-[13.5px] text-ink">Rozvoz po dohodě</strong>
                  <p className="mt-1 text-[12.5px] text-ink-dim">{salesPoints.delivery.areas.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto hidden h-56 w-56 sm:block sm:h-64 sm:w-64 lg:h-72 lg:w-72">
              <Image
                src="/images/watercolor/honeycomb.png"
                alt="Včelí plástev, malovaná ilustrace akvarelem"
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
