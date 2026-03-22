/**
 * Shared conversion tracking utilities.
 *
 * Single source of truth for Google Ads conversions and Meta CAPI.
 * Pages should import from here instead of inlining raw gtag / fetch calls.
 */

import { trackEvent } from '../analytics';

// ── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_ADS_CONVERSION_ID = 'AW-17763964178';
const GOOGLE_ADS_CONVERSION_LABEL = 'xkRDCOqQr_wbEJKqwpZC';
const GOOGLE_ADS_SEND_TO = `${GOOGLE_ADS_CONVERSION_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`;

// ── Google Ads ───────────────────────────────────────────────────────────────

/**
 * Fire a Google Ads conversion event.
 * Defensively checks for `gtag` availability — safe to call any time.
 */
export function fireGoogleConversion(page: string): void {
  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_SEND_TO,
        event_callback: () => {
          console.log(`Google Ads conversion sent (page: ${page}).`);
        },
      });
    }
  } catch {
    // Never block the user flow for analytics failures.
  }
}

// ── Meta CAPI ────────────────────────────────────────────────────────────────

/**
 * Post a server-side conversion event to the Meta CAPI proxy endpoint.
 * Uses `keepalive: true` so the request survives page navigations.
 */
export async function postMetaConversion(
  payload: Record<string, string>,
): Promise<void> {
  try {
    await fetch('/api/meta-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.error('Meta CAPI submission error:', error);
  }
}

// ── Composite helpers ────────────────────────────────────────────────────────

/**
 * Fire all tracking events for a phone link click.
 * Replaces the 5+ inline `handlePhoneClick` functions across pages.
 */
export function trackPhoneClick(page: string, placement: string): void {
  trackEvent('phone_click', { page, placement });
  fireGoogleConversion(page);
  void postMetaConversion({
    eventName: 'Lead',
    userAgent: navigator.userAgent,
    sourceUrl: window.location.href,
  });
}

/**
 * Fire all tracking events after a successful form submission.
 * Designed to be called once — never duplicates conversion firing.
 */
export function trackFormSubmission(
  page: string,
  contactData: { name: string; email: string; phone: string },
): void {
  trackEvent('contact_form_submit', { page, status: 'success' });
  fireGoogleConversion(page);
  void postMetaConversion({
    eventName: 'Contact',
    name: contactData.name,
    email: contactData.email,
    phone: contactData.phone,
    userAgent: navigator.userAgent,
    sourceUrl: window.location.href,
  });
}
