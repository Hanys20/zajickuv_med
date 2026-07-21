import Link from 'next/link';
import Image from 'next/image';
import { NAV_ITEMS } from '@/lib/nav';
import { site } from '@/lib/content';

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', icon: '/images/icons/facebook.svg', href: site.socials.facebook },
  { key: 'instagram', label: 'Instagram', icon: '/images/icons/instagram.svg', href: site.socials.instagram },
  { key: 'whatsapp', label: 'WhatsApp', icon: '/images/icons/whatsapp.svg', href: `https://wa.me/${site.socials.whatsapp.replace(/\D/g, '')}` },
];

export default function Footer() {
  return (
    <footer className="section-dark px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-6 text-[13px] md:grid-cols-4">
        <div>
          <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-honey-300">Kontakt</h4>
          <p className="mb-1.5 text-honey-50/90">{site.contact.person}</p>
          <p className="mb-1.5 text-honey-50/90">
            {site.contact.address.street}, {site.contact.address.zip} {site.contact.address.city}
          </p>
          <p className="mb-1.5">
            <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="text-honey-50/90 hover:text-honey-300">
              {site.contact.phone}
            </a>
          </p>
          <p className="mb-1.5">
            <a href={`mailto:${site.contact.email}`} className="text-honey-50/90 hover:text-honey-300">
              {site.contact.email}
            </a>
          </p>
        </div>

        <div>
          <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-honey-300">Rychlé odkazy</h4>
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="mb-1.5 block text-honey-50/90 hover:text-honey-300">
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-honey-300">Sociální sítě</h4>
          <div className="flex gap-2.5">
            {SOCIALS.map((s) =>
              s.href ? (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-honey-50 transition-colors hover:bg-honey-300"
                >
                  <Image src={s.icon} alt="" width={16} height={16} />
                </a>
              ) : (
                <span
                  key={s.key}
                  aria-label={`${s.label} — připravujeme`}
                  title={`${s.label} — připravujeme`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-honey-50/40"
                >
                  <Image src={s.icon} alt="" width={16} height={16} className="opacity-60" />
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-honey-300">Kde nás najdete</h4>
          <p className="text-honey-50/75">
            Vyzvednutí v Opavě-Podvihově, prodej u Kozí farmy Magdaléna (Štítina), rozvoz do Opavy a Studénky.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-content flex-wrap justify-between gap-2 border-t border-honey-900/50 pt-4 text-[11.5px] text-honey-50/60">
        <span>© {new Date().getFullYear()} Zajíčkův med</span>
        <span>{site.seoLocations.join(' · ')}</span>
      </div>
    </footer>
  );
}
