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
      <div className="mx-auto flex max-w-hero items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo/wordmark.svg"
            alt="Zajíčkův med"
            width={199}
            height={56}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-5 text-[12px] font-semibold uppercase tracking-wide text-ink-dim min-[1030px]:flex xl:gap-6 xl:text-[13px]">
          {NAV_ITEMS.map((item) =>
            item.cta ? (
              <Link key={item.label} href={item.href} className="btn btn-primary !px-4 !py-2 !text-[13px]">
                {item.label}
              </Link>
            ) : item.children ? (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 py-3 transition-colors hover:text-honey-700 ${
                    isActive(item.href)
                      ? 'relative text-ink after:absolute after:bottom-1 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-honey-400 after:content-[""]'
                      : ''
                  }`}
                >
                  {item.label}
                  <svg aria-hidden="true" viewBox="0 0 12 8" className="h-2 w-3 fill-none stroke-current" strokeWidth="1.8">
                    <path d="m1 1.5 5 5 5-5" />
                  </svg>
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-md border border-border bg-paper-raised py-1.5 shadow-warm">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-[12px] normal-case tracking-normal transition-colors hover:bg-honey-50 hover:text-honey-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
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
          aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 shrink-0 items-center justify-center min-[1030px]:hidden"
        >
          <span className="relative block h-[18px] w-7">
            <span
              className={`absolute left-0 block h-[2.5px] w-7 rounded-full bg-ink transition-all duration-300 ${
                open ? 'top-2 rotate-45' : 'top-0 rotate-0'
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-[2.5px] w-7 rounded-full bg-ink transition-all duration-300 ${
                open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 block h-[2.5px] w-7 rounded-full bg-ink transition-all duration-300 ${
                open ? 'top-2 -rotate-45' : 'top-4 rotate-0'
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out min-[1030px]:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-1 border-t border-border bg-paper-raised px-4 pb-4 pt-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    item.cta
                      ? 'my-1.5 block rounded-full bg-honey-500 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white'
                      : 'block border-b border-block py-2.5 text-sm font-semibold uppercase tracking-wide'
                  }
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="grid grid-cols-2 gap-x-3 border-b border-block bg-honey-50/50 px-3 py-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="py-1.5 text-[13px] text-ink-dim hover:text-honey-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
        </div>
      </div>
    </header>
  );
}
