import dayjs from 'dayjs';
import { items as inventoryItems } from './mockInventory.js';
import { receive, issue, transfer, adjust } from './mockMovements.js';
import { purchaseOrders, grns, returnsRMAs, suppliers } from './mockProcurement.js';

// Deterministic helpers (separate seed to keep stability)
let s = 2468;
const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const randInt = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

// Derivations
const byCategory = new Map();
const bySite = new Map();
(inventoryItems || []).forEach((it) => {
	const cat = it.category || 'General';
	const site = (it.location || '').split(' / ')[0] || 'Unknown';
	const stock = Number(it.stock || 0);
	const value = Number(it.stockValue || (Number(it.unitCost || 0) * stock) || 0);
	byCategory.set(cat, { category: cat, qty: (byCategory.get(cat)?.qty || 0) + stock, value: (byCategory.get(cat)?.value || 0) + value });
	bySite.set(site, { site, qty: (bySite.get(site)?.qty || 0) + stock, value: (bySite.get(site)?.value || 0) + value });
});
export const stockByCategory = Array.from(byCategory.values()).sort((a,b)=>b.value-a.value);
export const stockBySite = Array.from(bySite.values()).sort((a,b)=>b.value-a.value);

// Usage trend (90d) combining issues and receipts
export const usageTrend = Array.from({ length: 90 }, (_, i) => {
	const date = dayjs().subtract(89 - i, 'day').format('YYYY-MM-DD');
	const issues = randInt(0, 30);
	const receipts = randInt(0, 25);
	return { date, issues, receipts };
});

// Top issued (30d)
export const topIssued = (inventoryItems || []).slice(0, 30).map((it) => ({
	sku: it.sku,
	name: it.name,
	qty: randInt(0, 120),
})).sort((a,b)=>b.qty-a.qty).slice(0,10);

// Low stock count
export const lowStockCount = (inventoryItems || []).filter((it) => Number(it.stock || 0) < Number(it.min || 0)).length;

// Supplier on-time trend (12 months synthetic)
export const supplierOnTimeTrend = Array.from({ length: 12 }, (_, i) => {
	const month = dayjs().subtract(11 - i, 'month').format('YYYY-MM');
	const onTime = 70 + randInt(0, 30); // 70-100%
	return { month, onTime };
});

// KPI aggregates
export const kpis = {
	totalStockValue: stockByCategory.reduce((a,b)=>a+b.value,0),
	lowStockCount,
	openPOs: (purchaseOrders || []).filter(p=>p.status !== 'Closed' && p.status !== 'Cancelled').length,
	returns30d: (returnsRMAs || []).filter(r=> dayjs(r.date).isAfter(dayjs().subtract(30,'day')) ).length,
};

// Transactions dataset (mix of movements + procurement refs)
const movementRows = [];
(receive||[]).slice(0,15).forEach((r,i)=> movementRows.push({ date:r.date, type:'RECEIVE', ref:`RCV-${i+1}`, item:r.description, sku:r.partNo||r.sku, qty:r.qty||r.qtyReceived, site:r.location||'Atlas Road', user:r.receivedBy||'User', notes:'', linked:{ po: pick(purchaseOrders||[]).id } }));
(issue||[]).slice(0,15).forEach((r,i)=> movementRows.push({ date:r.date, type:'ISSUE', ref:`ISS-${i+1}`, item:r.description, sku:r.partNo||r.sku, qty:r.qty, site:r.job||'Atlas Road', user:r.issuedBy||'User', notes:r.plant||'', linked:{} }));
(transfer||[]).slice(0,15).forEach((r,i)=> movementRows.push({ date:r.date, type:'TRANSFER', ref:`TRF-${i+1}`, item:r.description, sku:r.partNo||r.sku, qty:r.qty, site:`${r.from}→${r.to}`, user:r.by||'User', notes:'', linked:{} }));
(adjust||[]).slice(0,15).forEach((r,i)=> movementRows.push({ date:r.date, type:'ADJUST', ref:`ADJ-${i+1}`, item:r.description, sku:r.partNo||r.sku, qty:r.newQty - r.oldQty, site:'Main', user:r.by||'User', notes:r.reason||'', linked:{} }));
export const transactions = movementRows.slice(0, 60).map((t, i) => ({ ...t, id: i+1 }));


