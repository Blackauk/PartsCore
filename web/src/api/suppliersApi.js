import { getItem } from './storage.js';

const KEY = 'suppliers';
const SEED = '/src/data/suppliers.json';

export async function listSuppliers() {
  return await getItem(KEY, SEED);
}


