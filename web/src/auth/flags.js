/**
 * Authentication bypass flags
 * Auto-enables bypass on GitHub Pages host or when VITE_BYPASS_AUTH=1
 */

export const isGhPagesHost =
  typeof window !== 'undefined' &&
  window.location.hostname === 'blackauk.github.io';

export const bypassAuth =
  isGhPagesHost || import.meta.env.VITE_BYPASS_AUTH === '1';

