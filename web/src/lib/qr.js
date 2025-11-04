// QR code payload builder for labels

/**
 * Build QR code payload for an inventory item
 * @param {Object} item - Item data with { id, sku, articleNumber }
 * @returns {string} URL or encoded string for QR code
 */
export function buildLabelPayload(item) {
  const base = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://app.example.com';
  
  // Prefer item ID, fallback to article number or SKU
  const identifier = item.id || item.articleNumber || item.sku || '';
  const sku = encodeURIComponent(item.sku || item.articleNumber || '');
  
  return `${base}/inventory/master/${identifier}?sku=${sku}`;
}

/**
 * Build QR code payload for a GRN line (alternative format)
 * @param {Object} line - GRN line with part info
 * @returns {string} Encoded payload
 */
export function buildGrnLinePayload(line) {
  const base = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://app.example.com';
  
  const partNo = encodeURIComponent(line.partNo || line.sku || '');
  const grnId = encodeURIComponent(line.grnId || '');
  
  return `${base}/procurement/deliveries/${grnId}?part=${partNo}`;
}




