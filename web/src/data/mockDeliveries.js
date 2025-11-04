import dayjs from 'dayjs';

// Deterministic RNG
let s = 24681357;
const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const randInt = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const dateWithin = (days) => dayjs().subtract(randInt(0, days), 'day').format('YYYY-MM-DD');

const sites = ["Atlas Road","VRCB","West Ruislip","Flat Iron","Atlas Yard","Depot South"];
const suppliers = [
  { id:"SUP-001", name:"Atlas Parts Ltd" },
  { id:"SUP-002", name:"Ironclad Supplies" },
  { id:"SUP-003", name:"Metro Hydraulics" },
  { id:"SUP-004", name:"ElectroMart" },
  { id:"SUP-005", name:"BearingCo" },
  { id:"SUP-006", name:"PrimaAir" },
];

// Pending deliveries are open POs not fully received
export const pendingDeliveries = Array.from({ length: 20 }, (_, i) => {
  const sup = pick(suppliers);
  const statusOptions = ["Ordered","Shipped","Delayed","Arrived"];
  const status = pick(statusOptions);
  const expectedDate = dayjs().add(randInt(-5, 10), 'day').format('YYYY-MM-DD');
  return {
    poId: `PO-${1020 + i}`,
    supplierId: sup.id,
    supplier: sup.name,
    site: pick(sites),
    expectedDate,
    status,
  };
});

// GRN History
export const grnHistory = Array.from({ length: 20 }, (_, i) => {
  const sup = pick(suppliers);
  const status = pick(["Pending Inspection","Accepted","Rejected","Partially Received"]);
  return {
    id: `GRN-${2000 + i}`,
    poId: `PO-${1000 + i}`,
    supplierId: sup.id,
    supplier: sup.name,
    date: dateWithin(45),
    site: pick(sites),
    receivedBy: pick(["M. Jones","G. Smith","R. Taylor","N. Hart"]),
    status,
    docs: randInt(0,100) < 50 ? [{ id:`DOC-G-${i}`, fileName:`grn-${i}.pdf`, tag:"grn", sizeKB: randInt(80,600), uploadedAt: dateWithin(30)}] : [],
    lines: Array.from({ length: randInt(1, 3) }, () => {
      const qtyOrdered = randInt(2, 12);
      const qtyReceived = randInt(0, qtyOrdered);
      return {
        part: `PART-${randInt(100,999)}`,
        description: pick(["Hydraulic Filter","Brake Pad Set","Coolant 20L","Seal Kit","Work Lamp","Bearing 6203"]),
        qtyOrdered,
        qtyReceived,
        qtyRejected: Math.max(0, qtyOrdered - qtyReceived - randInt(0, 1)),
        notes: randInt(0,100) < 20 ? "Damaged box" : "",
      };
    }),
  };
});

// Detailed GRN map for quick lookup
export const grnDetails = Object.fromEntries(
  grnHistory.map((g) => [g.id, { ...g, overallNotes: randInt(0,100) < 30 ? "Checked by QA." : "" }])
);

export function daysOverdue(expectedISO) {
  const today = dayjs();
  const expected = dayjs(expectedISO);
  return Math.max(0, today.diff(expected, 'day'));
}


