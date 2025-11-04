import { createContext, useContext, useEffect, useState, useMemo } from 'react';

/**
 * @typedef {'GBP' | 'USD' | 'EUR' | 'JPY' | 'CNY'} CurrencyCode
 */

/**
 * @typedef {Object} Settings
 * @property {CurrencyCode} currency
 */

/**
 * @typedef {Object} SettingsContextValue
 * @property {Settings} settings
 * @property {(currency: CurrencyCode) => void} setCurrency
 */

const SettingsContext = createContext(null);

const STORAGE_KEY = 'corestock:settings';

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { currency: 'GBP' };
    } catch {
      return { currency: 'GBP' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // Ignore storage errors
    }
  }, [settings]);

  const setCurrency = (currency) => {
    setSettings((s) => ({ ...s, currency }));
  };

  const value = useMemo(() => ({ settings, setCurrency }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

