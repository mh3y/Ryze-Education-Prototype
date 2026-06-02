/**
 * leads.ts — shared CRM lead capture utility.
 *
 * Used by all public-facing forms (contact, HSC landing, program landing pages).
 * Always fire-and-forget — never throws, never blocks the user-facing form flow.
 * FormSubmit email delivery continues regardless of CRM success or failure.
 */

export type LeadCapturePayload = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

/**
 * Write an enquiry to the CRM leads table (POST /api/leads).
 * Returns silently on any error — the caller must not depend on this succeeding.
 */
export async function captureLeadCRM(payload: LeadCapturePayload): Promise<void> {
  try {
    const apiBase = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';
    await fetch(`${apiBase}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently swallow — never block the user-facing form submission
  }
}

/**
 * Extract UTM parameters from a URL search string.
 * Returns undefined (not null) for missing params so they are omitted from JSON.
 */
export function readUtmParams(search: string): Pick<
  LeadCapturePayload,
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content'
> {
  const sp = new URLSearchParams(search);
  return {
    utm_source:   sp.get('utm_source')   ?? undefined,
    utm_medium:   sp.get('utm_medium')   ?? undefined,
    utm_campaign: sp.get('utm_campaign') ?? undefined,
    utm_content:  sp.get('utm_content')  ?? undefined,
  };
}
