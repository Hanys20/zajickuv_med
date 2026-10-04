'use client';

import { useEffect, useState } from 'react';
import type { Availability, Product } from '@/lib/products';
import { cenik, site } from '@/lib/content';

const ADDITIONAL_FORM_PRODUCTS = [
  { slug: 'vceli-vosk', name: 'Včelí vosk', group: 'wax', availability: 'available' },
  { slug: 'svicky-z-mezisten', name: 'Svíčky z mezistěn', group: 'wax', availability: 'available' },
  { slug: 'oddelek-klasicky', name: 'Klasický oddělek', group: 'nucs', availability: 'sold-out' },
  { slug: 'oddelek-sberny', name: 'Sběrný oddělek', group: 'nucs', availability: 'sold-out' },
] satisfies Array<{ slug: string; name: string; group: 'wax' | 'nucs'; availability: Availability }>;

export default function ContactForm({
  honeys,
  propolis,
  theme = 'light',
}: {
  honeys: Product[];
  propolis: Product[];
  theme?: 'light' | 'dark';
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productChoice, setProductChoice] = useState('');
  const [message, setMessage] = useState('');
  const [availabilityBySlug, setAvailabilityBySlug] = useState<Record<string, Availability>>(() =>
    Object.fromEntries(
      [...honeys, ...propolis, ...ADDITIONAL_FORM_PRODUCTS].map((product) => [
        product.slug,
        product.availability,
      ])
    )
  );
  const labelClass = `text-[12.5px] font-bold ${theme === 'dark' ? 'text-honey-50' : ''}`;
  const fieldClass = `rounded-sm border px-3 py-2.5 text-sm ${
    theme === 'dark'
      ? 'border-white/20 bg-honey-50 text-ink placeholder:text-ink-dim/70'
      : 'border-border bg-paper-raised'
  }`;

  useEffect(() => {
    fetch('/api/public/availability', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((rows: Array<{ slug: string; availability: Availability }> | null) => {
        if (!rows) return;
        setAvailabilityBySlug((current) => ({
          ...current,
          ...Object.fromEntries(rows.map((row) => [row.slug, row.availability])),
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const selectedProduct = [...honeys, ...propolis, ...ADDITIONAL_FORM_PRODUCTS].find(
      (product) => product.name === productChoice
    );
    if (selectedProduct && availabilityBySlug[selectedProduct.slug] === 'sold-out') {
      setProductChoice('');
    }
  }, [availabilityBySlug, honeys, productChoice, propolis]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('produkt') ?? params.get('med');
    if (!slug) return;
    const match = honeys.find((h) => h.slug === slug);
    const propolisMatch = propolis.find((p) => p.slug === slug);
    const additionalProduct = ADDITIONAL_FORM_PRODUCTS.find((product) => product.slug === slug);
    setProductChoice(match?.name ?? propolisMatch?.name ?? additionalProduct?.name ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Jméno: ${name}`,
      `Telefon: ${phone}`,
      `Produkt: ${productChoice}`,
      '',
      message,
    ].join('\n');
    const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(
      'Poptávka z webu — ' + productChoice
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Jméno
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vaše jméno"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jan@example.com"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className={labelClass}>
          Telefon
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+420 000 000 000"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="product" className={labelClass}>
          Výběr produktu
        </label>
        <select
          id="product"
          required
          value={productChoice}
          onChange={(e) => setProductChoice(e.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Vyberte produkt…
          </option>
          <optgroup label="Med">
            {honeys.map((p) => {
              const isSoldOut = availabilityBySlug[p.slug] === 'sold-out';
              return (
                <option key={p.slug} value={p.name} disabled={isSoldOut}>
                  {p.name}
                  {isSoldOut ? ' — vyprodáno' : ''}
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Propolis">
            {propolis.map((p) => {
              const isSoldOut = availabilityBySlug[p.slug] === 'sold-out';
              return (
                <option key={p.slug} value={p.name} disabled={isSoldOut}>
                  {p.name}
                  {isSoldOut ? ' — vyprodáno' : ''}
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Vosk a svíčky">
            {ADDITIONAL_FORM_PRODUCTS.filter((product) => product.group === 'wax').map((product) => {
              const isSoldOut = availabilityBySlug[product.slug] === 'sold-out';
              return (
                <option key={product.slug} value={product.name} disabled={isSoldOut}>
                  {product.name}
                  {isSoldOut ? ' — vyprodáno' : ''}
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Včelí oddělky">
            {ADDITIONAL_FORM_PRODUCTS.filter((product) => product.group === 'nucs').map((product) => {
              const isSoldOut = availabilityBySlug[product.slug] === 'sold-out';
              return (
                <option key={product.slug} value={product.name} disabled={isSoldOut}>
                  {product.name}
                  {isSoldOut ? ' — vyprodáno' : ''}
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Dárkové balení">
            {cenik.giftSets.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClass}>
          Zpráva
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Napište nám, o jaký produkt a v jakém množství máte zájem"
          className={fieldClass}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block">
        Odeslat poptávku
      </button>
    </form>
  );
}
