/**
 * Extended catalogue data with equipment arrays
 */
import { EQUIPMENT_LIST } from '../lib/catalogue.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

const categories = ["Clamps", "Hydraulics", "Electrical", "Fasteners", "Filters", "PPE"];
const suppliers = ["Atlas Parts Ltd", "Ironclad Supplies", "Metro Hydraulics", "ElectroMart", "BearingCo", "PrimaAir"];
const manufacturers = ["SealTech", "VoltPlus", "PipePro", "FixRight", "PrimaAir"];

/**
 * Generate equipment arrays (1-3 equipment per item)
 */
function generateEquipmentArray() {
  const num = rand(1, 3);
  const selected = [];
  while (selected.length < num) {
    const eq = pick(EQUIPMENT_LIST);
    if (!selected.includes(eq)) selected.push(eq);
  }
  return selected;
}

/**
 * Extended catalogue items with equipment arrays
 */
export const catalogueItems = Array.from({ length: 80 }, (_, i) => {
  const sku = `PART-${String(100 + i).padStart(3, '0')}`;
  const partNumbers = [
    'CLP-45', 'HSE-12', 'HSE-16', 'CAB-50', 'LBT-M16', 'FIL-08', 'FUS-25A', 'OIL-H46',
    'BRG-6203', 'PPE-GLOVE-L', 'CLP-60', 'HSE-20', 'CAB-25', 'LBT-M10', 'FIL-12',
    'FUS-10A', 'OIL-H68', 'BRG-6005', 'PPE-GOGGLE', 'FAS-M8'
  ];
  const descriptions = [
    'Hydraulic Seal', 'Pipe Clamp', 'Cable Assembly', 'L Bolt', 'Air Filter',
    'Fuse Cartridge', 'Hydraulic Oil', 'Roller Bearing', 'Safety Gloves', 'Safety Goggles',
    'Fastener Set', 'O-Ring', 'Gasket Kit', 'Washer', 'Nut Assembly'
  ];
  
  const partNumber = pick(partNumbers);
  const description = pick(descriptions);
  const name = `${description} ${partNumber}`;
  const equipment = generateEquipmentArray();
  const supplier = pick(suppliers);
  
  return {
    sku,
    partNumber,
    name,
    equipment, // Array of equipment types
    category: pick(categories),
    manufacturer: pick(manufacturers),
    supplier,
    supplierPartNumber: `${supplier.slice(0, 3).toUpperCase()}-${rand(100, 999)}`,
    oemRef: Math.random() < 0.6 ? `OEM-${rand(1000, 9999)}` : undefined,
    preferredSupplierId: supplier,
    leadTimeDays: rand(2, 14),
    minQty: rand(5, 30),
    maxQty: rand(50, 200),
    reorderPoint: rand(10, 40),
    unit: pick(['pcs', 'set', 'm', 'roll', 'box', 'drum', 'kg']),
    packSize: pick([1, 5, 10, 20, 50]),
    price: Number((Math.random() * 50 + 5).toFixed(2)),
    notes: pick([
      'RoHS compliant',
      'Check torque specs',
      'Store in cool, dry place',
      'Hazmat - handle with care',
      'OEM approved',
      ''
    ]),
  };
});

/**
 * Mock stock status data
 */
export const stockStatus = catalogueItems.map((item, idx) => ({
  sku: item.sku,
  onHand: rand(0, item.maxQty * 0.8),
  onOrder: rand(0, 20),
  reserved: rand(0, 5),
}));

