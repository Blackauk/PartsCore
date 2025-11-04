import { useEffect, useState } from 'react';

/**
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * Theme management hook
 * Manages light/dark theme via data-theme attribute on <html>
 * Persists preference to localStorage
 * @returns {{ theme: Theme, setTheme: (theme: Theme) => void, toggle: () => void }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Get initial theme from DOM (set by FOUC prevention script)
    const saved = document.documentElement.getAttribute('data-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    // Update DOM attribute and localStorage when theme changes
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // Ignore localStorage errors (private browsing, etc.)
    }
  }, [theme]);

  const toggle = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggle };
}


