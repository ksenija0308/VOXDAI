export const COOKIE_CONSENT_KEY = 'voxd_cookie_consent';
export const COOKIE_ANALYTICS_KEY = 'voxd_cookie_analytics';
export const COOKIE_MARKETING_KEY = 'voxd_cookie_marketing';
export const COOKIE_UPDATED_EVENT = 'voxd-cookie-updated';

export type ConsentLevel = 'all' | 'essential' | 'custom';

export interface EffectiveConsent {
  analytics: boolean;
  marketing: boolean;
}

export function getEffectiveConsent(): EffectiveConsent {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

  if (consent === 'all') {
    return { analytics: true, marketing: true };
  }

  if (consent === 'essential') {
    return { analytics: false, marketing: false };
  }

  // "custom" or missing — read per-category keys
  return {
    analytics: localStorage.getItem(COOKIE_ANALYTICS_KEY) === 'true',
    marketing: localStorage.getItem(COOKIE_MARKETING_KEY) === 'true',
  };
}

export function setConsent(analytics: boolean, marketing: boolean): void {
  localStorage.setItem(COOKIE_ANALYTICS_KEY, String(analytics));
  localStorage.setItem(COOKIE_MARKETING_KEY, String(marketing));

  let level: ConsentLevel;
  if (analytics && marketing) {
    level = 'all';
  } else if (!analytics && !marketing) {
    level = 'essential';
  } else {
    level = 'custom';
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, level);

  window.dispatchEvent(new Event(COOKIE_UPDATED_EVENT));
}
