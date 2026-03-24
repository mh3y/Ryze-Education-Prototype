import { ROUTES } from '../constants/routes';

export type MobileChromeTone = 'light' | 'dark';

export type MobileChromeConfig = {
  top: string;
  bottom: string;
  solid: string;
  tone: MobileChromeTone;
  themeColor: string;
};

const LIGHT_TO_FOOTER_CONFIG: MobileChromeConfig = {
  top: '#f4efe7',
  bottom: '#171d28',
  solid: '#f4efe7',
  tone: 'light',
  themeColor: '#f4efe7',
};

const HOME_CONFIG: MobileChromeConfig = {
  top: '#171d28',
  bottom: '#171d28',
  solid: '#171d28',
  tone: 'dark',
  themeColor: '#171d28',
};

const PROGRAM_CONFIG: MobileChromeConfig = {
  top: '#11151d',
  bottom: '#171d28',
  solid: '#141922',
  tone: 'dark',
  themeColor: '#11151d',
};

const MATHS_TUTORING_CONFIG: MobileChromeConfig = {
  top: '#0d0d0d',
  bottom: '#171d28',
  solid: '#111318',
  tone: 'dark',
  themeColor: '#0d0d0d',
};

const CONTACT_CONFIG: MobileChromeConfig = {
  top: '#171d28',
  bottom: '#171d28',
  solid: '#161b24',
  tone: 'dark',
  themeColor: '#171d28',
};

const MIDNIGHT_CONFIG: MobileChromeConfig = {
  top: '#050510',
  bottom: '#050510',
  solid: '#050510',
  tone: 'dark',
  themeColor: '#050510',
};

const PROGRAM_PATHS = new Set<string>([
  ROUTES.HSC_MATHS_PROGRAM,
  ROUTES.SELECTIVE_OC_PROGRAM,
  ROUTES.ACCELERATED_MATHS_PROGRAM,
  ROUTES.PRIMARY_MATHS_PROGRAM,
  ROUTES.JUNIOR_FOUNDATIONS_PROGRAM,
  '/hsc-maths-tutoring',
]);

const MIDNIGHT_PATHS = new Set<string>([
  ROUTES.RYZE_AI,
  '/login',
  '/admin',
  '/portal',
  '/parent-portal',
  '/tutor-portal',
]);

const normalizePath = (pathname: string) => pathname.replace(/\/+$/, '').toLowerCase() || ROUTES.HOME;

export const getMobileChromeConfig = (pathname: string): MobileChromeConfig => {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath.startsWith('/dashboard')) {
    return MIDNIGHT_CONFIG;
  }

  if (MIDNIGHT_PATHS.has(normalizedPath)) {
    return MIDNIGHT_CONFIG;
  }

  if (normalizedPath === ROUTES.HOME) {
    return HOME_CONFIG;
  }

  if (PROGRAM_PATHS.has(normalizedPath)) {
    return PROGRAM_CONFIG;
  }

  if (normalizedPath === ROUTES.MATHS_TUTORING) {
    return MATHS_TUTORING_CONFIG;
  }

  if (normalizedPath === ROUTES.CONTACT) {
    return CONTACT_CONFIG;
  }

  return LIGHT_TO_FOOTER_CONFIG;
};
