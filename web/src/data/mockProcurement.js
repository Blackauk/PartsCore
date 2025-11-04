import dayjs from 'dayjs';

const seed = 1234; // fixed
let s = seed;
const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const randInt = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
export const dateWithin = (days) => dayjs().subtract(randInt(0, days), 'day').format('YYYY-MM-DD');
export const roundUpToPack = (qty, pack) => Math.max(pack, Math.ceil(qty / pack) * pack);

const sites = ["Atlas Road","VRCB","West Ruislip","Flat Iron","Atlas Yard","Depot South"];
export const suppliersArr = [
  { id:"SUP-001", name:"Atlas Parts Ltd" },
  { id:"SUP-002", name:"Ironclad Supplies" },
  { id:"SUP-003", name:"Metro Hydraulics" },
  { id:"SUP-004", name:"ElectroMart" },
  { id:"SUP-005", name:"BearingCo" },
  { id:"SUP-006", name:"PrimaAir" },
];

export const skus = [
  { sku:"CLP-45", name:"3\" Pipe Clamp", pack:10, lead:5, supplierId:"SUP-001" },
  { sku:"HSE-12", name:"Hydraulic Seal 12mm", pack:20, lead:7, supplierId:"SUP-003" },
  { sku:"CAB-50", name:"Cable 50mm²", pack:25, lead:6, supplierId:"SUP-004" },
  { sku:"LBT-M16", name:"Liner Bolt M16", pack:50, lead:10, supplierId:"SUP-005" },
  { sku:"FIL-08", name:"Inline Filter 8µ", pack:5, lead:4, supplierId:"SUP-002" },
  { sku:"FUS-25A", name:"Fuse 25A", pack:10, lead:3, supplierId:"SUP-004" },
  { sku:"OIL-H46", name:"Hydraulic Oil H46", pack:1, lead:2, supplierId:"SUP-003" },
  { sku:"BRG-6203", name:"Bearing 6203", pack:10, lead:6, supplierId:"SUP-005" },
  { sku:"PPE-GLOVE-L", name:"Gloves Large", pack:100, lead:5, supplierId:"SUP-006" },
  { sku:"TBM-LAMP", name:"TBM Work Lamp", pack:4, lead:8, supplierId:"SUP-004" },
];

export const usageHistory = {};
skus.forEach((k) => {
  const arr = [];
  for (let d = 0; d < 120; d++) {
    const base = randInt(0, 100) < 25 ? randInt(0, 3) : 0;
    arr.push({ date: dayjs().subtract(d, 'day').format('YYYY-MM-DD'), issues: base });
  }
  usageHistory[k.sku] = arr.reverse();
});

export const stockSnapshot = skus.map((k) => ({
  sku: k.sku,
  name: k.name,
  stock: randInt(0, 250),
  min: randInt(10, 80),
  packSize: k.pack,
  leadTimeDays: k.lead,
  supplierId: k.supplierId,
}));

export const purchaseOrders = Array.from({ length: 30 }, (_, i) => {
  const sup = pick(suppliersArr);
  const lines = Array.from({ length: randInt(1, 4) }, () => {
    const k = pick(skus);
    const qty = roundUpToPack(randInt(1, 6) * k.pack, k.pack);
    const price = randInt(3, 120);
    return { sku: k.sku, name: k.name, qty, uom: 'pcs', unitPrice: price, lineTotal: qty * price };
  });
  const value = lines.reduce((a, b) => a + b.lineTotal, 0);
  const statusArr = ['Draft', 'Sent', 'Approved', 'Partial', 'Closed', 'Cancelled'];
  const status = pick(statusArr);
  return {
    id: `PO-${1000 + i}`,
    supplierId: sup.id, supplier: sup.name,
    orderDate: dateWithin(120),
    expectedDate: dateWithin(30),
    site: pick(sites),
    status, value,
    lines,
    docs: randInt(0, 100) < 40 ? [{ id: `DOC-${i}`, fileName: `quote-${i}.pdf`, tag: 'quote', sizeKB: randInt(120, 900), uploadedAt: dateWithin(60) }] : [],
  };
});

export const grns = Array.from({ length: 30 }, (_, i) => {
  const po = pick(purchaseOrders);
  const delivered = randInt(1, 3);
  return {
    id: `GRN-${2000 + i}`,
    poId: po.id, supplierId: po.supplierId, supplier: po.supplier,
    receivedBy: pick(['M. Jones', 'G. Smith', 'R. Taylor', 'N. Hart']),
    date: dateWithin(45),
    site: po.site,
    status: pick(['Pending Inspection', 'Accepted', 'Rejected']),
    lines: Array.from({ length: delivered }, () => {
      const k = pick(skus);
      const qty = roundUpToPack(randInt(1, 4) * k.pack, k.pack);
      return { sku: k.sku, name: k.name, qty, uom: 'pcs' };
    }),
    docs: randInt(0, 100) < 50 ? [{ id: `DOC-G-${i}`, fileName: `grn-${i}.pdf`, tag: 'grn', sizeKB: randInt(80, 600), uploadedAt: dateWithin(30) }] : [],
  };
});

export const returnsRMAs = Array.from({ length: 30 }, (_, i) => {
  const sup = pick(suppliersArr);
  const k = pick(skus);
  const qty = roundUpToPack(randInt(1, 3) * k.pack, k.pack);
  return {
    id: `RMA-${3000 + i}`,
    supplierId: sup.id, supplier: sup.name,
    item: k.sku, description: k.name,
    qty, reason: pick(['Defective', 'Wrong Item', 'Over Supply', 'Warranty']),
    date: dateWithin(60),
    status: pick(['Requested', 'Approved', 'Shipped', 'Credited', 'Rejected']),
    tracking: randInt(0, 100) < 60 ? `TRK${randInt(100000, 999999)}` : null,
    docs: randInt(0, 100) < 40 ? [{ id: `DOC-R-${i}`, fileName: `rma-${i}.pdf`, tag: 'rma', sizeKB: randInt(60, 500), uploadedAt: dateWithin(25) }] : [],
  };
});

export const suppliers = suppliersArr
  .concat(Array.from({ length: 24 }, (_, i) => ({ id: `SUP-${100 + i}`, name: `Supplier ${i + 1}` })))
  .map((s, i) => {
    const totalDeliveries = randInt(10, 120);
    const onTimeDeliveries = randInt(Math.floor(totalDeliveries * 0.5), totalDeliveries);
    const receivedQty = randInt(500, 5000);
    const returnedQty = randInt(0, Math.floor(receivedQty * 0.15));
    const onTimePct = onTimeDeliveries / totalDeliveries;
    const returnRate = Math.min(1, returnedQty / receivedQty);
    const score5 = Math.round((0.7 * onTimePct + 0.3 * (1 - returnRate)) * 50) / 10;
    return {
      id: s.id, name: s.name,
      category: pick(['Hydraulics', 'Electrical', 'Fasteners', 'Filters', 'PPE', 'General']),
      contact: pick(['Alice Wright', 'Ben Harris', 'Chloe Young', 'Derek Shaw', 'Ella Price']),
      phone: `+44 20 7${randInt(100, 999)} ${randInt(1000, 9999)}`,
      email: `${s.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      status: pick(['Active', 'Inactive']),
      lastOrder: dateWithin(120),
      onTimePct: Math.round(onTimePct * 100),
      returnRate: Math.round(returnRate * 100),
      score5,
      docs: randInt(0, 100) < 25 ? [{ id: `DOC-S-${i}`, fileName: `insurance-${i}.pdf`, tag: 'insurance', sizeKB: randInt(120, 900), uploadedAt: dateWithin(180) }] : [],
    };
  });

export const usageAgg = stockSnapshot.map((r) => {
  const hist = usageHistory[r.sku];
  const last30 = hist.slice(-30).reduce((a, b) => a + b.issues, 0);
  const last90 = hist.slice(-90).reduce((a, b) => a + b.issues, 0);
  return { sku: r.sku, name: r.name, usage30: last30, usage90: last90 };
});

// stockSnapshot already exported above


