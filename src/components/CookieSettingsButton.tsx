'use client';

import { openCookieSettings } from '@/lib/cookieConsent';

export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className ?? 'btn btn-secondary !px-4 !py-2 !text-[13px]'}>
      Nastavení cookies
    </button>
  );
}
