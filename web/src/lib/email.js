/**
 * Email utility for building mailto links
 */

/**
 * Get current user name from auth store
 * Note: userName should be passed explicitly from components using useAuthStore
 * This function provides a fallback only
 */
function getCurrentUserName() {
  // Default fallback - components should pass userName explicitly
  return 'CoreStock User';
}

/**
 * Build a chase email mailto link for overdue PO deliveries
 * @param {Object} params
 * @param {string} [params.to] - Supplier email address
 * @param {string} params.poNumber - PO number
 * @param {string} [params.supplierName] - Supplier name
 * @param {Array} params.items - Overdue line items [{partNumber, description, qty, dueDate}]
 * @param {string} [params.userName] - Optional user name (if not provided, gets from auth store)
 * @returns {string} mailto: URL
 */
export function buildChaseMailto({
  to,
  poNumber,
  supplierName,
  items = [],
  userName,
}) {
  const user = userName || getCurrentUserName();
  const subject = `Chase: PO ${poNumber} – Overdue delivery`;

  const lines = items.length > 0
    ? items.map((it, i) => {
        const line = `${i + 1}. ${it.partNumber || it.partNo || it.sku || 'N/A'}`;
        const desc = it.description ? ` – ${it.description}` : '';
        const qty = ` | Qty: ${it.qty || it.qtyOrdered || 0}`;
        const due = it.dueDate ? ` | Due: ${it.dueDate}` : '';
        return line + desc + qty + due;
      }).join('\n')
    : '-';

  const body = [
    `Hi ${supplierName || 'Team'},`,
    ``,
    `Re: PO ${poNumber}`,
    ``,
    `The following line(s) are overdue. Could you confirm status and provide an updated ETA?`,
    ``,
    lines,
    ``,
    `Many thanks,`,
    `${user}`,
    `Blockwork-IT | CoreStock`,
  ].join('\n');

  // Encode and replace + with %20 to preserve spaces and newlines properly
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body).replace(/\+/g, '%20');
  
  const params = `subject=${encodedSubject}&body=${encodedBody}`;

  // If 'to' is empty, a compose window still opens and lets user pick recipient
  const mailto = `mailto:${to || ''}?${params}`;
  return mailto;
}

/**
 * Build a Gmail compose URL (alternative to mailto for web-based email)
 * @param {Object} params - Same as buildChaseMailto
 * @returns {string} Gmail compose URL
 */
export function buildGmailComposeUrl(params) {
  const mailto = buildChaseMailto(params);
  // Extract parts from mailto URL
  const match = mailto.match(/mailto:(.*?)\?(.*)/);
  if (!match) return mailto;
  
  const to = match[1];
  const query = new URLSearchParams(match[2]);
  const subject = query.get('subject') || '';
  const body = query.get('body') || '';
  
  const gmailParams = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: to || '',
    su: subject,
    body: body,
  });
  
  return `https://mail.google.com/mail/?${gmailParams.toString()}`;
}

