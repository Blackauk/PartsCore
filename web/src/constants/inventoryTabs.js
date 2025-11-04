/**
 * Single source of truth for Inventory navigation tabs
 * Used by both sidebar and inventory page tabs to prevent drift
 */

export const INVENTORY_TABS = [
  { key: 'master', label: 'Master List', path: '/inventory/master-list' },
  { key: 'items', label: 'Items', path: '/inventory/items' },
  { key: 'catalog', label: 'Catalog', path: '/inventory/catalog' },
  { key: 'stock', label: 'Stock', path: '/inventory/stock' },
  { key: 'lowStock', label: 'Low Stock', path: '/inventory/low-stock' },
  { key: 'fastMovers', label: 'Fast Movers', path: '/inventory/fast-movers' },
  { key: 'movements', label: 'Movements', path: '/movements' },
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

