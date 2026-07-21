'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { cenik, site } from '@/lib/content';

export default function ContactForm({ honeys, propolis }: { honeys: Product[]; propolis: Product[] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productChoice, setProductChoice] = useState('');
  const [message, setMessage] = useState('');

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
      'Poptávka z webu — ' + productChoice
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-[12.5px] font-bold">
          Jméno
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vaše jméno"
          className="rounded-sm border border-border bg-paper-raised px-3 py-2.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[12.5px] font-bold">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jan@example.com"
          className="rounded-sm border border-border bg-paper-raised px-3 py-2.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-[12.5px] font-bold">
          Telefon
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+420 000 000 000"
          className="rounded-sm border border-border bg-paper-raised px-3 py-2.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="product" className="text-[12.5px] font-bold">
          Výběr produktu
        </label>
        <select
          id="product"
          required
          value={productChoice}
          onChange={(e) => setProductChoice(e.target.value)}
          className="rounded-sm border border-border bg-paper-raised px-3 py-2.5 text-sm"
        >
          <option value="" disabled>
            Vyberte produkt…
          </option>
          <optgroup label="Med">
            {honeys.map((p) => (
              <option key={p.slug} value={p.name} disabled={p.availability === 'sold-out'}>
                {p.name}
                {p.availability === 'sold-out' ? ' — vyprodáno' : ''}
              </option>
            ))}
          </optgroup>
          <optgroup label="Propolis">
            {propolis.map((p) => (
              <option key={p.slug} value={p.name} disabled={p.availability === 'sold-out'}>
                {p.name}
                {p.availability === 'sold-out' ? ' — vyprodáno' : ''}
              </option>
            ))}
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
        <label htmlFor="message" className="text-[12.5px] font-bold">
          Zpráva
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Kolik a jakého medu máte zájem…"
          className="rounded-sm border border-border bg-paper-raised px-3 py-2.5 text-sm"
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block">
        Odeslat poptávku
      </button>
    </form>
  );
}
