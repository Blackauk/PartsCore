/**
 * Configuration for freeze detection tests
 */

export interface FreezeConfig {
  /** Maximum time for navigation to complete (ms) */
  navigationTimeout: number;
  /** Maximum time for spinner to persist (ms) */
  spinnerTimeout: number;
  /** Maximum time for DOM to be inactive (ms) */
  domInactivityTimeout: number;
  /** Observation window after navigation (ms) */
  observationWindow: number;
  /** Long task threshold (ms) */
  longTaskThreshold: number;
  /** Maximum cumulative long task time in 5s window (ms) */
  maxLongTaskTime: number;
  /** Maximum time for network request (ms) */
  requestTimeout: number;
  /** Selectors for loading spinners */
  spinnerSelectors: string[];
}

export const defaultConfig: FreezeConfig = {
  navigationTimeout: 8000,
  spinnerTimeout: 10000,
  domInactivityTimeout: 5000,
  observationWindow: 15000,
  longTaskThreshold: 50,
  maxLongTaskTime: 2000,
  requestTimeout: 10000,
  spinnerSelectors: [
    '[data-loading]',
    '.spinner',
    '[aria-busy="true"]',
    '[data-testid="loading"]',
    '.loading',
    '.skeleton',
  ],
};

/**
 * Dashboard panel test IDs
 */
export const DASHBOARD_PANELS = {
  MY_TASKS: 'dashboard-panel-my-tasks',
  STOCK_ALERTS: 'dashboard-panel-stock-alerts',
  QUICK_ACCESS: 'dashboard-panel-quick-access',
  UPCOMING_DELIVERIES: 'dashboard-panel-upcoming-deliveries',
  OVERDUE_DELIVERIES: 'dashboard-panel-overdue-deliveries',
  RECENT_MOVEMENTS: 'dashboard-panel-recent-movements',
  TOP_USED_PARTS: 'dashboard-panel-top-used-parts',
} as const;

/**
 * Non-collapsible panels (should always be visible)
 */
export const NON_COLLAPSIBLE_PANELS = [
  DASHBOARD_PANELS.QUICK_ACCESS,
];

