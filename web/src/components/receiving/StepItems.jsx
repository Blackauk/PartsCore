// Step 1: Items - Receive quantities with validation

import { useMemo, useState } from 'react';
import { Search, CheckSquare } from 'lucide-react';
import { validateLine } from '../../lib/receiving.js';
import { defaultLocations } from '../../data/mockReceiving.js';

export default function StepItems({ po, lines, onChange, allowOverReceipt = false }) {
  const [search, setSearch] = useState('');
  const [showVariances, setShowVariances] = useState(false);
  const [scanCode, setScanCode] = useState('');

  // Filter lines
  const filteredLines = useMemo(() => {
    let filtered = lines;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((l) =>
        (l.partNo || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (l.sku || '').toLowerCase().includes(q)
      );
    }

    // Variance filter
    if (showVariances) {
      filtered = filtered.filter((l) => {
        const ordered = l.qty || 0;
        const prevReceived = l.previouslyReceived || 0;
        const remaining = Math.max(0, ordered - prevReceived);
        const received = Number(l.qtyReceived || 0);
        return received !== remaining;
      });
    }

    return filtered;
  }, [lines, search, showVariances]);

  // Calculate totals
  const totals = useMemo(() => {
    const received = lines.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0);
    const rejected = lines.reduce((sum, l) => sum + Number(l.qtyRejected || 0), 0);
    const remaining = lines.reduce((sum, l) => {
      const ordered = l.qty || 0;
      const prevReceived = l.previouslyReceived || 0;
      return sum + Math.max(0, ordered - prevReceived);
    }, 0);
    return { lines: lines.length, received, rejected, remaining };
  }, [lines]);

  function updateLine(index, patch) {
    const updated = lines.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onChange(updated);
  }

  function markAllAsReceived() {
    const updated = lines.map((l) => {
      const ordered = l.qty || 0;
      const prevReceived = l.previouslyReceived || 0;
      const rem = Math.max(0, ordered - prevReceived);
      return {
        ...l,
        qtyReceived: rem,
        location: l.location || defaultLocations[po.site] || { site: po.site },
      };
    });
    onChange(updated);
  }

  function handleScanCode(value) {
    setScanCode(value);
    const line = lines.find((l) =>
      (l.partNo || '').toLowerCase() === value.toLowerCase() ||
      (l.sku || '').toLowerCase() === value.toLowerCase()
    );
    if (line) {
      // Scroll to line or highlight
      const index = lines.indexOf(line);
      const ordered = line.qty || 0;
      const prevReceived = line.previouslyReceived || 0;
      const rem = Math.max(0, ordered - prevReceived);
      updateLine(index, { qtyReceived: rem || 1 });
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          className="input text-sm"
          placeholder="Scan/Enter code"
          value={scanCode}
          onChange={(e) => {
            setScanCode(e.target.value);
            if (e.target.value) handleScanCode(e.target.value);
          }}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showVariances}
            onChange={(e) => setShowVariances(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-zinc-300">Show only variances</span>
        </label>
        <button
          className="btn"
          onClick={markAllAsReceived}
          title="Set all lines to receive remaining quantity"
        >
          <CheckSquare size={16} />
          <span className="hidden sm:inline">Mark all as received</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-center">
              <th className="px-3 py-2 text-zinc-400">Part No</th>
              <th className="px-3 py-2 text-zinc-400">Description</th>
              <th className="px-3 py-2 text-zinc-400">Ordered</th>
              <th className="px-3 py-2 text-zinc-400">Prev Received</th>
              <th className="px-3 py-2 text-zinc-400">Remaining</th>
              <th className="px-3 py-2 text-zinc-400">Qty Received</th>
              <th className="px-3 py-2 text-zinc-400">Qty Rejected</th>
              <th className="px-3 py-2 text-zinc-400">Reason/Notes</th>
              <th className="px-3 py-2 text-zinc-400">Location</th>
              <th className="px-3 py-2 text-zinc-400">Print Label</th>
            </tr>
          </thead>
          <tbody>
            {filteredLines.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                  No lines match your filters
                </td>
              </tr>
            ) : (
              filteredLines.map((line, idx) => {
                const globalIdx = lines.indexOf(line);
                // Calculate remaining based on ordered - previously received (from PO)
                const ordered = line.qty || 0;
                const prevReceived = line.previouslyReceived || 0;
                const remaining = Math.max(0, ordered - prevReceived);
                const validation = validateLine(line, { allowOverReceipt });
                const defaultLocation = defaultLocations[po.site] || { site: po.site };

                return (
                  <tr key={globalIdx} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                    <td className="px-3 py-2 text-center">{line.partNo || line.sku}</td>
                    <td className="px-3 py-2 text-center">{line.description || line.name}</td>
                    <td className="px-3 py-2 text-center">{line.qty}</td>
                    <td className="px-3 py-2 text-center">{line.previouslyReceived || 0}</td>
                    <td className="px-3 py-2 text-center font-medium">{remaining}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max={allowOverReceipt ? undefined : remaining}
                        className="w-full input text-sm text-center"
                        value={line.qtyReceived || ''}
                        onChange={(e) =>
                          updateLine(globalIdx, {
                            qtyReceived: e.target.value === '' ? '' : Number(e.target.value),
                            location: line.location || defaultLocation,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full input text-sm text-center"
                        value={line.qtyRejected || ''}
                        onChange={(e) =>
                          updateLine(globalIdx, {
                            qtyRejected: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      {(Number(line.qtyRejected || 0) > 0 || Number(line.qtyReceived || 0) > remaining) && (
                        <div className="space-y-1">
                          <select
                            className="w-full input text-xs"
                            value={line.rejectionReason || line.overReceiptReason || ''}
                            onChange={(e) =>
                              updateLine(globalIdx, {
                                rejectionReason: e.target.value || undefined,
                                overReceiptReason: e.target.value || undefined,
                              })
                            }
                          >
                            <option value="">Select reason...</option>
                            <option value="damaged">Damaged</option>
                            <option value="wrong_item">Wrong item</option>
                            <option value="short_shipped">Short shipped</option>
                            <option value="other">Other</option>
                          </select>
                          {(line.rejectionReason === 'other' || line.overReceiptReason === 'other') && (
                            <input
                              type="text"
                              className="w-full input text-xs mt-1"
                              placeholder="Enter notes..."
                              value={line.rejectionNotes || ''}
                              onChange={(e) =>
                                updateLine(globalIdx, { rejectionNotes: e.target.value })
                              }
                            />
                          )}
                        </div>
                      )}
                      {validation.errors.length > 0 && (
                        <div className="text-xs text-red-400 mt-1">
                          {validation.errors[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <select
                          className="w-full input text-xs"
                          value={line.location?.site || po.site}
                          onChange={(e) =>
                            updateLine(globalIdx, {
                              location: {
                                ...(line.location || defaultLocation),
                                site: e.target.value,
                              },
                            })
                          }
                        >
                          {['Atlas Road', 'VRCB', 'West Ruislip', 'Flat Iron', 'Atlas Yard', 'Depot South'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="w-full input text-xs"
                          placeholder="Zone"
                          value={line.location?.zone || ''}
                          onChange={(e) =>
                            updateLine(globalIdx, {
                              location: {
                                ...(line.location || defaultLocation),
                                zone: e.target.value,
                              },
                            })
                          }
                        />
                        <input
                          type="text"
                          className="w-full input text-xs"
                          placeholder="Bin"
                          value={line.location?.bin || ''}
                          onChange={(e) =>
                            updateLine(globalIdx, {
                              location: {
                                ...(line.location || defaultLocation),
                                bin: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={line.printLabel || false}
                        onChange={(e) => updateLine(globalIdx, { printLabel: e.target.checked })}
                        className="rounded"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer totals */}
      <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <div className="text-sm text-zinc-400">
          Lines: <span className="text-white font-medium">{totals.lines}</span>
        </div>
        <div className="text-sm text-zinc-400">
          Received: <span className="text-emerald-400 font-medium">{totals.received}</span>
        </div>
        <div className="text-sm text-zinc-400">
          Rejected: <span className="text-red-400 font-medium">{totals.rejected}</span>
        </div>
        <div className="text-sm text-zinc-400">
          Still Remaining: <span className="text-amber-400 font-medium">{totals.remaining}</span>
        </div>
      </div>
    </div>
  );
}

