// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.
// Updated: Reordered columns and replaced QR button with Manage dropdown menu.

// Updated: Move FilterBar controls to tab row and remove redundant title
import { useMemo, useState, useEffect } from 'react';
import { masterItems, suppliersList, categoriesList, sitesList, zonesBySiteMap, landmarksBySiteMap } from '../../data/mockInventory.js';
import FilterBar from '../../components/FilterBar.jsx';
import TableCard from '../../components/TableCard.jsx';
import QrPrintModal from '../../components/qr/QrPrintModal.jsx';
import EditModal from '../../components/EditModal.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import ManageMenu from '../../components/ManageMenu.jsx';
import { exportToCSV } from '../../utils/csvUtils.js';
import { useApp } from '../../context/AppContext.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../lib/toast.js';
import MinMaxModal from '../../components/modals/MinMaxModal.jsx';

export default function MasterList() {
  const { toast: appToast } = useApp();
  const can = useAuthStore((s) => s.can);
  const [filters, setFilters] = useState({});
  const [qrPrintItem, setQrPrintItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [minMaxItem, setMinMaxItem] = useState(null);
  const [sort, setSort] = useState({ key: 'articleNumber', dir: 'asc' });

  // Safe defaults
  const items = Array.isArray(masterItems) ? masterItems : [];
  const suppliers = Array.isArray(suppliersList) ? suppliersList : [];
  const categories = Array.isArray(categoriesList) ? categoriesList : [];
  const sites = Array.isArray(sitesList) ? sitesList : [];
  const zones = zonesBySiteMap || {};
  const landmarks = landmarksBySiteMap || {};

  const filtered = useMemo(() => {
    const q = (filters.sku || '').toLowerCase();
    return items.filter((it) => {
      if (filters.supplier && it.supplier !== filters.supplier) return false;
      if (filters.category && it.category !== filters.category) return false;
      if (filters.site && it.site !== filters.site) return false;
      if (filters.zone && it.zone !== filters.zone) return false;
      if (filters.landmark && it.landmark !== filters.landmark) return false;
      if (q) {
        const hay = `${it.sku} ${it.articleNumber} ${it.articleName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a,b)=>{
      const ka = a[sort.key] ?? '';
      const kb = b[sort.key] ?? '';
      const res = String(ka).localeCompare(String(kb));
      return sort.dir === 'asc' ? res : -res;
    });
  }, [filters, sort]);

  function exportFiltered() {
    // Export headers in the new column order
    const headers = ['sku','articleNumber','articleName','quantity','equipment','category','supplier','site','zone','landmark','plan','supersededNumbers','uom','updatedAt'];
    exportToCSV(`master_list_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.csv`, headers, filtered);
  }

  const columns = [
    // Identification
    { key: 'sku', label: 'SKU', render: (r) => <span className="min-w-[120px] inline-block">{r.sku || '—'}</span> },
    { key: 'articleNumber', label: 'Article Number', render: (r) => <span className="min-w-[140px] inline-block">{r.articleNumber || '—'}</span> },
    { key: 'articleName', label: 'Article Name', render: (r) => <span className="truncate max-w-[260px] block">{r.articleName || '—'}</span> },
    // Inventory
    { key: 'quantity', label: 'Quantity', render: (r) => (
      <span className="tabular-nums inline-block min-w-[90px] text-zinc-200">{r.quantity ?? 0}</span>
    ) },
    { key: 'equipment', label: 'Equipment', render: (r) => r.equipment || '—' },
    { key: 'category', label: 'Category', render: (r) => r.category || '—' },
    // Location
    { key: 'supplier', label: 'Supplier', render: (r) => r.supplier || '—' },
    { key: 'site', label: 'Site', render: (r) => r.site || '—' },
    { key: 'zone', label: 'Zone', render: (r) => r.zone || '—' },
    { key: 'landmark', label: 'Landmark', render: (r) => r.landmark || '—' },
    // Metadata
    { key: 'plan', label: 'Plan', render: (r) => r.plan || '—' },
    { key: 'supersededNumbers', label: 'Superceded', render: (r) => r.supersededNumbers || '—' },
    { key: 'uom', label: 'UoM', render: (r) => <span className="min-w-[60px] inline-block">{r.uom || 'EA'}</span> },
    { key: 'updatedAt', label: 'Updated', render: (r) => r.updatedAt || '—' },
    // Actions
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="w-[64px]">
        <ManageMenu
          item={r}
          can={{
            edit: can('catalog:update'),
            printQR: can('labels:print:single'),
            view: can('catalog:read'),
            history: can('reports:view'),
            adjust: can('inventory:adjust'),
            transfer: can('inventory:transfer'),
            minmax: can('catalog:update'),
            archive: can('catalog:update'),
          }}
          onSetMinMax={() => setMinMaxItem(r)}
          onArchive={async (sku) => {
            // TODO: Call archive API
            appToast(`Item ${sku} archived (mock)`);
            console.log('Archive item', sku);
          }}
        />
      </div>
    ) },
  ];

  // Register simple controls (search/actions only) - FilterBar goes below tabs
  const controls = useMemo(() => (
    <>
      {/* Simple controls only - FilterBar rendered separately below */}
    </>
  ), []);
  usePageControls(controls);

  // DOM assertion check for duplicate tables (dev only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const tables = document.querySelectorAll('[role="table"], table');
        console.assert(tables.length === 1, 'Expected 1 table, found', tables.length);
      }, 0);
    }
  });

  return (
    <div className="space-y-3">
      {/* FilterBar - Directly below tabs, fully visible */}
      <div className="mt-0">
        <FilterBar
          suppliers={suppliers}
          categories={categories}
          sites={sites}
          zonesBySite={zones}
          landmarksBySite={landmarks}
          value={filters}
          onChange={setFilters}
          onExport={exportFiltered}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-xs text-zinc-400">Showing {filtered.length} / {items.length}</div>
      </div>
      <TableCard 
        columns={columns} 
        rows={filtered.slice(0, 25)} 
        sortConfig={sort.key && sort.dir ? { key: sort.key, direction: sort.dir } : null}
        onSort={(key) => {
          if (sort.key !== key) {
            setSort({ key, dir: 'asc' });
          } else if (sort.dir === 'asc') {
            setSort({ key, dir: 'desc' });
          } else {
            setSort({ key: null, dir: null });
          }
        }}
      />
      <QrPrintModal open={!!qrPrintItem} onClose={()=>setQrPrintItem(null)} item={qrPrintItem} />
      <EditModal 
        open={!!editingItem} 
        onClose={()=>setEditingItem(null)} 
        row={editingItem} 
        title={`Edit ${editingItem?.sku || 'Item'}`} 
      />
      <ViewDrawer 
        open={!!viewingItem} 
        onClose={()=>setViewingItem(null)} 
        title={`Details: ${viewingItem?.sku || 'Item'}`}
      >
        {viewingItem && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">SKU:</span> {viewingItem.sku}</div>
            <div><span className="text-zinc-400">Article Number:</span> {viewingItem.articleNumber}</div>
            <div><span className="text-zinc-400">Article Name:</span> {viewingItem.articleName}</div>
            <div><span className="text-zinc-400">Quantity:</span> {viewingItem.quantity}</div>
            <div><span className="text-zinc-400">Equipment:</span> {viewingItem.equipment || '—'}</div>
            <div><span className="text-zinc-400">Category:</span> {viewingItem.category}</div>
            <div><span className="text-zinc-400">Supplier:</span> {viewingItem.supplier}</div>
            <div><span className="text-zinc-400">Site:</span> {viewingItem.site}</div>
            <div><span className="text-zinc-400">Zone:</span> {viewingItem.zone}</div>
            <div><span className="text-zinc-400">Landmark:</span> {viewingItem.landmark}</div>
            <div><span className="text-zinc-400">Plan:</span> {viewingItem.plan || '—'}</div>
            <div><span className="text-zinc-400">Superceded:</span> {viewingItem.supersededNumbers || '—'}</div>
            <div><span className="text-zinc-400">UoM:</span> {viewingItem.uom}</div>
            <div><span className="text-zinc-400">Updated:</span> {viewingItem.updatedAt}</div>
          </div>
        )}
      </ViewDrawer>
      <MinMaxModal 
        open={!!minMaxItem}
        onClose={() => setMinMaxItem(null)}
        item={minMaxItem}
        onSave={(data) => {
          appToast(`Min/Max levels updated for ${minMaxItem?.sku}`);
          setMinMaxItem(null);
        }}
      />
    </div>
  );
}


