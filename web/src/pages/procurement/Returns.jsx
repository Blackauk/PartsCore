// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import DocTag from '../../components/DocTag.jsx';
import { returnsRMAs as allRMAs } from '../../data/mockProcurement.js';
import { exportToCSV } from '../../utils/csvUtils.js';

export default function Returns() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState(null);
  const pageSize = 10;

  // Safe defaults
  const rmas = Array.isArray(allRMAs) ? allRMAs : [];

  const filtered = useMemo(() => rmas.filter((r) =>
    (!status || r.status === status) && (
      search === '' || 
      (r.id || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.supplier || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.item || '').toLowerCase().includes(search.toLowerCase())
    )
  ), [search, status, rmas]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    { key: 'id', label: 'RMA' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'item', label: 'Item' },
    { key: 'qty', label: 'Qty' },
    { key: 'reason', label: 'Reason' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'tracking', label: 'Tracking' },
    { key: 'docs', label: 'Docs', render: (r) => (r.docs || []).map((d) => <DocTag key={d.id} tag={d.tag} />) },
    { key: 'actions', label: '', render: (r) => <button className="btn" onClick={() => setViewing(r)}>View</button> },
  ];

  function handleExport() {
    const headers = columns.filter((c) => c.key && c.key !== 'actions' && c.key !== 'docs').map((c) => c.key);
    exportToCSV('returns_rma.csv', headers, filtered);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-semibold">Returns / RMAs</h1>
        <div className="flex gap-2 w-full sm:w-auto items-stretch">
          <select className="hidden sm:block input text-sm px-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">All Status</option>
            {['Requested','Approved','Shipped','Credited','Rejected'].map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <button className="btn" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <TableCard title="Returns / RMAs" columns={columns} rows={paged} />

      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="RMA Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">RMA:</span> {viewing.id}</div>
            <div><span className="text-zinc-400">Supplier:</span> {viewing.supplier}</div>
            <div><span className="text-zinc-400">Item:</span> {viewing.item}</div>
            <div className="mt-2"><span className="text-zinc-400">Docs:</span> {(viewing.docs || []).map((d) => <DocTag key={d.id} tag={d.tag} />)}</div>
          </div>
        )}
      </ViewDrawer>

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

