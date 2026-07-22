import type { Metadata } from 'next';
import Image from 'next/image';
import ContactSection from '@/components/sections/ContactSection';
import { salesPoints } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktujte Zajíčkův med v Opavě-Podvihově — objednávka medu, telefon, WhatsApp, prodejní místa a rozvoz do Opavy a Studénky.',
};

export default function KontaktPage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 py-8 sm:px-6 md:py-12">
        <Image
          src="/images/watercolor/smoker.png"
          alt=""
          width={635}
          height={800}
          className="pointer-events-none absolute -right-4 -top-6 hidden w-28 select-none sm:block md:w-32"
        />
        <div className="relative mx-auto max-w-content">
          <span className="eyebrow">Objednávka / dotaz</span>
          <h1 className="mt-1.5 text-2xl font-extrabold md:text-[28px]">Kontakt</h1>
          <ContactSection bare />
        </div>
      </section>

      <section className="border-t border-border px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-content">
          <h2 className="mb-5 text-xl font-extrabold md:text-2xl">Kde jinde med seženete</h2>

          {salesPoints.resellers.map((r) => (
            <div key={r.name} className="mb-2.5 rounded-md border border-border bg-paper-raised p-4">
              <strong className="text-[13.5px]">
                {r.name} — {r.contactPerson}
              </strong>
              <p className="mt-1 text-[12.5px] text-ink-dim">
                {r.address} · {r.note}
              </p>
            </div>
          ))}

          <div className="rounded-md border border-border bg-paper-raised p-4">
            <strong className="text-[13.5px]">Rozvoz po dohodě</strong>
            <p className="mt-1 text-[12.5px] text-ink-dim">{salesPoints.delivery.areas.join(', ')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
