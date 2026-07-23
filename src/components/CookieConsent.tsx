'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OPEN_COOKIE_SETTINGS_EVENT, getStoredConsent, storeConsent } from '@/lib/cookieConsent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) setVisible(true);
    else setAnalytics(existing.analytics);

    const openSettings = () => {
      const current = getStoredConsent();
      if (current) setAnalytics(current.analytics);
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  function acceptAll() {
    storeConsent(true);
    setVisible(false);
    setShowDetails(false);
  }

  function rejectOptional() {
    storeConsent(false);
    setVisible(false);
    setShowDetails(false);
  }

  function saveChoice() {
    storeConsent(analytics);
    setVisible(false);
    setShowDetails(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-honey-200 bg-paper-raised px-4 py-4 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.15)] sm:px-6">
      <div className="mx-auto max-w-content">
        <p className="text-[13px] leading-relaxed text-ink-dim">
          Používáme nezbytné cookies pro chod webu. Se souhlasem bychom rádi měřili i anonymní návštěvnost.
          Více v{' '}
          <Link href="/cookies" className="underline hover:text-honey-700">
            zásadách používání cookies
          </Link>
          .
        </p>

        {showDetails && (
          <label className="mt-3 flex items-start gap-2.5 text-[13px]">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-honey-500"
            />
            <span>
              <strong>Analytické cookies</strong> — pomohou nám anonymně vyhodnotit návštěvnost webu.
              Nezbytné cookies (přihlášení do administrace) jsou vždy zapnuté.
            </span>
          </label>
        )}

        <div className="mt-3 flex flex-wrap gap-2.5">
          <button type="button" onClick={acceptAll} className="btn btn-primary !px-4 !py-2 !text-[13px]">
            Přijmout vše
          </button>
          <button type="button" onClick={rejectOptional} className="btn btn-secondary !px-4 !py-2 !text-[13px]">
            Odmítnout nepovinné
          </button>
          {showDetails ? (
            <button type="button" onClick={saveChoice} className="btn btn-secondary !px-4 !py-2 !text-[13px]">
              Uložit výběr
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="btn btn-secondary !px-4 !py-2 !text-[13px]"
            >
              Nastavení
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
