import { useMemo, useState, useCallback, useEffect } from 'react';
import { Search, ShoppingCart, Grid, List, GripVertical, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogueItems, stockStatus } from '../../data/catalogueData.js';
import { EQUIPMENT_LIST, mergeCatalogueWithStock, getStockStatus, getStockStatusColor, saveCatalogueOrder, loadCatalogueOrder, clearCatalogueOrder } from '../../lib/catalogue.js';
import BatchOrderDrawer from '../../components/catalogue/BatchOrderDrawer.jsx';
import ItemDetailDrawer from '../../components/items/ItemDetailDrawer.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Catalog() {
  const navigate = useNavigate();
  const { toast } = useApp();
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [stockFilter, setStockFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock
  const [viewMode, setViewMode] = useState('table'); // table, cards
  const [page, setPage] = useState(0);
  
  // Cart & selection
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Item detail drawer
  const [itemDrawerSku, setItemDrawerSku] = useState(null);
  
  const pageSize = 20;

  // Merge catalog with stock
  const catalogWithStock = useMemo(() => {
    return mergeCatalogueWithStock(catalogueItems, stockStatus);
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    let result = catalogWithStock;
    
    // Search filter
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(item => 
        item.sku.toLowerCase().includes(lower) ||
        item.name?.toLowerCase().includes(lower) ||
        item.partNumber?.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
      );
    }
    
    // Equipment filter
    if (selectedEquipment.length > 0) {
      result = result.filter(item => {
        if (!Array.isArray(item.equipment)) return false;
        return selectedEquipment.some(eq => item.equipment.includes(eq));
      });
    }
    
    // Stock filter
    if (stockFilter !== 'all') {
      result = result.filter(item => {
        const status = getStockStatus(item.onHand, item.minQty);
        return status === stockFilter;
      });
    }
    
    return result;
  }, [search, selectedEquipment, stockFilter, catalogWithStock]);

  // Pagination
  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  // Toggle equipment filter
  const toggleEquipment = (equipment) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
    setPage(0);
  };

  // Toggle selection
  const toggleSelection = useCallback((sku) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  }, []);

  // Toggle all selection
  const toggleAllSelection = useCallback(() => {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map(item => item.sku)));
    }
  }, [selected, paged]);

  // Add selected to cart
  const handleAddToCart = useCallback(() => {
    const toAdd = paged.filter(item => selected.has(item.sku));
    const newCart = [...cart];
    toAdd.forEach(item => {
      if (!newCart.find(i => i.sku === item.sku)) {
        newCart.push({ ...item, qty: 0, orderNotes: '' });
      }
    });
    setCart(newCart);
    setSelected(new Set());
  }, [selected, cart, paged]);

  // Update cart item
  const handleUpdateCart = useCallback((sku, updates) => {
    setCart(prev => prev.map(item => 
      item.sku === sku ? { ...item, ...updates } : item
    ));
  }, []);

  // Remove from cart
  const handleRemoveFromCart = useCallback((sku) => {
    setCart(prev => prev.filter(item => item.sku !== sku));
  }, []);

  // Clear cart
  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Get unique suppliers
  const suppliers = useMemo(() => {
    const set = new Set();
    catalogWithStock.forEach(item => {
      if (item.supplier) set.add(item.supplier);
      if (item.preferredSupplierId) set.add(item.preferredSupplierId);
    });
    return Array.from(set).sort();
  }, [catalogWithStock]);

  // Item detail handlers
  const handleRowClick = useCallback((item) => {
    setItemDrawerSku(item.sku);
  }, []);

  const handleAddToBatchFromDetail = useCallback((item) => {
    if (!cart.find(i => i.sku === item.sku)) {
      setCart([...cart, item]);
      toast('Added to batch order', 'success');
    }
  }, [cart, toast]);

  const handleCreateDraftPOFromDetail = useCallback((item, qty) => {
    navigate(`/procurement/purchase-orders/new?sku=${item.sku}&qty=${qty}&supplier=${encodeURIComponent(item.preferredSupplierId || item.supplier || '')}`);
  }, [navigate]);

  // Get item data for drawer
  const itemDrawerData = useMemo(() => {
    if (!itemDrawerSku) return null;
    return catalogWithStock.find(i => i.sku === itemDrawerSku);
  }, [itemDrawerSku, catalogWithStock]);

  const itemDrawerStock = useMemo(() => {
    if (!itemDrawerSku) return null;
    return stockStatus.find(s => s.sku === itemDrawerSku);
  }, [itemDrawerSku]);

  // Quick filter presets
  const EQUIPMENT_PRESETS = [
    { label: 'Digger', equipment: 'Digger' },
    { label: 'Crane', equipment: 'Crane' },
    { label: 'Pump', equipment: 'Pump' },
    { label: 'TBM', equipment: 'TBM' },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4 space-y-3">
        {/* Equipment picker */}
        <div>
          <div className="text-xs text-zinc-400 mb-2">Equipment</div>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => toggleEquipment(preset.equipment)}
                className={`btn-secondary px-3 py-1 text-sm ${
                  selectedEquipment.includes(preset.equipment) 
                    ? 'bg-blue-900/30 text-blue-400 border-blue-700' 
                    : ''
                }`}
              >
                {preset.label}
              </button>
            ))}
            <select
              className="btn-secondary px-3 py-1 text-sm"
              onChange={(e) => toggleEquipment(e.target.value)}
            >
              <option value="">More...</option>
              {EQUIPMENT_LIST.map(eq => !EQUIPMENT_PRESETS.find(p => p.equipment === eq) && (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Search SKU/Part/Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <select
            className="input text-sm"
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="btn-secondary"
          >
            {viewMode === 'table' ? <Grid size={16} /> : <List size={16} />}
          </button>
        </div>

        {/* Actions */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-sm text-zinc-400">{selected.size} item{selected.size !== 1 ? 's' : ''} selected</span>
            <button onClick={handleAddToCart} className="btn">
              Add Selected to Batch
            </button>
          </div>
        )}
      </div>

      {/* Cart floating button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-[70] btn shadow-lg flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          <span className="font-semibold">{cart.length}</span>
        </button>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">
                    <button onClick={toggleAllSelection} className="p-1">
                      {selected.size === paged.length && paged.length > 0 ? (
                        <CheckSquare size={16} className="text-blue-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Part Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Equipment</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">On Hand</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Min/Max</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Supplier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300">Lead Time</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(item => {
                  const status = getStockStatus(item.onHand, item.minQty);
                  const statusColor = getStockStatusColor(status);
                  const isSelected = selected.has(item.sku);
                  const isInCart = cart.find(i => i.sku === item.sku);
                  
                  return (
                    <tr 
                      key={item.sku} 
                      className="border-t border-zinc-800 hover:bg-zinc-800/30 cursor-pointer"
                      onClick={(e) => {
                        // Don't open drawer if clicking checkbox
                        if (!e.target.closest('button')) {
                          handleRowClick(item);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(item);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className="px-4 py-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(item.sku);
                          }} 
                          className="p-1"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-blue-400" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-sm font-mono">
                        {item.sku}
                        {isInCart && <span className="ml-2 px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">in cart</span>}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-zinc-300">{item.partNumber || item.oemPartNumber || '—'}</td>
                      <td className="px-4 py-2 text-sm">{item.name || item.description}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.equipment) && item.equipment.slice(0, 2).map(eq => (
                            <span key={eq} className="px-2 py-0.5 bg-zinc-800 rounded text-xs">
                              {eq}
                            </span>
                          ))}
                          {Array.isArray(item.equipment) && item.equipment.length > 2 && (
                            <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">
                              +{item.equipment.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColor}`}>
                          {status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Low' : 'OOS'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{item.onHand || 0}</td>
                      <td className="px-4 py-2 text-sm text-zinc-400">{item.minQty || 0} / {item.maxQty || '—'}</td>
                      <td className="px-4 py-2 text-sm">{item.preferredSupplierId || item.supplier}</td>
                      <td className="px-4 py-2 text-sm">{item.leadTimeDays || item.leadTime || 0}d</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map(item => {
            const status = getStockStatus(item.onHand, item.minQty);
            const statusColor = getStockStatusColor(status);
            const isInCart = cart.find(i => i.sku === item.sku);
            
            return (
              <div 
                key={item.sku} 
                className="card p-4 space-y-2 cursor-pointer"
                onClick={() => handleRowClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick(item);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="font-mono text-sm font-semibold">{item.sku}</div>
                  {isInCart && <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">in cart</span>}
                </div>
                <div className="text-sm font-medium">{item.name || item.description}</div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(item.equipment) && item.equipment.slice(0, 2).map(eq => (
                    <span key={eq} className="px-2 py-0.5 bg-zinc-800 rounded text-xs">
                      {eq}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColor}`}>
                    {status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Low' : 'OOS'}
                  </span>
                  <span className="text-sm text-zinc-400">{item.onHand || 0} on hand</span>
                </div>
                <div className="text-xs text-zinc-500">
                  {item.preferredSupplierId || item.supplier} • {item.leadTimeDays || 0}d
                </div>
                <button
                  onClick={() => {
                    if (!cart.find(i => i.sku === item.sku)) {
                      setCart([...cart, { ...item, qty: 0, orderNotes: '' }]);
                    }
                  }}
                  className="btn-secondary w-full text-sm"
                  disabled={!!isInCart}
                >
                  {isInCart ? 'In Cart' : '+ Add to Batch'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>Page {page + 1} of {pageCount} ({filtered.length} items)</span>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            Prev
          </button>
          <button className="btn" onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>
            Next
          </button>
        </div>
      </div>

      {/* Batch Order Drawer */}
      <BatchOrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        onUpdateCart={handleUpdateCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        suppliers={suppliers}
      />

      {/* Item Detail Drawer */}
      <ItemDetailDrawer
        isOpen={!!itemDrawerSku}
        onClose={() => setItemDrawerSku(null)}
        sku={itemDrawerSku}
        item={itemDrawerData}
        stock={itemDrawerStock}
        relations={[]}
        history={[]}
        onAddToBatch={handleAddToBatchFromDetail}
        onCreateDraftPO={handleCreateDraftPOFromDetail}
      />
    </div>
  );
}
