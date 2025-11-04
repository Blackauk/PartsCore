/**
 * Single source of truth for Inventory navigation tabs
 * Used by both sidebar and inventory page tabs to prevent drift
 * 
 * Note: "Stock" was renamed to "Items" to match tab labels
 * Note: "Category" was renamed to "Catalog" to match tab labels
 */

/**
 * @typedef {'master' | 'items' | 'catalog' | 'lowStock' | 'fastMovers' | 'movements'} InventoryTabKey
 */

/**
 * @typedef {Object} InventoryTab
 * @property {InventoryTabKey} key
 * @property {string} label
 * @property {string} path
 */

/** @type {Array<InventoryTab>} */
export const INVENTORY_TABS = [
  { key: 'master', label: 'Master List', path: '/inventory/master-list' },
  { key: 'items', label: 'Items', path: '/inventory/items' }, // <- was "Stock" in sidebar
  { key: 'catalog', label: 'Catalog', path: '/inventory/catalog' }, // <- was "Category" in sidebar
  { key: 'lowStock', label: 'Low-Stock', path: '/inventory/low-stock' },
  { key: 'fastMovers', label: 'Fast-Movers', path: '/inventory/fast-movers' },
  { key: 'movements', label: 'Movements', path: '/inventory/movements' }, // <- Fixed: was '/movements'
];

/**
 * Get active tab based on current pathname
 * @param {string} pathname - Current location pathname
 * @returns {Object|null} - Active tab object or null
 */
export function getActiveInventoryTab(pathname) {
  return INVENTORY_TABS.find(tab => {
    if (tab.path === '/inventory/master-list') {
      // Master List matches /inventory, /inventory/master, or /inventory/master-list
      return pathname === '/inventory' || pathname === '/inventory/master' || pathname === '/inventory/master-list';
    }
    return pathname === tab.path || pathname.startsWith(tab.path + '/');
  });
}

