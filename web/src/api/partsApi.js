import { getItem, setItem, uid } from './storage.js';

const KEY = 'parts';
const SEED = '/src/data/parts.json';

export async function listParts({ search = '', supplierId, status } = {}) {
  const parts = await getItem(KEY, SEED);
  const q = search.toLowerCase();
  return parts.filter((p) =>
    (!supplierId || p.supplierId === supplierId) &&
    (!status || p.status === status) &&
    (!q || p.partNo.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  );
}

export async function createPart(payload) {
  const parts = await getItem(KEY, SEED);
  const next = { id: uid('part'), status: 'active', ...payload };
  parts.push(next);
  await setItem(KEY, parts);
  return next;
}

export async function getPart(id) {
  const parts = await getItem(KEY, SEED);
  return parts.find((p) => p.id === id) || null;
}


