/**
 * DashboardCustomizationContext
 * Admin-only portal customisation — persisted to localStorage.
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

// IDs for hideable overview widgets
export type WidgetId =
  | 'stats' | 'lessons' | 'alerts' | 'quick-actions' | 'health'
  | 'action-centre' | 'calendar' | 'financials' | 'snapshot' | 'risk' | 'automation' | 'activity';
// IDs for quick action keys (match QUICK_ACTIONS keys)
export type QuickActionKey = 'add-student' | 'schedule' | 'invoice' | 'broadcast' | 'report' | 'export';

interface CustomizationState {
  hiddenNavPaths: string[];      // sidebar nav paths that are hidden
  hiddenWidgets: WidgetId[];     // overview widget IDs that are hidden
  hiddenQuickActions: QuickActionKey[]; // quick action keys that are hidden
}

const DEFAULT_STATE: CustomizationState = {
  hiddenNavPaths: [],
  hiddenWidgets: [],
  hiddenQuickActions: [],
};

const STORAGE_KEY = 'ryze_dash_custom';

interface CustomizationContextValue {
  isEditMode: boolean;
  config: CustomizationState;
  toggleEditMode: () => void;
  exitEditMode: () => void;
  isNavHidden: (path: string) => boolean;
  toggleNavItem: (path: string) => void;
  isWidgetHidden: (id: WidgetId) => boolean;
  toggleWidget: (id: WidgetId) => void;
  isQuickActionHidden: (key: QuickActionKey) => boolean;
  toggleQuickAction: (key: QuickActionKey) => void;
  resetToDefaults: () => void;
  hasChanges: boolean;
}

// Safe no-op defaults used when context is not mounted (non-admin pages)
const DEFAULT_CONTEXT: CustomizationContextValue = {
  isEditMode: false,
  config: DEFAULT_STATE,
  toggleEditMode: () => {},
  exitEditMode: () => {},
  isNavHidden: () => false,
  toggleNavItem: () => {},
  isWidgetHidden: () => false,
  toggleWidget: () => {},
  isQuickActionHidden: () => false,
  toggleQuickAction: () => {},
  resetToDefaults: () => {},
  hasChanges: false,
};

const Ctx = createContext<CustomizationContextValue>(DEFAULT_CONTEXT);

export const DashboardCustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [config, setConfig] = useState<CustomizationState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return DEFAULT_STATE;
  });

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* ignore */ }
  }, [config]);

  const toggleEditMode = useCallback(() => setIsEditMode((v) => !v), []);
  const exitEditMode   = useCallback(() => setIsEditMode(false), []);

  const isNavHidden = useCallback((path: string) => config.hiddenNavPaths.includes(path), [config.hiddenNavPaths]);
  const toggleNavItem = useCallback((path: string) => {
    setConfig((c) => ({
      ...c,
      hiddenNavPaths: c.hiddenNavPaths.includes(path)
        ? c.hiddenNavPaths.filter((p) => p !== path)
        : [...c.hiddenNavPaths, path],
    }));
  }, []);

  const isWidgetHidden = useCallback((id: WidgetId) => config.hiddenWidgets.includes(id), [config.hiddenWidgets]);
  const toggleWidget = useCallback((id: WidgetId) => {
    setConfig((c) => ({
      ...c,
      hiddenWidgets: c.hiddenWidgets.includes(id)
        ? c.hiddenWidgets.filter((w) => w !== id)
        : [...c.hiddenWidgets, id],
    }));
  }, []);

  const isQuickActionHidden = useCallback((key: QuickActionKey) => config.hiddenQuickActions.includes(key), [config.hiddenQuickActions]);
  const toggleQuickAction = useCallback((key: QuickActionKey) => {
    setConfig((c) => ({
      ...c,
      hiddenQuickActions: c.hiddenQuickActions.includes(key)
        ? c.hiddenQuickActions.filter((k) => k !== key)
        : [...c.hiddenQuickActions, key],
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_STATE);
  }, []);

  const hasChanges = useMemo(() => (
    config.hiddenNavPaths.length > 0 ||
    config.hiddenWidgets.length > 0 ||
    config.hiddenQuickActions.length > 0
  ), [config]);

  return (
    <Ctx.Provider value={{
      isEditMode, config, toggleEditMode, exitEditMode,
      isNavHidden, toggleNavItem,
      isWidgetHidden, toggleWidget,
      isQuickActionHidden, toggleQuickAction,
      resetToDefaults, hasChanges,
    }}>
      {children}
    </Ctx.Provider>
  );
};

/** Always safe to call — returns no-op defaults when no provider is mounted. */
export function useDashboardCustomization(): CustomizationContextValue {
  return useContext(Ctx);
}
