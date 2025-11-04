import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, FileText, Package, ShoppingCart, Plus, Edit, ExternalLink, Star, 
  Download, Trash2, Eye, Minus, Upload, Calendar, User, PlusCircle
} from 'lucide-react';
import { getStockStatus, getStockStatusColor } from '../../lib/catalogue.js';
import Dropzone from '../Dropzone.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { formatCurrency } from '../../lib/currency.js';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function ItemDetailDrawer({ 
  isOpen, 
  onClose, 
  sku, 
  item: initialItem, 
  stock, 
  relations = [], 
  history = [], 
  onAddToBatch, 
  onCreateDraftPO 
}) {
  const navigate = useNavigate();
  const { toast } = useApp();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const [item, setItem] = useState(initialItem);
  const [attachments, setAttachments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [viewingAttachment, setViewingAttachment] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    if (isOpen && sku) {
      loadItemData(sku);
    }
  }, [isOpen, sku]);

  function loadItemData(sku) {
    // Load attachments
    const storedAtt = localStorage.getItem(`item-attachments:${sku}`);
    if (storedAtt) {
      try {
        setAttachments(JSON.parse(storedAtt));
      } catch (e) {}
    }

    // Load suppliers
    const storedSup = localStorage.getItem(`item-suppliers:${sku}`);
    if (storedSup) {
      try {
        setSuppliers(JSON.parse(storedSup));
      } catch (e) {}
    }

    // Load alternatives
    const storedAlt = localStorage.getItem(`item-alt:${sku}`);
    if (storedAlt) {
      try {
        setAlternatives(JSON.parse(storedAlt));
      } catch (e) {}
    }

    // Load stock history
    const storedHistory = localStorage.getItem(`stock-tx:${sku}`);
    if (storedHistory) {
      try {
        setStockHistory(JSON.parse(storedHistory));
      } catch (e) {}
    }
  }

  function saveAttachments(sku, att) {
    localStorage.setItem(`item-attachments:${sku}`, JSON.stringify(att));
    setAttachments(att);
  }

  function saveSuppliers(sku, sup) {
    localStorage.setItem(`item-suppliers:${sku}`, JSON.stringify(sup));
    setSuppliers(sup);
  }

  function saveAlternatives(sku, alt) {
    localStorage.setItem(`item-alt:${sku}`, JSON.stringify(alt));
    setAlternatives(alt);
  }

  function saveStockHistory(sku, hist) {
    localStorage.setItem(`stock-tx:${sku}`, JSON.stringify(hist));
    setStockHistory(hist);
  }

  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  if (!isOpen || !item) return null;

  const status = getStockStatus(item.onHand || stock?.onHand || 0, item.minQty);
  const statusColor = getStockStatusColor(status);

  const handleAddToBatch = () => {
    const suggestedQty = Math.max(0, (item.reorderPoint || item.minQty || 0) - (item.onHand || stock?.onHand || 0));
    onAddToBatch({ 
      ...item, 
      qty: suggestedQty || 1,
      orderNotes: ''
    });
    onClose();
  };

  const handleCreateDraftPO = () => {
    const suggestedQty = Math.max(0, (item.reorderPoint || item.minQty || 0) - (item.onHand || stock?.onHand || 0));
    onCreateDraftPO(item, suggestedQty || 1);
    onClose();
  };

  const handleCreateDraftPL = () => {
    const suggestedQty = Math.max(0, (item.reorderPoint || item.minQty || 0) - (item.onHand || stock?.onHand || 0));
    navigate(`/procurement/deliveries/packing-list/new?sku=${item.sku}&qty=${suggestedQty || 1}`);
    onClose();
  };

  const handleFileUpload = async (files) => {
    const newAtt = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      blobUrl: URL.createObjectURL(file),
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString()
    }));
    saveAttachments(sku, [...attachments, ...newAtt]);
    toast('Files attached', 'success');
  };

  const handleRemoveAttachment = (id) => {
    saveAttachments(sku, attachments.filter(a => a.id !== id));
    toast('Attachment removed', 'success');
  };

  const handleTogglePreferred = (supplierId) => {
    const updated = suppliers.map(s => ({
      ...s,
      isPreferred: s.supplierId === supplierId ? !s.isPreferred : false
    }));
    saveSuppliers(sku, updated);
    toast('Preferred supplier updated', 'success');
  };

  const handleAddStockTx = (tx) => {
    const newTx = {
      id: crypto.randomUUID(),
      sku: item.sku,
      date: new Date().toISOString(),
      user: 'Current User',
      ...tx
    };
    saveStockHistory(sku, [newTx, ...stockHistory]);
    
    // Update item stock
    if (tx.type === 'receive' || tx.type === 'adjust_plus') {
      setItem(prev => ({ ...prev, onHand: (prev.onHand || 0) + tx.qty }));
    } else if (tx.type === 'issue' || tx.type === 'adjust_minus') {
      setItem(prev => ({ ...prev, onHand: Math.max(0, (prev.onHand || 0) - tx.qty) }));
    }
    
    toast('Stock updated', 'success');
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 shadow-2xl z-[90] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{item.sku}</h2>
            <div className="text-sm text-zinc-400 mt-1">{item.name || item.description || item.partNumber}</div>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span>Part No: {item.partNumber || '—'}</span>
              {item.oemPartNumber && (
                <span className="flex items-center gap-1">
                  OEM: {item.oemPartNumber}
                  {item.oemManualRef && (
                    <button className="link text-blue-400" title="Open O&M manual">
                      <FileText size={12} />
                    </button>
                  )}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-[73px] bg-zinc-900 border-b border-zinc-800 px-6 z-10">
          <div className="flex gap-2 overflow-x-auto">
            {['overview', 'stock', 'alternatives', 'suppliers', 'attachments', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-white border-blue-500'
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {Array.isArray(item.equipment) && item.equipment.map(eq => (
                  <span key={eq} className="px-2 py-1 bg-zinc-800 rounded text-xs">
                    {eq}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-400">Status</div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor}`}>
                      {status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Lead Time</div>
                  <div className="mt-1 font-medium">{item.leadTimeDays || item.leadTime || 0} days</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Min / Max</div>
                  <div className="mt-1 font-medium">{item.minQty || 0} / {item.maxQty || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Unit</div>
                  <div className="mt-1 font-medium">{item.unit || 'pcs'}</div>
                </div>
              </div>

              {item.descriptionLong && (
                <div>
                  <div className="text-xs text-zinc-400 mb-1">Description</div>
                  <div className="mt-1 text-sm whitespace-pre-wrap">{item.descriptionLong}</div>
                </div>
              )}

              {item.specs && (
                <div>
                  <div className="text-xs text-zinc-400 mb-1">Specifications</div>
                  <div className="mt-1 text-sm whitespace-pre-wrap">{item.specs}</div>
                </div>
              )}

              <button className="btn-secondary text-sm">
                <Edit size={14} />
                Edit Details
              </button>
            </div>
          )}

          {/* Stock & Locations */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-3 text-center">
                  <div className="text-xs text-zinc-400">On Hand</div>
                  <div className="text-2xl font-semibold mt-1">{item.onHand || stock?.onHand || 0}</div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-xs text-zinc-400">On Order</div>
                  <div className="text-2xl font-semibold mt-1">{item.onOrder || stock?.onOrder || 0}</div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-xs text-zinc-400">Reserved</div>
                  <div className="text-2xl font-semibold mt-1">{item.reserved || stock?.reserved || 0}</div>
                </div>
              </div>

              <StockAdjustmentForm onAddTx={handleAddStockTx} />

              {stock?.locations && stock.locations.length > 0 ? (
                <div>
                  <div className="text-sm font-medium mb-2">Locations</div>
                  <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-zinc-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Site</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Zone</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Bin</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stock.locations.map((loc, idx) => (
                          <tr key={idx} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                            <td className="px-3 py-2 text-sm">{loc.site}</td>
                            <td className="px-3 py-2 text-sm text-zinc-400">{loc.zone || '—'}</td>
                            <td className="px-3 py-2 text-sm text-zinc-400">{loc.bin || '—'}</td>
                            <td className="px-3 py-2 text-sm">{loc.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8 text-sm">No location data available</div>
              )}
            </div>
          )}

          {/* Alternatives */}
          {activeTab === 'alternatives' && (
            <div className="space-y-4">
              {alternatives.length > 0 ? (
                <div className="space-y-3">
                  {['equivalent', 'compatible', 'supersedes', 'superseded_by', 'vendor_alt'].map(relationType => {
                    const items = alternatives.filter(r => r.relation === relationType);
                    if (items.length === 0) return null;
                    
                    return (
                      <div key={relationType}>
                        <div className="text-sm font-medium mb-2 capitalize">{relationType.replace('_', ' ')}</div>
                        <div className="card p-0 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-zinc-800">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">SKU</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Supplier</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-zinc-300"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map(rel => {
                                const altStatus = getStockStatus(0, 0);
                                const altColor = getStockStatusColor(altStatus);
                                return (
                                  <tr key={rel.toSku} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                    <td className="px-3 py-2 text-sm font-mono">{rel.toSku}</td>
                                    <td className="px-3 py-2 text-sm">—</td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-0.5 rounded text-xs ${altColor}`}>
                                        Unknown
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-zinc-400">—</td>
                                    <td className="px-3 py-2 text-center">
                                      <button className="btn-secondary text-xs px-2 py-1">
                                        <Plus size={12} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto text-zinc-500 mb-3" size={48} />
                  <div className="text-zinc-400 text-sm mb-3">No alternatives linked</div>
                  <button className="btn-secondary">
                    <Plus size={14} />
                    Link Alternative
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Suppliers */}
          {activeTab === 'suppliers' && (
            <div className="space-y-4">
              <div className="card p-0 overflow-hidden">
                <div className="p-3 bg-zinc-800 flex items-center justify-between border-b border-zinc-700">
                  <div className="text-sm font-medium">Supplier List</div>
                  <button className="btn-secondary text-xs px-2 py-1">
                    <Plus size={12} />
                    Add Supplier
                  </button>
                </div>
                {suppliers.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Preferred</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Supplier</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Lead Time</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Last Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-300">Notes</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-zinc-300"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((sup, idx) => (
                        <tr key={idx} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                          <td className="px-3 py-2">
                            <button 
                              onClick={() => handleTogglePreferred(sup.supplierId)}
                              className="p-1 hover:text-yellow-400"
                            >
                              <Star size={16} className={sup.isPreferred ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-500'} />
                            </button>
                          </td>
                          <td className="px-3 py-2 text-sm font-mono">{sup.supplierId}</td>
                          <td className="px-3 py-2 text-sm">{sup.leadTimeDays || '—'}d</td>
                          <td className="px-3 py-2 text-sm">{sup.lastPrice ? formatCurrency(sup.lastPrice, settings.currency) : '—'}</td>
                          <td className="px-3 py-2 text-sm text-zinc-400 max-w-xs truncate">{sup.notes || '—'}</td>
                          <td className="px-3 py-2 text-center">
                            <button className="btn-secondary text-xs px-2 py-1">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-zinc-500 py-8 text-sm">No suppliers added yet</div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <Dropzone 
                onFilesUploaded={handleFileUpload}
                accept="image/*,application/pdf"
                inputRef={fileInputRef}
              />
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div key={att.id} className="card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-blue-400" />
                        <div>
                          <div className="text-sm font-medium">{att.name}</div>
                          <div className="text-xs text-zinc-500">
                            {(att.size / 1024).toFixed(1)} KB · {att.uploadedBy} · {new Date(att.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewingAttachment(att)}
                          className="btn-secondary text-xs px-2 py-1"
                        >
                          <Eye size={12} />
                        </button>
                        <button 
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="btn-secondary text-xs px-2 py-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-12 text-sm">No attachments yet</div>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {stockHistory.length > 0 ? (
                <div className="space-y-2">
                  {stockHistory.slice(0, 20).map((entry) => (
                    <div key={entry.id} className="card p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs bg-blue-900/30 text-blue-400`}>
                              {entry.type?.toUpperCase().replace('_', ' ') || 'N/A'}
                            </span>
                            {entry.qty && (
                              <span className="text-sm font-mono">
                                {entry.qty > 0 ? '+' : ''}{entry.qty}
                              </span>
                            )}
                          </div>
                          {entry.ref && (
                            <div className="text-xs text-zinc-400 mb-1">Ref: {entry.ref}</div>
                          )}
                          {entry.note && (
                            <div className="text-sm">{entry.note}</div>
                          )}
                        </div>
                        <div className="text-right text-xs text-zinc-500">
                          <div>{new Date(entry.date).toLocaleDateString()}</div>
                          <div>{new Date(entry.date).toLocaleTimeString()}</div>
                          <div className="mt-1">{entry.user}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-12 text-sm">No history yet</div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex gap-2">
          <button onClick={handleAddToBatch} className="btn-secondary flex-1 text-sm">
            <ShoppingCart size={14} />
            Add to Batch
          </button>
          <button onClick={handleCreateDraftPO} className="btn-secondary flex-1 text-sm">
            Create Draft PO
          </button>
          <button onClick={handleCreateDraftPL} className="btn-secondary flex-1 text-sm">
            Create Draft PL
          </button>
          <button className="btn-secondary text-sm">
            <ExternalLink size={14} />
            Full Page
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

// Stock Adjustment Form Component
function StockAdjustmentForm({ onAddTx }) {
  const [txType, setTxType] = useState('receive');
  const [qty, setQty] = useState('');
  const [site, setSite] = useState('');
  const [zone, setZone] = useState('');
  const [bin, setBin] = useState('');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!qty || parseFloat(qty) <= 0) return;

    onAddTx({
      type: txType,
      qty: parseFloat(qty),
      site: site || undefined,
      zone: zone || undefined,
      bin: bin || undefined,
      ref: ref || undefined,
      note: note || undefined
    });

    setQty('');
    setSite('');
    setZone('');
    setBin('');
    setRef('');
    setNote('');
  };

  return (
    <div className="card p-4">
      <div className="text-sm font-medium mb-3">Stock Adjustment</div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={txType}
            onChange={(e) => setTxType(e.target.value)}
            className="input text-sm"
          >
            <option value="receive">Receive</option>
            <option value="issue">Issue</option>
            <option value="adjust_plus">Adjust +</option>
            <option value="adjust_minus">Adjust -</option>
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="input text-sm"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="input text-sm"
          />
          <input
            type="text"
            placeholder="Zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="input text-sm"
          />
          <input
            type="text"
            placeholder="Bin"
            value={bin}
            onChange={(e) => setBin(e.target.value)}
            className="input text-sm"
          />
        </div>
        <input
          type="text"
          placeholder="Reference (optional)"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="input text-sm"
        />
        <textarea
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input text-sm min-h-[60px]"
          rows="2"
        />
        <button type="submit" className="btn w-full text-sm">
          <PlusCircle size={14} />
          Add Transaction
        </button>
      </form>
    </div>
  );
}
