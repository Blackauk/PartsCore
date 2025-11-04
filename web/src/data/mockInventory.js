const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

const categories = ["Clamps","Hydraulics","Electrical","Fasteners","Filters","PPE"];
const locations = ["Atlas Road / A3-12","VRCB / B1-02","West Ruislip / C2-05"];
const suppliers = ["Atlas Parts Ltd","Ironclad Supplies","Metro Hydraulics","ElectroMart","BearingCo"];
const manufacturers = ["SealTech","VoltPlus","PipePro","FixRight","PrimaAir"];
const uoms = ["pcs","set","m","roll","box","drum"];

const skuSeeds = [
  "CLP-45","HSE-12","HSE-16","CAB-50","LBT-M16","FIL-08","FUS-25A","OIL-H46",
  "BRG-6203","PPE-GLOVE-L","CLP-60","HSE-20","CAB-25","LBT-M10","FIL-12","FUS-10A",
  "OIL-H68","BRG-6005","PPE-GOGGLE","FAS-M8"
];

export const items = skuSeeds.map((sku, i) => {
  const name = {
    "CLP-45": "3” Pipe Clamp",
    "HSE-12": "Hydraulic Seal 12mm",
    "HSE-16": "Hydraulic Seal 16mm",
    "CAB-50": "Cable 50m",
    "LBT-M16": "L Bolt M16",
    "FIL-08": "Air Filter 08",
    "FUS-25A": "Fuse 25A",
    "OIL-H46": "Hydraulic Oil H46",
    "BRG-6203": "Bearing 6203",
    "PPE-GLOVE-L": "Gloves Large",
    "CLP-60": "Pipe Clamp 60mm",
    "HSE-20": "Hydraulic Seal 20mm",
    "CAB-25": "Cable 25m",
    "LBT-M10": "L Bolt M10",
    "FIL-12": "Air Filter 12",
    "FUS-10A": "Fuse 10A",
    "OIL-H68": "Hydraulic Oil H68",
    "BRG-6005": "Bearing 6005",
    "PPE-GOGGLE": "Safety Goggles",
    "FAS-M8": "M8 Fasteners"
  }[sku] || `Item ${sku}`;

  const category = pick(categories);
  const stock = rand(0, 120);
  const min = rand(5, 30);
  const uom = pick(uoms);
  const supplier = pick(suppliers);
  const unitCost = Number((Math.random() * 20 + 2).toFixed(2));
  const stockValue = Number((stock * unitCost).toFixed(2));
  const lastMove = new Date(2025, 9, rand(1, 28)).toISOString().split('T')[0];

  return {
    sku,
    name,
    category,
    location: pick(locations),
    stock,
    min,
    uom,
    supplier,
    unitCost,
    stockValue,
    lastMove,
  };
});

export const catalog = skuSeeds.map((sku) => {
  const partNo = sku;
  const description = `${pick(["Hydraulic","Industrial","Electrical","Mechanical"]) } ${pick(["Seal","Clamp","Cable","Bolt","Filter","Fuse","Bearing","Oil"])}`;
  return {
    partNo,
    description,
    manufacturer: pick(manufacturers),
    supplierPN: `${pick(["ST","VP","PP","FX","PA"]) }-${rand(10,99)}-${pick(["HT","LT","XR"])}`,
    category: pick(categories),
    uom: pick(uoms),
    packSize: pick([1, 5, 10, 20, 50]),
    leadTime: rand(2, 14),
    price: Number((Math.random() * 25 + 1).toFixed(2)),
    notes: pick(["NBR; keep dry","Store cool","RoHS compliant","Check torque","—"]),
    tags: [pick(["seal","hydraulic","clamp","electrical","bearing","safety"])],
  };
});

export const lowStock = items
  .filter((it) => it.stock < it.min)
  .slice(0, 20)
  .map((it) => {
    const cat = catalog.find((c) => c.partNo === it.sku);
    const deficit = it.min - it.stock;
    const pack = cat?.packSize || 1;
    const roundUpToPack = (q) => Math.ceil(q / pack) * pack;
    return {
      sku: it.sku,
      name: it.name,
      stock: it.stock,
      min: it.min,
      deficit,
      suggestedReorder: roundUpToPack(deficit * 2),
      supplier: it.supplier,
      leadTime: cat?.leadTime || rand(2, 14),
      lastOrder: new Date(2025, 8, rand(1, 30)).toISOString().split('T')[0],
    };
  });

export const fastMovers = items.slice(0, 20).map((it) => {
  const issues30 = rand(5, 120);
  const issues90 = issues30 + rand(20, 200);
  const avgPerDay30 = Number((issues30 / 30).toFixed(2));
  const averageStock = Math.max(1, Math.round((it.stock + rand(20, 80)) / 2));
  const turnover = Number((issues90 / averageStock).toFixed(2));
  return {
    sku: it.sku,
    name: it.name,
    issues30,
    issues90,
    avgPerDay30,
    lastIssued: new Date(2025, 9, rand(1, 28)).toISOString().split('T')[0],
    turnover,
  };
});

// Master list data model and lookups
const siteList = ['Atlas Road','VRCB','West Ruislip','Flat Iron'];
const zonesBySite = Object.fromEntries(siteList.map(s => [s, Array.from({ length: 12 }, (_, i) => `Z-${String(i+1).padStart(2,'0')}`)]));
const landmarksBySite = Object.fromEntries(siteList.map(s => [s, ['Rack A1','Rack A2','Rack B1','Rack B2','Cage 1','Cage 2']]));

export const masterItems = Array.from({ length: 150 }, (_, i) => {
  const sku = `SKU-${String(1000+i)}`;
  const site = pick(siteList);
  const zone = pick(zonesBySite[site]);
  const landmark = pick(landmarksBySite[site]);
  const supplier = pick(suppliers);
  const category = pick(categories);
  return {
    id: `ITEM-${i+1}`,
    articleNumber: `ART-${String(10000+i)}`,
    articleName: `${category} ${sku}`,
    supplier,
    supplierPartNumber: Math.random() < 0.7 ? `${supplier.slice(0,3).toUpperCase()}-${rand(100,999)}` : '',
    category,
    sku,
    quantity: rand(0, 250),
    uom: pick(['pcs','set','m','roll','box']),
    site,
    zone,
    landmark,
    plan: Math.random() < 0.3 ? `PL-${rand(100,999)}` : '',
    supersededNumbers: Math.random() < 0.25 ? `OLD-${rand(1000,9999)}` : '',
    equipment: pick(['Excavator','Crane','Compressor','Hoist','—']),
    minQty: rand(2, 20),
    updatedAt: new Date(2025, 9, rand(1, 28)).toISOString().split('T')[0],
  };
});

export const suppliersList = Array.from(new Set(masterItems.map(m => m.supplier))).sort();
export const categoriesList = Array.from(new Set(masterItems.map(m => m.category))).sort();
export const sitesList = siteList;
export const zonesBySiteMap = zonesBySite;
export const landmarksBySiteMap = landmarksBySite;
