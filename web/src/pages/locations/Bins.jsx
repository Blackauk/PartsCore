// Updated: Register controls with PageControlsContext and remove redundant title
import { useMemo, useState } from 'react';
import { Plus, Search, Eye, Edit3 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import EditModal from '../../components/EditModal.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import { bins as allBins, sites as allSites, zones as allZones } from '../../data/mockLocations.js';
import { useApp } from '../../context/AppContext.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';

export default function BinsPage() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const pageSize = 10;

  // Safe defaults
  const bins = Array.isArray(allBins) ? allBins : [];
  const sites = Array.isArray(allSites) ? allSites : [];
  const zones = Array.isArray(allZones) ? allZones : [];

  const zoneOptions = useMemo(() => {
    const z = siteCode ? zones.filter((z) => z.siteCode === siteCode) : zones;
    return Array.from(new Set(z.map((x) => x.zone).filter(Boolean)));
  }, [siteCode, zones]);

  // Register controls with parent - memoize to avoid infinite updates
  const controls = useMemo(() => (
    <>
      <select className="hidden sm:block input text-sm px-2" value={siteCode} onChange={(e) => { setSiteCode(e.target.value); setZoneName(''); setPage(0); }}>
        <option value="">All Sites</option>
        {sites.map((s) => (<option key={s.code} value={s.code}>{s.name} ({s.code})</option>))}
      </select>
      <select className="hidden sm:block input text-sm px-2" value={zoneName} onChange={(e) => { setZoneName(e.target.value); setPage(0); }}>
        <option value="">All Zones</option>
        {zoneOptions.map((z) => (<option key={z} value={z}>{z}</option>))}
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
  ), [search, siteCode, zoneName, sites, zoneOptions, toast]);
  usePageControls(controls);

  const filtered = useMemo(() => bins.filter((b) =>
    (!siteCode || b.siteCode === siteCode) && (!zoneName || b.zone === zoneName) && (
      search === '' || 
      (b.bin || '').toLowerCase().includes(search.toLowerCase()) || 
      (b.barcode || '').toLowerCase().includes(search.toLowerCase())
    )
  ), [search, siteCode, zoneName, bins]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    { key: 'bin', label: 'Bin' },
    { key: 'zone', label: 'Zone' },
    { key: 'site', label: 'Site', render: (r) => `${r.siteName} (${r.siteCode})` },
    { key: 'barcode', label: 'Barcode' },
    { key: 'allowedCategory', label: 'Allowed Category' },
    { key: 'maxQty', label: 'Max Qty' },
    { key: 'currentQty', label: 'Current Qty' },
    { key: 'percentFull', label: '% Full', render: (r) => <ProgressBar value={r.percentFull} /> },
    { key: 'lastMove', label: 'Last Movement' },
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
      <EditModal open={!!editing} onClose={() => { toast('Saved (mock)'); setEditing(null); }} row={editing} title="Edit Bin" />
      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="Bin Details" actions={[
        { label: 'Move Bin', onClick: () => toast('Move Bin (mock)') },
        { label: 'Print Label (QR)', onClick: () => toast('Print Label (mock)') },
      ]}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">Bin:</span> {viewing.bin}</div>
            <div><span className="text-zinc-400">Zone:</span> {viewing.zone}</div>
            <div><span className="text-zinc-400">Site:</span> {viewing.siteName} ({viewing.siteCode})</div>
            <div><span className="text-zinc-400">Barcode:</span> {viewing.barcode}</div>
            <div><span className="text-zinc-400">Allowed:</span> {viewing.allowedCategory}</div>
            <div><span className="text-zinc-400">Max Qty:</span> {viewing.maxQty}</div>
            <div><span className="text-zinc-400">Current Qty:</span> {viewing.currentQty}</div>
            <div><span className="text-zinc-400">% Full:</span> {viewing.percentFull}%</div>
            <div><span className="text-zinc-400">Last Move:</span> {viewing.lastMove}</div>
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
 

