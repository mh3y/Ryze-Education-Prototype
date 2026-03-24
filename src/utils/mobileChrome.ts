export type MobileChromeTone = 'light' | 'dark';

export type MobileChromeConfig = {
  top: string;
  bottom: string;
  solid: string;
  tone: MobileChromeTone;
  themeColor: string;
};

const MARKETING_CONFIG: MobileChromeConfig = {
  top: '#171d28',
  bottom: '#0f1724',
  solid: '#121925',
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

const MIDNIGHT_PATHS = new Set<string>([
  '/login',
  '/admin',
  '/portal',
  '/parent-portal',
  '/tutor-portal',
]);

const normalizePath = (pathname: string) => pathname.replace(/\/+$/, '').toLowerCase() || '/';

export const getMobileChromeConfig = (pathname: string): MobileChromeConfig => {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath.startsWith('/dashboard')) {
    return MIDNIGHT_CONFIG;
  }

  if (MIDNIGHT_PATHS.has(normalizedPath)) {
    return MIDNIGHT_CONFIG;
  }

  return MARKETING_CONFIG;
};
