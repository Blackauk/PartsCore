import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import DocTag from '../../components/DocTag.jsx';
import { suppliers as allSuppliers } from '../../data/mockProcurement.js';
import { exportToCSV } from '../../utils/csvUtils.js';

function Badge({ label, value, good, warn, bad }) {
  const n = Number(value);
  const cls = n >= good ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : n >= warn ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-red-500/20 text-red-300 border-red-500/30';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>{label}: {n}%</span>;
}

// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

export default function Suppliers() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState(null);
  const pageSize = 10;

  // Safe defaults
  const suppliers = Array.isArray(allSuppliers) ? allSuppliers : [];

  const filtered = useMemo(() => suppliers.filter((r) =>
    (!category || r.category === category) && (!status || r.status === status) && (
      search === '' || (r.name || '').toLowerCase().includes(search.toLowerCase())
    )
  ), [search, category, status, suppliers]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    { key: 'name', label: 'Supplier' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'score5', label: 'Score', render: (r) => <RatingStars value={r.score5} /> },
    { key: 'onTimePct', label: 'On-time', render: (r) => <Badge label="On-time" value={r.onTimePct} good={90} warn={75} /> },
    { key: 'returnRate', label: 'Return rate', render: (r) => <Badge label="Returns" value={r.returnRate} good={95} warn={90} /> },
    { key: 'lastOrder', label: 'Last Order' },
    { key: 'docs', label: 'Docs', render: (r) => (r.docs || []).map((d) => <DocTag key={d.id} tag={d.tag} />) },
    { key: 'actions', label: '', render: (r) => <button className="btn" onClick={() => setViewing(r)}>View</button> },
  ];

  function handleExport() {
    const headers = columns.filter((c) => c.key && c.key !== 'actions' && c.key !== 'score5' && c.key !== 'docs').map((c) => c.key);
    exportToCSV('suppliers.csv', headers, filtered);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <div className="flex gap-2 w-full sm:w-auto items-stretch">
          <select className="hidden sm:block input text-sm px-2" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
            <option value="">All Categories</option>
            {Array.from(new Set(suppliers.map((s) => s.category).filter(Boolean))).map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <select className="hidden sm:block input text-sm px-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">All Status</option>
            {['Active','Inactive'].map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <button className="btn" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <TableCard title="Suppliers" columns={columns} rows={paged} />

      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="Supplier Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">Supplier:</span> {viewing.name}</div>
            <div><span className="text-zinc-400">On-time:</span> {viewing.onTimePct}%</div>
            <div><span className="text-zinc-400">Return rate:</span> {viewing.returnRate}%</div>
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

