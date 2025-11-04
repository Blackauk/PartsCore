// Updated: Register controls with PageControlsContext and remove redundant title
import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit3 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import EditModal from '../../components/EditModal.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import { sites as allSites } from '../../data/mockLocations.js';
import { useApp } from '../../context/AppContext.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';

function StatusChip({ status }) {
  const cls = status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : status === 'Planned' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${cls}`}>{status}</span>;
}

export default function SitesPage() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const pageSize = 10;

  // Register controls with parent - memoize to avoid infinite updates
  const controls = useMemo(() => (
    <>
      <div className="relative flex-1 sm:flex-initial">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <input
          className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>
      <button className="btn" onClick={() => toast('Feature coming soon', 'info')}>
        <Plus size={16} />
        <span className="hidden sm:inline">Add New</span>
      </button>
    </>
  ), [search, toast]);
  usePageControls(controls);

  // Safe defaults
  const sites = Array.isArray(allSites) ? allSites : [];

  const filtered = useMemo(() => sites.filter((s) =>
    search === '' ||
    (s.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  ), [search, sites]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'area', label: 'Area' },
    { key: 'manager', label: 'Manager' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { key: 'timezone', label: 'Timezone' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-2">
        <button title="View" className="btn" onClick={() => setViewing(r)}><Eye size={16} /></button>
        <button title="Edit" className="btn" onClick={() => setEditing(r)}><Edit3 size={16} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <TableCard columns={columns} rows={paged} />
      <EditModal open={!!editing} onClose={() => { toast('Saved (mock)'); setEditing(null); }} row={editing} title="Edit Site" />
      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="Site Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">Code:</span> {viewing.code}</div>
            <div><span className="text-zinc-400">Name:</span> {viewing.name}</div>
            <div><span className="text-zinc-400">Area:</span> {viewing.area}</div>
            <div><span className="text-zinc-400">Manager:</span> {viewing.manager}</div>
            <div><span className="text-zinc-400">Phone:</span> {viewing.phone}</div>
            <div><span className="text-zinc-400">Status:</span> {viewing.status}</div>
            <div><span className="text-zinc-400">Timezone:</span> {viewing.timezone}</div>
            <div><span className="text-zinc-400">Created:</span> {viewing.created}</div>
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
 

