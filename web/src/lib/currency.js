/**
 * Currency utilities - single source of truth for currency formatting
 */

/**
 * @typedef {'GBP' | 'USD' | 'EUR' | 'JPY' | 'CNY'} CurrencyCode
 */

/** @type {Array<{ code: CurrencyCode, label: string }>} */
export const CURRENCY_OPTIONS = [
  { code: 'GBP', label: 'Pound (GBP £)' },
  { code: 'USD', label: 'US Dollar (USD $)' },
  { code: 'EUR', label: 'Euro (EUR €)' },
  { code: 'JPY', label: 'Yen (JPY ¥)' },
  { code: 'CNY', label: 'Yuan (CNY ¥)' },
];

/**
 * Format a number as currency with proper thousands separators and currency symbol
 * @param {number | string | null | undefined} value - The numeric value to format (can be string or null)
 * @param {CurrencyCode} currency - Currency code (default: 'GBP')
 * @param {number} minimumFractionDigits - Minimum decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'GBP', minimumFractionDigits = 2) {
  const num = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (isNaN(num) || num === null || num === undefined) {
    return formatCurrency(0, currency, minimumFractionDigits);
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(num);
}

