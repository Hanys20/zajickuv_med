export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

const STORAGE_KEY = 'zajickuv-med-cookie-consent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'open-cookie-settings';

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function storeConsent(analytics: boolean): void {
  if (typeof window === 'undefined') return;
  const consent: CookieConsent = { necessary: true, analytics, decidedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export function openCookieSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
