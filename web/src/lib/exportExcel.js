/**
 * Excel export for batch orders
 */

/**
 * Export batch order to CSV (Excel-compatible)
 */
export function exportBatchOrderToCSV(cartItems, filename) {
  const csv = generateCSV(cartItems);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `Catalogue_Batch_Order_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV content
 */
function generateCSV(items) {
  const headers = [
    'Supplier',
    'SKU',
    'Part Number',
    'Name',
    'Quantity to Order',
    'Unit',
    'Equipment',
    'Lead Time (days)',
    'Notes',
  ];

  const rows = items.map(item => {
    return [
      escapeCSV(item.preferredSupplierId || item.supplier || 'Unknown'),
      escapeCSV(item.sku),
      escapeCSV(item.partNumber || ''),
      escapeCSV(item.name || item.description || ''),
      escapeCSV(String(item.qty || 0)),
      escapeCSV(item.unit || 'pcs'),
      escapeCSV(Array.isArray(item.equipment) ? item.equipment.join(', ') : ''),
      escapeCSV(String(item.leadTimeDays || item.leadTime || 0)),
      escapeCSV(item.notes || ''),
    ];
  });

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

