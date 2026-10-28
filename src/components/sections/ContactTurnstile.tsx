'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

export default function ContactTurnstile({ onToken, resetKey, theme }: {
  onToken: (token: string) => void;
  resetKey: number;
  theme: 'light' | 'dark';
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string>();
  const [siteKey, setSiteKey] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/contact-config', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const config = await response.json();
        if (typeof config.siteKey !== 'string' || !config.siteKey) throw new Error();
        setSiteKey(config.siteKey);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Bezpečnostní ověření se nepodařilo načíst. Obnovte stránku nebo nám zavolejte.');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!ready || !siteKey || !container.current || !window.turnstile) return;
    try {
      widget.current = window.turnstile.render(container.current, {
        sitekey: siteKey, action: 'contact', theme, language: 'cs', size: 'flexible',
        callback: (token: string) => { setError(''); onToken(token); },
        'expired-callback': () => { onToken(''); },
        'error-callback': () => {
          onToken('');
          setError('Bezpečnostní ověření se nezdařilo. Zkuste ověření obnovit.');
        },
        'timeout-callback': () => { onToken(''); },
      });
    } catch { setError('Bezpečnostní ověření se nepodařilo načíst. Obnovte stránku.'); }
    return () => {
      if (widget.current !== undefined) window.turnstile?.remove(widget.current);
      widget.current = undefined;
      onToken('');
    };
  }, [ready, siteKey, theme, onToken]);

  useEffect(() => {
    if (widget.current !== undefined) {
      onToken('');
      window.turnstile?.reset(widget.current);
    }
  }, [resetKey, onToken]);

  return (
    <div className="min-w-0" aria-label="Bezpečnostní ověření">
      <Script
        id="contact-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setError('Bezpečnostní ověření se nepodařilo načíst. Obnovte stránku nebo nám zavolejte.')}
      />
      <div ref={container} className="min-h-[65px] w-full" />
      {error && (
        <div role="alert" className="text-sm">
          <p>{error}</p>
          <button type="button" className="mt-1 underline" onClick={() => {
            if (widget.current !== undefined) {
              onToken(''); setError(''); window.turnstile?.reset(widget.current);
            } else { window.location.reload(); }
          }}>Obnovit ověření</button>
        </div>
      )}
    </div>
  );
}
