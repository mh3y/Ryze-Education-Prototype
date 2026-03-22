/**
 * Shared form-field validation utilities.
 *
 * Used by useContactForm and HscMathsTutoring's inline form handler.
 */

/** Standard email validation (RFC-adjacent). */
export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email.toLowerCase(),
  );
}

/** Phone validation: 8–15 digits, optional leading +, ignoring whitespace/dashes/parens. */
export function validatePhone(phone: string): boolean {
  return /^\+?[\d]{8,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
}
