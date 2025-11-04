import { getItem, setItem } from './storage.js';

const KEY = 'stock';
const SEED = '/src/data/stock.json';

export async function listStock(filters = {}) {
  const stock = await getItem(KEY, SEED);
  return stock.filter((s) =>
    (!filters.site || s.site === filters.site) &&
    (!filters.bin || s.bin === filters.bin) &&
    (!filters.partId || s.partId === filters.partId)
  );
}

export async function setStock(stock) {
  return await setItem(KEY, stock);
}


