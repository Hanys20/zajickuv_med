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

      <section className="section-frame border-t border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <h2 className="mb-5 text-xl font-extrabold md:text-2xl">Kde jinde med seženete</h2>

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
                    <strong className="text-[13.5px]">
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
                  <strong className="text-[13.5px]">Rozvoz po dohodě</strong>
                  <p className="mt-1 text-[12.5px] text-ink-dim">{salesPoints.delivery.areas.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto hidden h-40 w-40 sm:block sm:h-48 sm:w-48">
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
