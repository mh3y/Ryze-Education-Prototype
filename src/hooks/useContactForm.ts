/**
 * useContactForm — shared contact form lifecycle hook.
 *
 * Covers: state management, field validation, FormSubmit submission,
 * Google Ads + Meta CAPI conversion firing, and analytics events.
 *
 * Pages retain full control of layout, rendering, and field presentation.
 * This hook handles business logic only.
 */

import { useState } from 'react';
import { validateEmail, validatePhone } from '../lib/validation';
import { trackFormSubmission } from '../lib/tracking';
import { trackEvent } from '../analytics';

// ── Types ────────────────────────────────────────────────────────────────────

export type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  honey: string;
};

export type ContactFormStatus = 'idle' | 'sending' | 'success' | 'error';

type UseContactFormConfig = {
  /** Page identifier for analytics (e.g. 'maths_tutoring', 'contact'). */
  page: string;
  /** Email subject prefix. Default: 'New Enquiry'. */
  subjectPrefix?: string;
};

type UseContactFormReturn = {
  formData: ContactFormData;
  status: ContactFormStatus;
  errorMessage: string;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
};

// ── Constants ────────────────────────────────────────────────────────────────

const FORMSUBMIT_URL = 'https://formsubmit.co/ryzeeducationhq@gmail.com';

/**
 * Silently write the enquiry to the CRM leads table.
 * Never throws — FormSubmit is the user-facing fallback if this fails.
 */
async function captureLeadSilently(
  data: ContactFormData,
  page: string,
): Promise<void> {
  try {
    const apiBase = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';
    // Collect UTM params from the current URL if present
    const sp = new URLSearchParams(window.location.search);
    await fetch(`${apiBase}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: 'website',
        page,
        utm_source:   sp.get('utm_source')   ?? undefined,
        utm_medium:   sp.get('utm_medium')   ?? undefined,
        utm_campaign: sp.get('utm_campaign') ?? undefined,
        utm_content:  sp.get('utm_content')  ?? undefined,
      }),
    });
  } catch {
    // Silently swallow — FormSubmit covers notification delivery
  }
}

const DEFAULT_FORM: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
  honey: '',
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useContactForm(config: UseContactFormConfig): UseContactFormReturn {
  const { page, subjectPrefix = 'New Enquiry' } = config;

  const [formData, setFormData] = useState<ContactFormData>({ ...DEFAULT_FORM });
  const [status, setStatus] = useState<ContactFormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM });
    setStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Honeypot — bots fill this, humans don't.
    if (formData.honey) {
      setStatus('success');
      setFormData({ ...DEFAULT_FORM });
      return;
    }

    // Validation
    if (!validateEmail(formData.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address (e.g. name@example.com)');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setStatus('error');
      setErrorMessage('Please enter a valid phone number (e.g. 0412 345 678)');
      return;
    }

    setStatus('sending');

    // CRM capture — fire-and-forget. FormSubmit below is the user-facing path.
    await captureLeadSilently(formData, page);

    try {
      const response = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _subject: `${subjectPrefix} from ${formData.name}`,
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      });

      if (response.ok) {
        setFormData({ ...DEFAULT_FORM });
        setStatus('success');

        // Fire tracking exactly once per successful submission.
        trackFormSubmission(page, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
      } else {
        setStatus('error');
        setErrorMessage('');
        trackEvent('contact_form_submit', { page, status: 'error' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      setErrorMessage('');
      trackEvent('contact_form_submit', { page, status: 'error' });
    }
  };

  return { formData, status, errorMessage, handleChange, handleSubmit, resetForm };
}
