'use client';

import { useEffect, useRef, useState } from 'react';
import type { Availability, Product } from '@/lib/products';
import { cenik } from '@/lib/content';
import { ADDITIONAL_PRODUCTS } from '@/lib/additionalProducts';
import ContactTurnstile from './ContactTurnstile';

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
  const [website, setWebsite] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [challengeReset, setChallengeReset] = useState(0);
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [availabilityBySlug, setAvailabilityBySlug] = useState<Record<string, Availability>>(() =>
    Object.fromEntries(
      [...honeys, ...propolis, ...ADDITIONAL_PRODUCTS].map((product) => [
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
    const selectedProduct = [...honeys, ...propolis, ...ADDITIONAL_PRODUCTS].find(
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
    const additionalProduct = ADDITIONAL_PRODUCTS.find((product) => product.slug === slug);
    setProductChoice(match?.name ?? propolisMatch?.name ?? additionalProduct?.name ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!turnstileToken) {
      setResult({ ok: false, message: 'Dokončete prosím bezpečnostní ověření.' });
      return;
    }
    const fields = { name, email, phone, product: productChoice, message, website };
    const payload = JSON.stringify(fields);
    if (submission.current?.payload !== payload) {
      submission.current = { payload, id: crypto.randomUUID() };
    }
    submitting.current = true;
    setIsSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...fields, turnstileToken, submissionId: submission.current.id }),
        signal: AbortSignal.timeout(30_000),
      });
      const data = await response.json();
      if (!response.ok || data?.ok !== true || data?.accepted !== true || typeof data?.id !== 'string') {
        if (response.status === 409) submission.current = null;
        setResult({ ok: false, message: typeof data?.error === 'string' ? data.error : 'Zprávu se nepodařilo odeslat. Zkuste to prosím později nebo nám zavolejte.' });
        return;
      }
      setResult({ ok: true, message: 'Děkujeme, vaši poptávku jsme bezpečně přijali. Brzy se vám ozveme.' });
      submission.current = null;
      setName('');
      setEmail('');
      setPhone('');
      setProductChoice('');
      setMessage('');
      setWebsite('');
    } catch {
      setResult({ ok: false, message: 'Odeslání se nepodařilo potvrdit. Zkontrolujte připojení a zkuste to prosím později nebo nám zavolejte.' });
    } finally {
      setTurnstileToken('');
      setChallengeReset((value) => value + 1);
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="flex min-w-0 flex-col gap-3.5">
      <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-3.5">
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Webová stránka</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Jméno
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            maxLength={200}
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
            name="email"
            autoComplete="email"
            maxLength={254}
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
            name="phone"
            autoComplete="tel"
            maxLength={80}
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
            name="product"
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
              {ADDITIONAL_PRODUCTS.filter((product) => product.group === 'waxAndCandles').map((product) => {
                const isSoldOut = availabilityBySlug[product.slug] === 'sold-out';
                return (
                  <option key={product.slug} value={product.name} disabled={isSoldOut}>
                    {product.name}
                    {isSoldOut ? ' — vyprodáno' : ''}
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="Včelí oddělky a včelstva">
              {ADDITIONAL_PRODUCTS.filter((product) => product.group === 'nucs').map((product) => {
                const isSoldOut = availabilityBySlug[product.slug] === 'sold-out';
                return (
                  <option key={product.slug} value={product.name} disabled={isSoldOut}>
                    {product.name}
                    {isSoldOut ? ' — vyprodáno' : ''}
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="Dárkové balení medu">
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
            name="message"
            maxLength={5000}
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Napište nám, o jaký produkt a v jakém množství máte zájem"
            className={fieldClass}
          />
        </div>
        <ContactTurnstile onToken={setTurnstileToken} resetKey={challengeReset} theme={theme} />
        <button type="submit" disabled={isSubmitting || !turnstileToken} className="btn btn-primary btn-block disabled:cursor-wait disabled:opacity-70">
          {isSubmitting ? 'Odesílání…' : 'Odeslat poptávku'}
        </button>
      </fieldset>
      <noscript><p>Pro odeslání formuláře zapněte JavaScript, nebo nás kontaktujte e-mailem či telefonicky.</p></noscript>
      {result && (
        <p role={result.ok ? 'status' : 'alert'} className={`rounded-sm border p-3 text-sm ${result.ok ? 'border-green-700/30 bg-green-50 text-green-900' : 'border-red-700/30 bg-red-50 text-red-900'}`}>
          {result.message}
        </p>
      )}
      <p className={`text-xs ${theme === 'dark' ? 'text-honey-50/80' : 'text-ink-dim'}`}>
        Údaje použijeme k vyřízení poptávky. <a href="/ochrana-osobnich-udaju" className="underline">Ochrana osobních údajů</a>
      </p>
    </form>
  );
}
