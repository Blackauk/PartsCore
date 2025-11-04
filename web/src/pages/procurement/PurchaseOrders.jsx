// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import EditModal from '../../components/EditModal.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import DocTag from '../../components/DocTag.jsx';
import ReorderPanel from '../../components/ReorderPanel.jsx';
import { purchaseOrders as allPOs, suppliers as allSuppliers } from '../../data/mockProcurement.js';
import { exportToCSV } from '../../utils/csvUtils.js';
import { useApp } from '../../context/AppContext.jsx';

export default function PurchaseOrders() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState('');
  const [site, setSite] = useState('');
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const pageSize = 10;

  // Safe defaults
  const pos = Array.isArray(allPOs) ? allPOs : [];
  const suppliers = Array.isArray(allSuppliers) ? allSuppliers : [];

  const suppliersById = useMemo(() => Object.fromEntries(suppliers.map(s => [s.id, s])), [suppliers]);
  const filtered = useMemo(() => pos.filter((r) =>
    (!supplier || r.supplierId === supplier) &&
    (!status || r.status === status) &&
    (!site || r.site === site) && (
      search === '' || 
      (r.id || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.supplier || '').toLowerCase().includes(search.toLowerCase())
    )
  ), [search, supplier, status, site, pos]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    { key: 'id', label: 'PO' },
    { key: 'supplier', label: 'Supplier', render: (r) => (
      <div className="flex items-center gap-2">
        <span>{r.supplier}</span>
        <span title={`On-time ${suppliersById[r.supplierId]?.onTimePct || 0}% | Returns ${suppliersById[r.supplierId]?.returnRate || 0}%`}>
          <RatingStars value={suppliersById[r.supplierId]?.score5 || 0} />
        </span>
      </div>
    ) },
    { key: 'orderDate', label: 'Ordered' },
    { key: 'expectedDate', label: 'Due' },
    { key: 'site', label: 'Site' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Value' },
    { key: 'docs', label: 'Docs', render: (r) => (r.docs || []).map(d => <DocTag key={d.id} tag={d.tag} />) },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-2">
        <button className="btn" title="View" onClick={() => setViewing(r)}>View</button>
        <button className="btn" title="Edit" onClick={() => setEditing(r)}>Edit</button>
      </div>
    ) },
  ];

  function handleExport() {
    const headers = columns.filter((c) => c.key && c.key !== 'actions' && c.key !== 'docs').map((c) => c.key);
    exportToCSV('purchase_orders.csv', headers, filtered);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-semibold">Purchase Orders</h1>
        <div className="flex gap-2 w-full sm:w-auto items-stretch">
          <select className="hidden sm:block input text-sm px-2" value={supplier} onChange={(e) => { setSupplier(e.target.value); setPage(0); }}>
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
          <select className="hidden sm:block input text-sm px-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">All Status</option>
            {['Draft','Sent','Approved','Partial','Closed','Cancelled'].map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <button className="btn" onClick={() => toast('New PO (mock)')}> <Plus size={16} /> <span className="hidden sm:inline">New PO</span></button>
          <button className="btn" onClick={() => setReorderOpen(true)}>Reorder Assistant</button>
          <button className="btn" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <TableCard title="Purchase Orders" columns={columns} rows={paged} />

      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="PO Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">PO:</span> {viewing.id}</div>
            <div><span className="text-zinc-400">Supplier:</span> {viewing.supplier}</div>
            <div><span className="text-zinc-400">Order Date:</span> {viewing.orderDate}</div>
            <div><span className="text-zinc-400">Due:</span> {viewing.expectedDate}</div>
            <div className="mt-2"><span className="text-zinc-400">Docs:</span> {(viewing.docs || []).map((d) => <DocTag key={d.id} tag={d.tag} />)}</div>
          </div>
        )}
      </ViewDrawer>
      <EditModal open={!!editing} onClose={() => setEditing(null)} row={editing} title="Edit PO" />
      <ReorderPanel open={reorderOpen} onClose={() => setReorderOpen(false)} onCreateDraft={(rows) => { toast(`Draft PO with ${rows.length} lines created (mock)`); }} />

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>Page {page + 1} of {pageCount}</span>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Prev</button>
          <button className="btn" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>Next</button>
        </div>
      </div>
    </div>
  );
}

