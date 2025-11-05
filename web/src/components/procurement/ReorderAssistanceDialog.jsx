import { useMemo, useState } from 'react';
import ModalRoot from '../ModalRoot.jsx';
import { usageAgg, stockSnapshot, skus, suppliers as suppliersData } from '../../data/mockProcurement.js';

export default function ReorderAssistanceDialog({ open, onClose, onGeneratePO }) {
  const [selected, setSelected] = useState({});
  const [quantities, setQuantities] = useState({});
  const [groupBySupplier, setGroupBySupplier] = useState(true);

  const suppliersById = useMemo(() => Object.fromEntries(suppliersData.map(s => [s.id, s])), []);
  const usageBySku = useMemo(() => Object.fromEntries(usageAgg.map(u => [u.sku, u])), []);

  // Get items below ROP/min stock
  const candidates = useMemo(() => {
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
        part: snap.sku,
        site: 'Main Site', // Default site
        stock: snap.stock,
        min: snap.min,
        rop: reorderPoint,
        leadTimeDays: snap.leadTimeDays,
        packSize: pack,
        usage30: u.usage30 || 0,
        usage90: u.usage90 || 0,
        suggestQty,
        supplierId: snap.supplierId,
        supplier: suppliersById[snap.supplierId]?.name || snap.supplierId,
      };
    }).filter(r => r.suggestQty > 0 || r.stock < r.min);
  }, [suppliersById, usageBySku]);

  const grouped = useMemo(() => {
    if (!groupBySupplier) {
      return { all: { supplierId: 'all', supplier: 'All Suppliers', rows: candidates } };
    }
    return candidates.reduce((acc, r) => {
      if (!acc[r.supplierId]) {
        acc[r.supplierId] = { supplierId: r.supplierId, supplier: r.supplier, rows: [] };
      }
      acc[r.supplierId].rows.push(r);
      return acc;
    }, {});
  }, [candidates, groupBySupplier]);

  function toggle(sku) {
    setSelected((prev) => ({ ...prev, [sku]: !prev[sku] }));
  }

  function setQuantity(sku, qty) {
    setQuantities((prev) => ({ ...prev, [sku]: qty }));
  }

  function handleGeneratePO() {
    const chosen = candidates.filter((r) => selected[r.sku]).map(r => ({
      ...r,
      qty: quantities[r.sku] || r.suggestQty,
    }));
    if (chosen.length === 0) {
      onClose();
      return;
    }
    onGeneratePO?.(chosen);
    onClose();
  }

  return (
    <ModalRoot 
      open={open} 
      onClose={onClose} 
      title="Reorder Assistance"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={groupBySupplier}
              onChange={(e) => setGroupBySupplier(e.target.checked)}
            />
            <span>Group by supplier</span>
          </label>
        </div>

        {/* Candidate Items */}
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-zinc-400">No items below ROP/min stock at this time.</p>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {Object.values(grouped).map((g) => (
              <div key={g.supplierId}>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">{g.supplier}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-zinc-400 border-b border-zinc-800">
                        <th className="px-3 py-2 text-left">Add</th>
                        <th className="px-3 py-2 text-left">Part</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-center">On Hand</th>
                        <th className="px-3 py-2 text-center">Min</th>
                        <th className="px-3 py-2 text-center">ROP</th>
                        <th className="px-3 py-2 text-center">Suggested Qty</th>
                        <th className="px-3 py-2 text-center">Override Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map((r) => (
                        <tr key={r.sku} className="border-b border-zinc-800">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={!!selected[r.sku]}
                              onChange={() => toggle(r.sku)}
                            />
                          </td>
                          <td className="px-3 py-2">{r.sku}</td>
                          <td className="px-3 py-2">{r.name}</td>
                          <td className="px-3 py-2 text-center">{r.stock}</td>
                          <td className="px-3 py-2 text-center">{r.min}</td>
                          <td className="px-3 py-2 text-center">{r.rop}</td>
                          <td className="px-3 py-2 text-center font-semibold">{r.suggestQty}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="input w-20 text-center"
                              value={quantities[r.sku] || r.suggestQty}
                              onChange={(e) => setQuantity(r.sku, Number(e.target.value))}
                              disabled={!selected[r.sku]}
                              min={1}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn" 
            onClick={handleGeneratePO}
            disabled={!Object.values(selected).some(v => v)}
          >
            Generate PO Draft
          </button>
        </div>
      </div>
    </ModalRoot>
  );
}

