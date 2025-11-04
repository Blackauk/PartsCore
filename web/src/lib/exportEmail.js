/**
 * Email draft generation for batch orders
 */

/**
 * Generate email draft HTML
 */
export function generateEmailDraft(groupedItems, supplierName, options = {}) {
  const {
    deliveryAddress = '123 Warehouse St, London, UK',
    neededByDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contactName = 'Purchasing Department',
  } = options;

  const itemsHtml = groupedItems.map(item => `
    <tr>
      <td>${item.sku}</td>
      <td>${item.name || item.partNumber}</td>
      <td>${item.qty}</td>
      <td>${item.unit || 'pcs'}</td>
      <td>${item.notes || '—'}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <p>Dear ${supplierName},</p>
  
  <p>Please quote/supply the following items:</p>
  
  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  
  <div class="footer">
    <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
    <p><strong>Needed By:</strong> ${neededByDate}</p>
    <p><strong>Contact:</strong> ${contactName}</p>
  </div>
  
  <p>Thank you for your attention to this matter.</p>
  
  <p>Best regards,<br>${contactName}</p>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Generate multiple email drafts (one per supplier)
 */
export function generateAllEmailDrafts(cartItems, options = {}) {
  const grouped = groupBySupplier(cartItems);
  const drafts = [];

  for (const [supplier, items] of Object.entries(grouped)) {
    drafts.push({
      supplier,
      subject: `RFQ / Order Request – ${options.companyName || 'Our Company'} – ${new Date().toISOString().split('T')[0]}`,
      html: generateEmailDraft(items, supplier, options),
      text: null, // Could generate plain text version
    });
  }

  return drafts;
}

/**
 * Group items by supplier
 */
function groupBySupplier(items) {
  const grouped = {};
  for (const item of items) {
    const supplier = item.preferredSupplierId || item.supplier || 'Unknown';
    if (!grouped[supplier]) grouped[supplier] = [];
    grouped[supplier].push(item);
  }
  return grouped;
}

/**
 * Generate mailto link
 */
export function generateMailtoLink(draft, options = {}) {
  const { recipientEmail = 'orders@example.com' } = options;
  const body = encodeURIComponent(draft.html);
  return `mailto:${recipientEmail}?subject=${encodeURIComponent(draft.subject)}&body=${body}`;
}

