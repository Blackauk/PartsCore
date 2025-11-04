export const mockReceives = Array.from({ length: 20 }, (_, i) => ({
  id: `R${String(i + 1).padStart(4, '0')}`,
  date: new Date(2025, 0, i + 1).toISOString().split('T')[0],
  supplier: ['BearingCo', 'TechSupply', 'IndustrialParts', 'AutoParts Ltd', 'Mechanical Inc'][i % 5],
  poNo: `PO-${String(i + 1).padStart(5, '0')}`,
  partNo: ['BRG-6005', 'BELT-A32', 'OIL-68', 'FUSE-10A', 'FILTER-1', 'SEAL-K20', 'BOLT-M8', 'GASKET-R15'][i % 8],
  description: ['Ball Bearing 6005', 'V-Belt A32', 'Hydraulic Oil 68', '10A Fuse', 'Air Filter', 'Shaft Seal K20', 'M8 Bolt', 'Gasket R15'][i % 8],
  qtyReceived: [10, 5, 20, 50, 15, 8, 100, 12][i % 8],
  location: ['Atlas Road - A1-01', 'Delta - B2-05', 'Atlas Road - A2-12', 'Gamma - C1-08', 'Delta - B1-03'][i % 5],
  receivedBy: ['MJ', 'Alice', 'Bob', 'MJ', 'Charlie'][i % 5],
  status: ['Complete', 'Pending', 'Complete', 'Complete', 'In Transit'][i % 5],
}));

export const mockIssues = Array.from({ length: 20 }, (_, i) => ({
  id: `I${String(i + 1).padStart(4, '0')}`,
  date: new Date(2025, 0, i + 2).toISOString().split('T')[0],
  issuedTo: ['John Smith', 'Sarah Lee', 'Mike Brown', 'Lisa Chen', 'Tom Wilson'][i % 5],
  jobPlant: [`WO-${1000 + i}`, `PLANT-A${i % 3 + 1}`, `WO-${1005 + i}`, `PLANT-B${i % 2 + 1}`, `WO-${1010 + i}`][i % 5],
  partNo: ['BRG-6005', 'BELT-A32', 'OIL-68', 'FUSE-10A', 'FILTER-1', 'SEAL-K20', 'BOLT-M8', 'GASKET-R15'][i % 8],
  description: ['Ball Bearing 6005', 'V-Belt A32', 'Hydraulic Oil 68', '10A Fuse', 'Air Filter', 'Shaft Seal K20', 'M8 Bolt', 'Gasket R15'][i % 8],
  qty: [2, 1, 5, 10, 3, 2, 20, 4][i % 8],
  issuedBy: ['MJ', 'Alice', 'Bob', 'MJ', 'Charlie'][i % 5],
  status: ['Issued', 'Pending', 'Issued', 'Issued', 'Approved'][i % 5],
}));

export const mockTransfers = Array.from({ length: 20 }, (_, i) => ({
  id: `T${String(i + 1).padStart(4, '0')}`,
  date: new Date(2025, 0, i + 3).toISOString().split('T')[0],
  from: ['Atlas Road - A1-01', 'Delta - B2-05', 'Gamma - C1-08', 'Atlas Road - A2-12', 'Delta - B1-03'][i % 5],
  to: ['Delta - B2-05', 'Gamma - C1-08', 'Atlas Road - A1-01', 'Delta - B1-03', 'Gamma - C1-08'][i % 5],
  partNo: ['BRG-6005', 'BELT-A32', 'OIL-68', 'FUSE-10A', 'FILTER-1', 'SEAL-K20', 'BOLT-M8', 'GASKET-R15'][i % 8],
  description: ['Ball Bearing 6005', 'V-Belt A32', 'Hydraulic Oil 68', '10A Fuse', 'Air Filter', 'Shaft Seal K20', 'M8 Bolt', 'Gasket R15'][i % 8],
  qty: [5, 3, 10, 25, 8, 4, 50, 6][i % 8],
  by: ['MJ', 'Alice', 'Bob', 'MJ', 'Charlie'][i % 5],
  status: ['Complete', 'In Transit', 'Complete', 'Complete', 'Pending'][i % 5],
}));

export const mockAdjustments = Array.from({ length: 20 }, (_, i) => ({
  id: `A${String(i + 1).padStart(4, '0')}`,
  date: new Date(2025, 0, i + 4).toISOString().split('T')[0],
  reason: ['Stock Take', 'Damage', 'Found', 'Expired', 'Correction', 'Stock Take', 'Damage', 'Found'][i % 8],
  partNo: ['BRG-6005', 'BELT-A32', 'OIL-68', 'FUSE-10A', 'FILTER-1', 'SEAL-K20', 'BOLT-M8', 'GASKET-R15'][i % 8],
  description: ['Ball Bearing 6005', 'V-Belt A32', 'Hydraulic Oil 68', '10A Fuse', 'Air Filter', 'Shaft Seal K20', 'M8 Bolt', 'Gasket R15'][i % 8],
  adjustment: [2, -1, 5, -3, 4, -2, 10, -5][i % 8],
  oldQty: [10, 5, 20, 15, 8, 12, 50, 6][i % 8],
  newQty: [12, 4, 25, 12, 12, 10, 60, 1][i % 8],
  by: ['MJ', 'Alice', 'Bob', 'MJ', 'Charlie'][i % 5],
}));

// Aliases expected by reports and other modules
export const receive = mockReceives;
export const issue = mockIssues;
export const transfer = mockTransfers;
export const adjust = mockAdjustments;

