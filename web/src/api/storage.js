async function readSeed(path) {
  // Dynamic import JSON seed at build time
  const mod = await import(path);
  return mod.default;
}

// Map old keys to new namespace
const keyMap = {
  'parts': 'cs.parts_catalog',
  'stock': 'cs.stock_items',
  'orders': 'cs.po_list',
  'transactions': 'cs.movements',
  'suppliers': 'cs.suppliers',
};

function getStorageKey(key) {
  // Check if key exists in new namespace
  const newKey = `cs.${key}`;
  if (localStorage.getItem(newKey)) return newKey;
  
  // Check mapped key
  if (keyMap[key]) {
    const mapped = keyMap[key];
    if (localStorage.getItem(mapped)) return mapped;
  }
  
  // Fallback to old key (will be migrated on next access)
  return key;
}

export async function getItem(key, seedPath) {
  const storageKey = getStorageKey(key);
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    // Migrate to new namespace if using old key
    if (storageKey === key && keyMap[key]) {
      const newKey = keyMap[key];
      localStorage.setItem(newKey, raw);
      localStorage.removeItem(key);
    }
    return JSON.parse(raw);
  }
  
  // Try to load seed
  if (seedPath) {
    try {
      const seed = await readSeed(seedPath);
      const newKey = keyMap[key] || `cs.${key}`;
      localStorage.setItem(newKey, JSON.stringify(seed));
      return seed;
    } catch (err) {
      console.warn('Could not load seed:', seedPath);
    }
  }
  
  return [];
}

export async function setItem(key, value) {
  const storageKey = keyMap[key] || `cs.${key}`;
  localStorage.setItem(storageKey, JSON.stringify(value));
  return value;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}


