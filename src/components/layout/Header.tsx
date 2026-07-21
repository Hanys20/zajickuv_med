'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_ITEMS } from '@/lib/nav';
import { site } from '@/lib/content';

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', icon: '/images/icons/facebook.svg', href: site.socials.facebook },
  { key: 'instagram', label: 'Instagram', icon: '/images/icons/instagram.svg', href: site.socials.instagram },
  { key: 'whatsapp', label: 'WhatsApp', icon: '/images/icons/whatsapp.svg', href: `https://wa.me/${site.socials.whatsapp.replace(/\D/g, '')}` },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper-raised">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setOpen(false)}>
          <Image src="/images/icons/bee.svg" alt="" width={22} height={22} className="shrink-0" />
          <span>Zajíčkův med</span>
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] font-semibold text-ink-dim md:flex">
          {NAV_ITEMS.map((item) =>
            item.cta ? (
              <Link key={item.label} href={item.href} className="btn btn-primary !px-4 !py-2 !text-[13px]">
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={
                  isActive(item.href)
                    ? 'relative text-ink after:absolute after:-bottom-1 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-honey-400 after:content-[""]'
                    : 'transition-colors hover:text-honey-700'
                }
              >
                {item.label}
              </Link>
            )
          )}

          <div className="flex items-center gap-2 border-l border-border pl-5">
            {SOCIALS.map((s) =>
              s.href ? (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-honey-50 transition-colors hover:bg-honey-100"
                >
                  <Image src={s.icon} alt="" width={14} height={14} />
                </a>
              ) : (
                <span
                  key={s.key}
                  title={`${s.label} — připravujeme`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-honey-50/60 opacity-50"
                >
                  <Image src={s.icon} alt="" width={14} height={14} />
                </span>
              )
            )}
          </div>
        </nav>

        <button
          type="button"
          aria-label="Otevřít menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-s border border-border bg-paper text-lg md:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-border bg-paper-raised px-4 pb-4 pt-1 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={
                item.cta
                  ? 'my-1.5 rounded-full bg-honey-500 px-4 py-2.5 text-center text-sm font-bold text-white'
                  : 'border-b border-block py-2.5 text-sm font-semibold'
              }
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-2 flex justify-center gap-3">
            {SOCIALS.map((s) =>
              s.href ? (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-honey-50"
                >
                  <Image src={s.icon} alt="" width={15} height={15} />
                </a>
              ) : (
                <span
                  key={s.key}
                  title={`${s.label} — připravujeme`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-honey-50/60 opacity-50"
                >
                  <Image src={s.icon} alt="" width={15} height={15} />
                </span>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
