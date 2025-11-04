import dayjs from 'dayjs';

let s = 13579;
const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const rint = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (arr) => arr[rint(0, arr.length - 1)];
const dateWithin = (days) => dayjs().subtract(rint(0, days), 'day').format('YYYY-MM-DD');

const sites = ["Atlas Road","VRCB","West Ruislip","Flat Iron","Atlas Yard","Depot South"];
const suppliers = ["Atlas Parts Ltd","Ironclad Supplies","Metro Hydraulics","ElectroMart","BearingCo","PrimaAir"]; 
const parts = ["H-Filter-045","B-Pad-221","C-Fluid-002","Seal-012","Lamp-TBM","BRG-6203","Clamp-3in","Fuse-25A","Oil-H46","Gloves-L"];

export const kpis = {
  lowStockCount: rint(8, 32),
  pendingDeliveries: rint(3, 12),
  overdueDeliveries: rint(1, 8),
  grnsToInspect: rint(1, 9),
  deltas: {
    lowStockCount: rint(-5, 5),
    pendingDeliveries: rint(-3, 4),
    overdueDeliveries: rint(-2, 3),
    grnsToInspect: rint(-2, 3),
  }
};

export const tasks = {
  grnsPending: Array.from({length: rint(3,8)}, (_,i) => ({ id: `GRN-${2000+i}`, supplier: pick(suppliers) })),
  partRequests: Array.from({length: rint(1,5)}, (_,i) => ({ id:`REQ-${100+i}`, site: pick(sites), plant: `Plant ${rint(10,99)}` })),
  posToApprove: Array.from({length: rint(0,3)}, (_,i) => ({ id:`PO-${1020+i}`, supplier: pick(suppliers) })),
};

export const stockAlerts = Array.from({length: 5}, (_,i) => ({
  part: parts[i],
  site: pick(sites),
  onHand: rint(0, 12),
  minStock: rint(8, 16),
}));

export const upcomingDeliveries = Array.from({length: 10}, (_,i) => ({
  poId: `PO-${1100+i}`,
  supplier: pick(suppliers),
  expectedDate: dayjs().add(rint(0,7), 'day').format('YYYY-MM-DD'),
}));

export const overdueDeliveries = Array.from({length: 8}, (_,i) => ({
  poId: `PO-${1200+i}`,
  supplier: pick(suppliers),
  daysOverdue: rint(1, 14),
}));

export const recentMovements = Array.from({length: 18}, (_,i) => {
  const type = pick(['OUT','IN','ADJ']);
  const part = pick(parts);
  if (type === 'OUT') return { ts: dateWithin(5), type, text: `[OUT] ${rint(1,20)}x ${part} → Plant ${rint(10,99)} (${pick(sites)}) by J. Smith` };
  if (type === 'IN') return { ts: dateWithin(5), type, text: `[IN]  ${rint(5,60)}x ${part} from ${pick(suppliers)} (GRN-${rint(2000,2050)})` };
  return { ts: dateWithin(5), type, text: `[ADJ] ${pick(['+1','-1','-2'])} ${part} (${pick(['Cycle Count','Damaged','Found'])}) by S. Manager` };
}).slice(0, 18);

export const topUsedParts30d = Array.from({length: 10}, (_,i) => ({
  part: parts[i],
  qty: rint(20, 200),
  plantType: pick(['TBM','Plant','Depot'])
}));

export default {
  kpis,
  tasks,
  stockAlerts,
  upcomingDeliveries,
  overdueDeliveries,
  recentMovements,
  topUsedParts30d,
};


