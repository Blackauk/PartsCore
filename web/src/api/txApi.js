import { getItem, setItem, uid } from './storage.js';
import { getItem as getStockItem, setItem as setStockItem } from './storage.js';

const TX_KEY = 'transactions';
const TX_SEED = '/src/data/transactions.json';
const STOCK_KEY = 'stock';
const STOCK_SEED = '/src/data/stock.json';

export async function listTransactions(filters = {}) {
  const tx = await getItem(TX_KEY, TX_SEED);
  return tx.filter((t) =>
    (!filters.type || t.type === filters.type) &&
    (!filters.partId || t.partId === filters.partId) &&
    (!filters.site || t.site === filters.site)
  );
}

export async function createTransaction(payload) {
  const tx = await getItem(TX_KEY, TX_SEED);
  const stock = await getStockItem(STOCK_KEY, STOCK_SEED);

  const id = uid('tx');
  const record = { id, ts: new Date().toISOString(), ...payload };

  // Update stock atomically by partId + site + bin
  const keyMatch = (s) => s.partId === record.partId && s.site === record.site && s.bin === record.bin;
  let entry = stock.find(keyMatch);
  if (!entry) {
    entry = { partId: record.partId, site: record.site, bin: record.bin, qty: 0 };
    stock.push(entry);
  }

  if (record.type === 'BOOK_IN' || record.type === 'ADJUSTMENT' && record.qty > 0) {
    entry.qty += record.qty;
  } else if (record.type === 'BOOK_OUT' || (record.type === 'ADJUSTMENT' && record.qty < 0)) {
    const nextQty = entry.qty - Math.abs(record.qty);
    if (nextQty < 0) {
      const err = new Error('Insufficient stock for book-out');
      err.code = 'NEGATIVE_STOCK';
      throw err;
    }
    entry.qty = nextQty;
  }

  tx.push(record);

  await setStockItem(STOCK_KEY, stock);
  await setItem(TX_KEY, tx);

  return record;
}


