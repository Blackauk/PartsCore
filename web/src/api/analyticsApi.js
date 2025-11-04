import { listTransactions } from './txApi.js';

export async function usageBySite() {
  const tx = await listTransactions({});
  const out = {};
  for (const t of tx) {
    if (t.type !== 'BOOK_OUT') continue;
    const month = t.ts.slice(0, 7);
    const key = `${t.site}|${month}`;
    out[key] = (out[key] || 0) + t.qty;
  }
  return out; // { 'Atlas Road|2025-01': 10 }
}


