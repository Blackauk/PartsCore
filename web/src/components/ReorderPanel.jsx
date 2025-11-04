import { useMemo, useState } from 'react';
import { usageAgg, stockSnapshot, skus, suppliers as suppliersData } from '../data/mockProcurement.js';

export default function ReorderPanel({ open, onClose, onCreateDraft }) {
  const [selected, setSelected] = useState({});
  const suppliersById = useMemo(() => Object.fromEntries(suppliersData.map(s => [s.id, s])), []);
  const skuMeta = useMemo(() => Object.fromEntries(skus.map(k => [k.sku, k])), []);
  const usageBySku = useMemo(() => Object.fromEntries(usageAgg.map(u => [u.sku, u])), []);
  const stockBySku = useMemo(() => Object.fromEntries(stockSnapshot.map(r => [r.sku, r])), []);

  const suggestions = useMemo(() => {
    return stockSnapshot.map((snap) => {
      const u = usageBySku[snap.sku] || { usage30: 0, usage90: 0 };
      const movingAvg = Math.max(1, Math.round((u.usage90 || 0) / 90));
      const safetyStock = Math.ceil((movingAvg * snap.leadTimeDays) * 0.5);
      const reorderPoint = snap.min + safetyStock;
      const projected = snap.stock - movingAvg * snap.leadTimeDays;
      const needed = reorderPoint - projected + movingAvg * 14;
      const pack = snap.packSize || 1;
      const roundUpToPack = (x) => Math.max(pack, Math.ceil(x / pack) * pack);
      const suggestQty = projected < reorderPoint ? roundUpToPack(needed) : 0;
      return {
        sku: snap.sku,
        name: snap.name,
        stock: snap.stock,
        min: snap.min,
        leadTimeDays: snap.leadTimeDays,
        packSize: pack,
        usage30: u.usage30 || 0,
        usage90: u.usage90 || 0,
        suggestQty,
        supplierId: snap.supplierId,
        supplier: suppliersById[snap.supplierId]?.name || snap.supplierId,
      };
    }).filter(r => r.suggestQty > 0);
  }, [suppliersById]);

  if (!open) return null;

  const grouped = suggestions.reduce((acc, r) => {
    acc[r.supplierId] = acc[r.supplierId] || { supplierId: r.supplierId, supplier: r.supplier, rows: [] };
    acc[r.supplierId].rows.push(r);
    return acc;
  }, {});

  function toggle(sku) {
    setSelected((prev) => ({ ...prev, [sku]: !prev[sku] }));
  }

  function createDraft() {
    const chosen = suggestions.filter((r) => selected[r.sku]);
    if (chosen.length === 0) return onClose();
    onCreateDraft?.(chosen);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-3xl card border-l border-zinc-800 p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Reorder Assistant</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        {Object.values(grouped).length === 0 ? (
          <p className="text-sm text-zinc-400">No suggestions right now.</p>
        ) : (
          Object.values(grouped).map((g) => (
            <div key={g.supplierId} className="mb-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">{g.supplier}</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-400">
                      <th className="px-2 py-1 text-left">Add</th>
                      <th className="px-2 py-1 text-left">SKU</th>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1">Stock</th>
                      <th className="px-2 py-1">Min</th>
                      <th className="px-2 py-1">Lead</th>
                      <th className="px-2 py-1">Pack</th>
                      <th className="px-2 py-1">30d</th>
                      <th className="px-2 py-1">90d</th>
                      <th className="px-2 py-1">Suggest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={r.sku} className="border-t border-zinc-800">
                        <td className="px-2 py-1">
                          <input type="checkbox" checked={!!selected[r.sku]} onChange={() => toggle(r.sku)} />
                        </td>
                        <td className="px-2 py-1">{r.sku}</td>
                        <td className="px-2 py-1">{r.name}</td>
                        <td className="px-2 py-1 text-center">{r.stock}</td>
                        <td className="px-2 py-1 text-center">{r.min}</td>
                        <td className="px-2 py-1 text-center">{r.leadTimeDays}</td>
                        <td className="px-2 py-1 text-center">{r.packSize}</td>
                        <td className="px-2 py-1 text-center">{r.usage30}</td>
                        <td className="px-2 py-1 text-center">{r.usage90}</td>
                        <td className="px-2 py-1 text-center font-semibold">{r.suggestQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
        <div className="flex justify-end mt-4">
          <button className="btn" onClick={createDraft}>Create Draft PO</button>
        </div>
      </aside>
    </div>
  );
}




