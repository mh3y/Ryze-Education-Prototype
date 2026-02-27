export const ROUTES = {
  HOME: '/',
  HSC_MATHS_TUTORING: '/hsc-maths-tutoring',
  HOW_IT_WORKS: '/how-ryze-works',
  RYZE_AI: '/ryze-ai',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SITEMAP: '/sitemap',
} as const;

export type PublicRoute = (typeof ROUTES)[keyof typeof ROUTES];