// Updated: Register controls with PageControlsContext and remove redundant title
import { useMemo, useState } from 'react';
import { Plus, Search, Eye, Edit3 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import EditModal from '../../components/EditModal.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import { zones as allZones, sites as allSites } from '../../data/mockLocations.js';
import { useApp } from '../../context/AppContext.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';

export default function ZonesPage() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const pageSize = 10;

  // Register controls with parent - memoize to avoid infinite updates
  const controls = useMemo(() => (
    <>
      <select className="hidden sm:block input text-sm px-2" value={siteCode} onChange={(e) => { setSiteCode(e.target.value); setPage(0); }}>
        <option value="">All Sites</option>
        {(Array.isArray(allSites) ? allSites : []).map((s) => (<option key={s.code} value={s.code}>{s.name} ({s.code})</option>))}
      </select>
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
  ), [search, siteCode, toast, allSites]);
  usePageControls(controls);

  // Safe defaults
  const zones = Array.isArray(allZones) ? allZones : [];
  const sites = Array.isArray(allSites) ? allSites : [];

  const filtered = useMemo(() => zones.filter((z) =>
    (!siteCode || z.siteCode === siteCode) && (
      search === '' || 
      (z.zone || '').toLowerCase().includes(search.toLowerCase()) || 
      (z.siteName || '').toLowerCase().includes(search.toLowerCase())
    )
  ), [search, siteCode, zones]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    { key: 'zone', label: 'Zone' },
    { key: 'site', label: 'Site', render: (r) => `${r.siteName} (${r.siteCode})` },
    { key: 'type', label: 'Type' },
    { key: 'temp', label: 'Temp (°C)' },
    { key: 'humidity', label: 'Humidity (%)' },
    { key: 'capacityBins', label: 'Capacity (bins)' },
    { key: 'occupancyPct', label: 'Occupancy', render: (r) => <ProgressBar value={r.occupancyPct} /> },
    { key: 'restrictions', label: 'Restrictions', render: (r) => (r.restrictions || []).join(', ') },
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
      <EditModal open={!!editing} onClose={() => { toast('Saved (mock)'); setEditing(null); }} row={editing} title="Edit Zone" />
      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="Zone Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">Zone:</span> {viewing.zone}</div>
            <div><span className="text-zinc-400">Site:</span> {viewing.siteName} ({viewing.siteCode})</div>
            <div><span className="text-zinc-400">Type:</span> {viewing.type}</div>
            <div><span className="text-zinc-400">Temp:</span> {viewing.temp} °C</div>
            <div><span className="text-zinc-400">Humidity:</span> {viewing.humidity}%</div>
            <div><span className="text-zinc-400">Capacity:</span> {viewing.capacityBins} bins</div>
            <div><span className="text-zinc-400">Occupancy:</span> {viewing.occupancyPct}%</div>
            <div><span className="text-zinc-400">Restrictions:</span> {(viewing.restrictions || []).join(', ')}</div>
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
 

