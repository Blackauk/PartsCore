// Mock data for receiving/goods receiving workflow

import dayjs from 'dayjs';
import { pendingDeliveries } from './mockDeliveries.js';

const seed = 1234;
let s = seed;
const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const randInt = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const sites = ["Atlas Road", "VRCB", "West Ruislip", "Flat Iron", "Atlas Yard", "Depot South"];
const zones = ["A1", "A2", "B1", "B2", "C1", "C2"];
const bins = ["BIN-001", "BIN-002", "BIN-003", "BIN-004", "BIN-005"];

const suppliers = [
  { id:"SUP-001", name:"Atlas Parts Ltd" },
  { id:"SUP-002", name:"Ironclad Supplies" },
  { id:"SUP-003", name:"Metro Hydraulics" },
  { id:"SUP-004", name:"ElectroMart" },
  { id:"SUP-005", name:"BearingCo" },
  { id:"SUP-006", name:"PrimaAir" },
];

// Helper to generate mock PO line data from PO data
function createPOLineData(poId, supplier, site, expectedDate, lines) {
  const supplierMap = {
    'SUP-001': { name: 'Atlas Parts Ltd', email: 'orders@atlasparts.com' },
    'SUP-003': { name: 'Metro Hydraulics', email: 'sales@metrohydraulics.com' },
    'SUP-004': { name: 'ElectroMart', email: 'orders@electromart.com' },
    'SUP-005': { name: 'BearingCo', email: 'sales@bearingco.com' },
    'SUP-006': { name: 'PrimaAir', email: 'orders@primair.com' },
    'SUP-002': { name: 'Ironclad Supplies', email: 'orders@ironclad.com' },
  };
  const sup = supplierMap[supplier] || { name: supplier, email: `${supplier.toLowerCase().replace(/\s+/g, '')}@example.com` };
  return {
    id: poId,
    supplierId: supplier,
    supplier: sup.name,
    supplierEmail: sup.email,
    orderDate: dayjs().subtract(randInt(15, 30), 'day').format('YYYY-MM-DD'),
    expectedDate,
    site,
    status: 'Approved',
    lines,
  };
}

// Mock PO lines lookup by PO ID - expanded to cover pending deliveries
export const poLines = {
  'PO-1001': {
    id: 'PO-1001',
    supplierId: 'SUP-001',
    supplier: 'Atlas Parts Ltd',
    supplierEmail: 'orders@atlasparts.com',
    orderDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    expectedDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    site: 'Atlas Road',
    status: 'Approved',
    lines: [
      {
        lineNo: 1,
        partNo: 'CLP-45',
        sku: 'CLP-45',
        description: '3" Pipe Clamp',
        qty: 50,
        qtyReceived: 0,
        qtyRemaining: 50,
        uom: 'pcs',
        unitPrice: 12.50,
        lineTotal: 625.00,
        requiresSerials: false,
        requiresBatch: false,
        requiresLocation: true,
      },
      {
        lineNo: 2,
        partNo: 'HSE-12',
        sku: 'HSE-12',
        description: 'Hydraulic Seal 12mm',
        qty: 100,
        qtyReceived: 0,
        qtyRemaining: 100,
        uom: 'pcs',
        unitPrice: 8.75,
        lineTotal: 875.00,
        requiresSerials: false,
        requiresBatch: true,
        requiresLocation: true,
      },
      {
        lineNo: 3,
        partNo: 'BRG-6203',
        sku: 'BRG-6203',
        description: 'Bearing 6203',
        qty: 25,
        qtyReceived: 10,
        qtyRemaining: 15,
        uom: 'pcs',
        unitPrice: 45.00,
        lineTotal: 1125.00,
        requiresSerials: true,
        requiresBatch: false,
        requiresLocation: true,
      },
    ],
  },
  'PO-1002': {
    id: 'PO-1002',
    supplierId: 'SUP-003',
    supplier: 'Metro Hydraulics',
    supplierEmail: 'sales@metrohydraulics.com',
    orderDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    expectedDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    site: 'VRCB',
    status: 'Approved',
    lines: [
      {
        lineNo: 1,
        partNo: 'OIL-H46',
        sku: 'OIL-H46',
        description: 'Hydraulic Oil H46',
        qty: 20,
        qtyReceived: 0,
        qtyRemaining: 20,
        uom: 'L',
        unitPrice: 18.50,
        lineTotal: 370.00,
        requiresSerials: false,
        requiresBatch: true,
        requiresLocation: true,
      },
      {
        lineNo: 2,
        partNo: 'FIL-08',
        sku: 'FIL-08',
        description: 'Inline Filter 8µ',
        qty: 10,
        qtyReceived: 0,
        qtyRemaining: 10,
        uom: 'pcs',
        unitPrice: 125.00,
        lineTotal: 1250.00,
        requiresSerials: false,
        requiresBatch: false,
        requiresLocation: true,
      },
    ],
  },
};

// Dynamically generate PO data for pending deliveries (PO-1020 onwards) based on pendingDeliveries data
export function generateDynamicPOData(poId, supplier, site, expectedDate) {
  const sup = suppliers.find(s => s.id === supplier) || { name: supplier, email: 'orders@example.com' };
  const mockParts = ['Work Lamp', 'Hydraulic Filter', 'Brake Pad Set', 'Coolant 20L', 'Seal Kit', 'Bearing 6203'];
  const mockSkus = ['PART-168', 'PART-395', 'PART-487', 'PART-520', 'PART-623', 'PART-711'];
  
  const numLines = randInt(1, 3);
  const lines = Array.from({ length: numLines }, (_, idx) => {
    const sku = mockSkus[idx % mockSkus.length];
    const qty = randInt(2, 12);
    const alreadyReceived = randInt(0, Math.floor(qty * 0.3)); // Some already received
    return {
      lineNo: idx + 1,
      partNo: sku,
      sku: sku,
      description: pick(mockParts),
      qty: qty,
      qtyReceived: alreadyReceived,
      qtyRemaining: qty - alreadyReceived,
      uom: 'pcs',
      unitPrice: randInt(15, 150),
      lineTotal: 0, // Will calc
      requiresSerials: false,
      requiresBatch: randInt(0, 100) < 50,
      requiresLocation: true,
    };
  });
  // Calculate line totals
  lines.forEach(l => l.lineTotal = l.qty * l.unitPrice);
  
  return {
    id: poId,
    supplierId: supplier,
    supplier: sup.name,
    supplierEmail: sup.email || `${sup.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    orderDate: dayjs(expectedDate).subtract(randInt(5, 20), 'day').format('YYYY-MM-DD'),
    expectedDate,
    site,
    status: 'Approved',
    lines,
  };
}

// Default locations by site
export const defaultLocations = {
  'Atlas Road': { site: 'Atlas Road', zone: 'A1', bin: 'BIN-001' },
  'VRCB': { site: 'VRCB', zone: 'B1', bin: 'BIN-002' },
  'West Ruislip': { site: 'West Ruislip', zone: 'C1', bin: 'BIN-003' },
  'Flat Iron': { site: 'Flat Iron', zone: 'A2', bin: 'BIN-004' },
  'Atlas Yard': { site: 'Atlas Yard', zone: 'B2', bin: 'BIN-005' },
  'Depot South': { site: 'Depot South', zone: 'C2', bin: 'BIN-001' },
};

// Mock users for "Received By" dropdown
export const receivingUsers = [
  'M. Jones',
  'G. Smith',
  'R. Taylor',
  'N. Hart',
  'A. Wilson',
];

// Rejection reasons
export const rejectionReasons = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'wrong_item', label: 'Wrong item' },
  { value: 'short_shipped', label: 'Short shipped' },
  { value: 'expired', label: 'Expired' },
  { value: 'defective', label: 'Defective' },
  { value: 'other', label: 'Other' },
];

/**
 * Get PO data by ID (simulates API call)
 */
export function getPoById(poId) {
  // First check static poLines
  if (poLines[poId]) return poLines[poId];
  
  // Try to generate from pending deliveries if not found
  try {
    const found = pendingDeliveries.find(p => p.poId === poId);
    if (found) {
      return generateDynamicPOData(poId, found.supplierId, found.site, found.expectedDate);
    }
  } catch (e) {
    console.error('Failed to load pending deliveries:', e);
  }
  
  return null;
}

/**
 * Get all sites
 */
export function getSites() {
  return sites;
}

/**
 * Get zones for a site
 */
export function getZonesForSite(site) {
  return zones;
}

/**
 * Get bins for a zone
 */
export function getBinsForZone(zone) {
  return bins;
}


