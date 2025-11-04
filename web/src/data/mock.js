export function mock() {
  return {
    stockValue: { total: 125000, change: 4.2 },
    lowStock: {
      count: 3,
      items: [
        { part: 'BRG-6005', qty: 1, min: 2, site: 'Atlas Road' },
        { part: 'BELT-A32', qty: 0, min: 5, site: 'Atlas Road' },
        { part: 'OIL-68', qty: 3, min: 10, site: 'Delta' },
      ],
    },
    inboundPOs: { count: 2 },
    recentMovements: [
      { date: '2025-10-01', type: 'BOOK_IN', part: 'BRG-6005', qty: 10, site: 'Atlas Road' },
      { date: '2025-10-01', type: 'BOOK_OUT', part: 'BRG-6005', qty: 2, site: 'Atlas Road' },
      { date: '2025-09-30', type: 'TRANSFER', part: 'OIL-68', qty: 5, site: 'Delta' },
    ],
    fastMovers: [
      { part: 'BRG-6005', issues: 42 },
      { part: 'BELT-A32', issues: 28 },
      { part: 'FUSE-10A', issues: 21 },
      { part: 'FILTER-1', issues: 18 },
      { part: 'OIL-68', issues: 12 },
    ],
    ageing: { count: 6 },
    compliance: [
      { site: 'Atlas Road', missing: 3 },
      { site: 'Delta', missing: 1 },
    ],
  };
}


