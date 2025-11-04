import { getItem, setItem, uid } from './storage.js';

const KEY = 'orders';
const SEED = '/src/data/orders.json';

export async function listRequisitions() {
  const data = await getItem(KEY, SEED);
  return data.requisitions || [];
}

export async function listPurchaseOrders() {
  const data = await getItem(KEY, SEED);
  return data.purchaseOrders || [];
}

export async function createRequisition(payload = {}) {
  const data = await getItem(KEY, SEED);
  const rec = { id: uid('req'), status: 'DRAFT', lines: [], ...payload };
  data.requisitions = data.requisitions || [];
  data.requisitions.push(rec);
  await setItem(KEY, data);
  return rec;
}


