import Image from 'next/image';
import { site } from '@/lib/content';

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', icon: '/images/icons/facebook.svg', href: site.socials.facebook },
  { key: 'instagram', label: 'Instagram', icon: '/images/icons/instagram.svg', href: site.socials.instagram },
  { key: 'whatsapp', label: 'WhatsApp', icon: '/images/icons/whatsapp.svg', href: `https://wa.me/${site.socials.whatsapp.replace(/\D/g, '')}` },
];

export default function ContactInfo() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-l border border-honey-100 bg-paper-raised p-5 shadow-warm sm:p-6">
      <div className="text-[13.5px]">
        <strong className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-dim">
          Adresa
        </strong>
        {site.contact.address.street}, {site.contact.address.zip} {site.contact.address.city}
      </div>
      <div className="text-[13.5px]">
        <strong className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-dim">
          Telefon / WhatsApp
        </strong>
        <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`}>{site.contact.phone}</a>
      </div>
      <div className="text-[13.5px]">
        <strong className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-dim">
          E-mail
        </strong>
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
      </div>

      <div className="flex gap-2.5">
        {SOCIALS.map((s) =>
          s.href ? (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-honey-200 bg-honey-50 transition-colors hover:bg-honey-100"
            >
              <Image src={s.icon} alt="" width={15} height={15} />
            </a>
          ) : (
            <span
              key={s.key}
              title={`${s.label} — připravujeme`}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-dashed border-border bg-paper opacity-50"
            >
              <Image src={s.icon} alt="" width={15} height={15} />
            </span>
          )
        )}
      </div>

      <div className="min-h-[220px] flex-1 overflow-hidden rounded-m border border-honey-100">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            `${site.contact.address.street}, ${site.contact.address.zip} ${site.contact.address.city}`
          )}&output=embed`}
          title={`Mapa — ${site.contact.address.city}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
