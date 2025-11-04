export const linkPO = (poId) => `/procurement/purchase-orders/${poId}`;
export const linkGRN = (grnId) => `/procurement/deliveries/${grnId}`;
export const linkPart = (id) => `/inventory/master?sku=${encodeURIComponent(id)}`;
export const linkIssuesReport = (part) => `/reports/transactions?type=issue&part=${encodeURIComponent(part)}&range=30d`;

export default { linkPO, linkGRN, linkPart, linkIssuesReport };


