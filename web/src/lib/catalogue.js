/**
 * Catalogue utilities for equipment-based browsing
 */

/**
 * Equipment list
 */
export const EQUIPMENT_LIST = [
  'Digger',
  'Excavator',
  'Crane',
  'Compressor',
  'Pump',
  'TBM',
  'Hoist',
  'Generator',
  'Welder',
  'Loader',
];

/**
 * Save custom order for equipment
 */
export function saveCatalogueOrder(equipmentKey, orderedSkus) {
  if (!equipmentKey || !Array.isArray(orderedSkus)) return;
  const key = `catalogOrder:${equipmentKey}`;
  localStorage.setItem(key, JSON.stringify(orderedSkus));
}

/**
 * Load custom order for equipment
 */
export function loadCatalogueOrder(equipmentKey) {
  if (!equipmentKey) return null;
  const key = `catalogOrder:${equipmentKey}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear custom order
 */
export function clearCatalogueOrder(equipmentKey) {
  if (!equipmentKey) return;
  const key = `catalogOrder:${equipmentKey}`;
  localStorage.removeItem(key);
}

/**
 * Get stock status indicator
 * @param {number} onHand - Current stock
 * @param {number} minQty - Minimum stock level
 * @param {number} maxQty - Maximum stock level
 * @returns {string} Status: 'in_stock' | 'low_stock' | 'out_of_stock'
 */
export function getStockStatus(onHand, minQty = 0, maxQty = Infinity) {
  if (onHand === 0) return 'out_of_stock';
  if (onHand < minQty) return 'low_stock';
  return 'in_stock';
}

/**
 * Get stock status color
 */
export function getStockStatusColor(status) {
  switch (status) {
    case 'in_stock': return 'bg-green-900/20 text-green-400';
    case 'low_stock': return 'bg-yellow-900/20 text-yellow-400';
    case 'out_of_stock': return 'bg-red-900/20 text-red-400';
    default: return 'bg-zinc-900/20 text-zinc-400';
  }
}

/**
 * Merge catalog with stock data
 */
export function mergeCatalogueWithStock(catalogItems, stockData) {
  return catalogItems.map(item => {
    const stock = stockData.find(s => s.sku === item.sku);
    return {
      ...item,
      onHand: stock?.onHand || 0,
      onOrder: stock?.onOrder || 0,
      reserved: stock?.reserved || 0,
    };
  });
}

