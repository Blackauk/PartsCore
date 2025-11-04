import { useState, useMemo } from 'react';
import { X, ShoppingCart, Mail, Download, Trash2, Minus, Plus } from 'lucide-react';
import { generateAllEmailDrafts } from '../../lib/exportEmail.js';
import { exportBatchOrderToCSV } from '../../lib/exportExcel.js';

export default function BatchOrderDrawer({ isOpen, onClose, cart, onUpdateCart, onRemoveFromCart, onClearCart, suppliers }) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState([]);

  // Calculate totals
  const totals = useMemo(() => {
    const bySupplier = {};
    cart.forEach(item => {
      const supplier = item.preferredSupplierId || item.supplier || 'Unknown';
      if (!bySupplier[supplier]) bySupplier[supplier] = { count: 0, items: 0 };
      bySupplier[supplier].count++;
      bySupplier[supplier].items += item.qty || 0;
    });
    return bySupplier;
  }, [cart]);

  // Handle quantity change
  const handleQtyChange = (sku, delta) => {
    const item = cart.find(i => i.sku === sku);
    if (!item) return;
    const newQty = Math.max(0, (item.qty || 0) + delta);
    onUpdateCart(sku, { qty: newQty });
  };

  // Handle supplier change
  const handleSupplierChange = (sku, newSupplier) => {
    onUpdateCart(sku, { preferredSupplierId: newSupplier });
  };

  // Auto-fill quantities to reorder point
  const handleAutoFillQty = () => {
    cart.forEach(item => {
      const suggested = Math.max(0, (item.reorderPoint || item.minQty || 0) - (item.onHand || 0));
      if (suggested > 0) {
        onUpdateCart(item.sku, { qty: suggested });
      }
    });
  };

  // Generate email drafts
  const handleGenerateEmail = () => {
    const drafts = generateAllEmailDrafts(cart, {
      companyName: 'CoreStock',
      deliveryAddress: '123 Warehouse St, London, UK',
    });
    setGeneratedEmails(drafts);
    setEmailModalOpen(true);
  };

  // Copy email to clipboard
  const handleCopyEmail = (html) => {
    navigator.clipboard.writeText(html).then(() => {
      alert('Email copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy');
    });
  };

  // Open mailto link
  const handleMailto = (draft) => {
    // For simplicity, just generate mailto with subject
    const mailtoLink = `mailto:?subject=${encodeURIComponent(draft.subject)}`;
    window.location.href = mailtoLink;
  };

  // Export Excel
  const handleExportExcel = () => {
    exportBatchOrderToCSV(cart);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Drawer */}
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 shadow-2xl z-[91] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold">Batch Order List</h2>
            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-sm">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button onClick={onClose} className="btn-secondary">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(totals).map(([supplier, stats]) => (
              <div key={supplier} className="card p-3 text-center">
                <div className="text-xs text-zinc-400">{supplier}</div>
                <div className="text-lg font-semibold mt-1">{stats.count} items</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <button onClick={handleAutoFillQty} className="btn-secondary text-sm">
              Auto-fill Qty
            </button>
            <button onClick={onClearCart} className="btn-secondary text-sm text-red-400">
              <Trash2 size={14} className="inline mr-1" />
              Clear All
            </button>
          </div>

          {/* Items table */}
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">SKU</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Supplier</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Notes</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-zinc-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                        No items in cart
                      </td>
                    </tr>
                  ) : (
                    cart.map(item => (
                      <tr key={item.sku} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                        <td className="px-4 py-2 text-sm font-mono">{item.sku}</td>
                        <td className="px-4 py-2 text-sm">{item.name || item.description}</td>
                        <td className="px-4 py-2 text-sm">
                          <select
                            className="w-full input text-xs"
                            value={item.preferredSupplierId || item.supplier || ''}
                            onChange={(e) => handleSupplierChange(item.sku, e.target.value)}
                          >
                            {suppliers.map(sup => (
                              <option key={sup} value={sup}>{sup}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQtyChange(item.sku, -1)}
                              className="btn-secondary px-2 py-1"
                              disabled={!item.qty || item.qty === 0}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              className="w-16 input text-sm text-center"
                              value={item.qty || 0}
                              onChange={(e) => onUpdateCart(item.sku, { qty: parseInt(e.target.value) || 0 })}
                              min="0"
                            />
                            <button
                              onClick={() => handleQtyChange(item.sku, 1)}
                              className="btn-secondary px-2 py-1"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <input
                            type="text"
                            className="w-full input text-xs"
                            placeholder="Notes..."
                            value={item.orderNotes || ''}
                            onChange={(e) => onUpdateCart(item.sku, { orderNotes: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => onRemoveFromCart(item.sku)}
                            className="btn-secondary px-2 py-1 text-red-400 hover:bg-red-900/20"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex gap-2 pt-4 border-t border-zinc-800">
            <button onClick={handleGenerateEmail} className="btn flex-1" disabled={cart.length === 0}>
              <Mail size={16} />
              Generate Email Draft
            </button>
            <button onClick={handleExportExcel} className="btn flex-1" disabled={cart.length === 0}>
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Email modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Email Drafts</h3>
              <button onClick={() => setEmailModalOpen(false)} className="btn-secondary">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              {generatedEmails.map((draft, idx) => (
                <div key={idx} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium">{draft.supplier}</div>
                      <div className="text-xs text-zinc-400">{draft.subject}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyEmail(draft.html)}
                        className="btn-secondary text-xs"
                      >
                        Copy HTML
                      </button>
                      <button
                        onClick={() => handleMailto(draft)}
                        className="btn text-xs"
                      >
                        Open Email
                      </button>
                    </div>
                  </div>
                  <div
                    className="prose prose-invert max-w-none text-xs border border-zinc-800 rounded p-3 bg-zinc-950 overflow-auto"
                    dangerouslySetInnerHTML={{ __html: draft.html }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

