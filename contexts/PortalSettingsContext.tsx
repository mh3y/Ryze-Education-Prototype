/**
 * PortalSettingsContext.tsx
 *
 * Manages portal appearance settings:
 *   - theme (dark | light)
 *   - accent color (hex string)
 *   - density (airy | balanced | dense)
 *   - font (editorial | modern | instrument)
 *   - sidebarBehavior (auto | always-open | always-rail)
 *
 * Persists to localStorage under key "ryze_portal_settings".
 * Applies data-theme / data-density / data-font to the .ryze-portal
 * root element and sets --accent / --accent-soft as inline CSS custom
 * properties on that element.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortalSettings {
  theme: 'dark' | 'light';
  accent: string;                                   // hex e.g. '#b8841e'
  density: 'airy' | 'balanced' | 'dense';
  font: 'editorial' | 'modern' | 'instrument';
  sidebarBehavior: 'auto' | 'always-open' | 'always-rail';
  motion: 'full' | 'reduced';
  contrast: 'normal' | 'high';
  textSize: 'default' | 'large' | 'larger';
}

interface PortalSettingsContextValue {
  settings: PortalSettings;
  updateSettings: (partial: Partial<PortalSettings>) => void;
}

// ---------------------------------------------------------------------------
// Defaults & storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ryze_portal_settings';

const DEFAULTS: PortalSettings = {
  theme:           'dark',
  accent:          '#b8841e',
  density:         'balanced',
  font:            'editorial',
  sidebarBehavior: 'auto',
  motion:          'full',
  contrast:        'normal',
  textSize:        'default',
};

function loadSettings(): PortalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PortalSettings>;
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULTS };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a 6-digit hex colour to an rgba string with the given opacity. */
function hexWithOpacity(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function applyToDOM(settings: PortalSettings): void {
  const el = document.querySelector<HTMLElement>('.ryze-portal');
  if (!el) return;

  el.dataset.theme    = settings.theme;
  el.dataset.density  = settings.density;
  el.dataset.font     = settings.font;
  el.dataset.motion   = settings.motion;
  el.dataset.contrast = settings.contrast;
  // data-text-size uses a hyphenated attribute name
  el.dataset.textSize = settings.textSize;

  el.style.setProperty('--accent',       settings.accent);
  el.style.setProperty('--accent-soft',  hexWithOpacity(settings.accent, 0.14));
  el.style.setProperty('--accent-soft-2', hexWithOpacity(settings.accent, 0.08));
  el.style.setProperty('--accent-ink',   '#1a1305');
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PortalSettingsContext = createContext<PortalSettingsContextValue>({
  settings:       DEFAULTS,
  updateSettings: () => undefined,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const PortalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<PortalSettings>(loadSettings);

  // Apply to DOM whenever settings change (and on initial mount after render)
  useEffect(() => {
    applyToDOM(settings);
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<PortalSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  return (
    <PortalSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </PortalSettingsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePortalSettings(): PortalSettingsContextValue {
  return useContext(PortalSettingsContext);
}

export default PortalSettingsContext;
