import Image from 'next/image';
import { site } from '@/lib/content';

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', icon: '/images/icons/facebook.svg', href: site.socials.facebook },
  { key: 'instagram', label: 'Instagram', icon: '/images/icons/instagram.svg', href: site.socials.instagram },
  { key: 'whatsapp', label: 'WhatsApp', icon: '/images/icons/whatsapp.svg', href: `https://wa.me/${site.socials.whatsapp.replace(/\D/g, '')}` },
];

export default function ContactInfo({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const labelClass = `mb-0.5 block text-[11px] font-semibold uppercase tracking-wide ${
    isDark ? 'text-honey-100/60' : 'text-ink-dim'
  }`;

  return (
    <div
      className={`flex h-full min-w-0 flex-col gap-4 rounded-xl border p-5 shadow-warm sm:p-6 ${
        isDark
          ? 'border-white/15 bg-white/[0.07] text-honey-50'
          : 'border-honey-100 bg-paper-raised'
      }`}
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_16rem] md:grid-cols-1 min-[949px]:grid-cols-[minmax(0,1fr)_10rem] lg:grid-cols-[minmax(0,1fr)_12rem] xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="text-[13.5px]">
            <strong className={labelClass}>
              Adresa
            </strong>
            <span className="block">{site.contact.address.street}</span>
            <span className="block">{site.contact.address.zip} {site.contact.address.city}</span>
          </div>
          <div className="text-[13.5px]">
            <strong className={labelClass}>
              Telefon / WhatsApp
            </strong>
            <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`}>{site.contact.phone}</a>
          </div>
          <div className="text-[13.5px]">
            <strong className={labelClass}>
              E-mail
            </strong>
            <a className="break-words" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
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
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border border-dashed opacity-50 ${
                    isDark ? 'border-white/25 bg-white/10' : 'border-border bg-paper'
                  }`}
                >
                  <Image src={s.icon} alt="" width={15} height={15} />
                </span>
              )
            )}
          </div>
        </div>

        <div className="w-full max-w-72 justify-self-center sm:max-w-none md:max-w-72 min-[949px]:max-w-none">
          <Image
            src="/images/watercolor/contact-bee-flower.png"
            alt="Včela na květu, malovaná ilustrace akvarelem"
            width={1254}
            height={1254}
            className="h-auto w-full"
          />
        </div>
      </div>

      <div
        className={`min-h-[220px] flex-1 overflow-hidden rounded-md border ${
          isDark ? 'border-white/15' : 'border-honey-100'
        }`}
      >
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
