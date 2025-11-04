/**
 * Centralized route path builders
 * Use these instead of hardcoding URLs to ensure consistency and easy refactoring
 */

export const paths = {
  /**
   * Item/Catalog routes
   */
  item: (sku) => `/catalog/items/${encodeURIComponent(sku)}`,
  itemEdit: (sku) => `/catalog/items/${encodeURIComponent(sku)}/edit`,
  
  /**
   * Labels & QR routes
   */
  labelsForSku: (sku) => `/admin/labels?sku=${encodeURIComponent(sku)}`,
  
  /**
   * Inventory routes
   */
  historyForSku: (sku) => `/inventory/history?sku=${encodeURIComponent(sku)}`,
  adjustForSku: (sku) => `/movements/adjust?sku=${encodeURIComponent(sku)}`,
  transferForSku: (sku) => `/movements/transfer?sku=${encodeURIComponent(sku)}`,
};

