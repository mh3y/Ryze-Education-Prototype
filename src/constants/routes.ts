export const ROUTES = {
  HOME: '/',
  HSC_MATHS_PROGRAM: '/hsc-maths-program',
  SELECTIVE_OC_PROGRAM: '/selective-oc-program',
  ACCELERATED_MATHS_PROGRAM: '/accelerated-maths-program',
  PRIMARY_MATHS_PROGRAM: '/primary-maths-program',
  JUNIOR_FOUNDATIONS_PROGRAM: '/junior-foundations-program',
  MATHS_TUTORING: '/maths-tutoring',
  HOW_IT_WORKS: '/how-ryze-works',
  RYZE_AI: '/ryze-ai',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SITEMAP: '/sitemap',
} as const;

export type PublicRoute = (typeof ROUTES)[keyof typeof ROUTES];
