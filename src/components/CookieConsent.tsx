'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
    <div className="fixed inset-x-4 bottom-4 z-50 animate-pop-in sm:inset-x-auto sm:right-5 sm:w-full sm:max-w-[360px]">
      <div className="rounded-xl border border-honey-200 bg-paper-raised p-4 shadow-warm sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-honey-100">
            <Image src="/images/icons/honey-drop.svg" alt="" width={17} height={17} />
          </span>
          <h3 className="text-[14.5px] font-extrabold">Používáme cookies</h3>
        </div>

        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-dim">
          Nezbytné cookies zajišťují chod webu. Se souhlasem bychom rádi měřili i anonymní
          návštěvnost. Více{' '}
          <Link href="/cookies" className="underline hover:text-honey-700">
            o cookies
          </Link>
          .
        </p>

        {showDetails && (
          <label className="mt-3 flex items-start gap-2.5 text-[12.5px]">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-honey-500"
            />
            <span>
              <strong>Analytické cookies</strong> — anonymní vyhodnocení návštěvnosti. Nezbytné
              cookies jsou vždy zapnuté.
            </span>
          </label>
        )}

        <div className="mt-3.5 flex gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="btn btn-primary flex-1 !px-3 !py-2 !text-[12.5px]"
          >
            Přijmout vše
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={saveChoice}
              className="btn btn-secondary flex-1 !px-3 !py-2 !text-[12.5px]"
            >
              Uložit výběr
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="btn btn-secondary flex-1 !px-3 !py-2 !text-[12.5px]"
            >
              Nastavení
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={rejectOptional}
          className="mt-2 w-full text-center text-[11.5px] text-ink-dim underline hover:text-honey-700"
        >
          Odmítnout nepovinné
        </button>
      </div>
    </div>
  );
}
