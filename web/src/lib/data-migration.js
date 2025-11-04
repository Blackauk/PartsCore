/**
 * Data migration and seeding utilities
 * Migrates legacy localStorage keys and seeds initial data
 */

const LEGACY_KEYS = [
  'parts_catalog',
  'stock_items',
  'movements',
  'po_list',
  'deliveries',
  'labels_templates',
  'reports_cache',
  // Map existing keys
  'parts',
  'stock',
  'orders',
  'transactions',
  'suppliers',
];

const NS = 'cs'; // core stock namespace
const mapKey = (k) => `${NS}.${k}`;

/**
 * Migrate legacy localStorage keys to new namespace
 */
export function migrateLegacyDataOnce() {
  const doneKey = `${NS}.migrated_v1`;
  if (localStorage.getItem(doneKey) === 'true') return;

  // Map legacy keys to new structure
  const keyMap = {
    'parts': 'parts_catalog',
    'stock': 'stock_items',
    'orders': 'po_list',
    'transactions': 'movements',
    'suppliers': 'suppliers',
  };

  // Migrate mapped keys
  Object.entries(keyMap).forEach(([oldKey, newKeyName]) => {
    const legacy = localStorage.getItem(oldKey);
    const targetKey = mapKey(newKeyName);
    if (legacy && !localStorage.getItem(targetKey)) {
      localStorage.setItem(targetKey, legacy);
    }
  });

  // Migrate direct legacy keys
  LEGACY_KEYS.forEach(k => {
    const legacy = localStorage.getItem(k);
    const targetKey = mapKey(k);
    if (legacy && !localStorage.getItem(targetKey)) {
      localStorage.setItem(targetKey, legacy);
    }
  });

  localStorage.setItem(doneKey, 'true');
}

/**
 * Load seed data from JSON files or generate defaults
 */
async function tryFetch(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    return null;
  }
}

/**
 * Load seed data from src/data JSON files
 */
async function loadSeedFromSrc() {
  try {
    // Try importing from src/data
    const partsData = await import('../data/parts.json');
    const stockData = await import('../data/stock.json');
    const ordersData = await import('../data/orders.json');
    const transactionsData = await import('../data/transactions.json');
    const suppliersData = await import('../data/suppliers.json');

    return {
      parts: partsData.default || partsData,
      stock: stockData.default || stockData,
      orders: ordersData.default || ordersData,
      transactions: transactionsData.default || transactionsData,
      suppliers: suppliersData.default || suppliersData,
    };
  } catch (err) {
    console.warn('Could not load seed data from src/data:', err);
    return null;
  }
}

/**
 * Ensure seed data exists, loading from files or creating defaults
 */
export async function ensureSeedData() {
  const hasCatalog = !!localStorage.getItem(mapKey('parts_catalog'));
  if (hasCatalog) return;

  // Try loading from src/data first
  const seedData = await loadSeedFromSrc();
  if (seedData) {
    if (seedData.parts) localStorage.setItem(mapKey('parts_catalog'), JSON.stringify(seedData.parts));
    if (seedData.stock) localStorage.setItem(mapKey('stock_items'), JSON.stringify(seedData.stock));
    if (seedData.orders) localStorage.setItem(mapKey('po_list'), JSON.stringify(seedData.orders));
    if (seedData.transactions) localStorage.setItem(mapKey('movements'), JSON.stringify(seedData.transactions));
    if (seedData.suppliers) localStorage.setItem(mapKey('suppliers'), JSON.stringify(seedData.suppliers));
    return;
  }

  // Try public seeds as fallback
  const catalog = await tryFetch('/seed/catalog.json');
  const stock = await tryFetch('/seed/stock.json');
  const po = await tryFetch('/seed/pos.json');
  const del = await tryFetch('/seed/deliveries.json');

  if (catalog) localStorage.setItem(mapKey('parts_catalog'), JSON.stringify(catalog));
  if (stock) localStorage.setItem(mapKey('stock_items'), JSON.stringify(stock));
  if (po) localStorage.setItem(mapKey('po_list'), JSON.stringify(po));
  if (del) localStorage.setItem(mapKey('deliveries'), JSON.stringify(del));
}

/**
 * Bootstrap data layer - call on app start
 */
export async function bootstrapDataLayer() {
  migrateLegacyDataOnce();
  await ensureSeedData();
}

