// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import { transactions } from '../../data/mockReports.js';
import { exportToCSV } from '../../utils/csvUtils.js';

export default function Transactions() {
  const [search, setSearch] = useState(localStorage.getItem('rep_tx_search') || '');
  const [type, setType] = useState(localStorage.getItem('rep_tx_type') || '');
  const [site, setSite] = useState(localStorage.getItem('rep_tx_site') || '');
  const [viewing, setViewing] = useState(null);

  // Safe defaults
  const txns = Array.isArray(transactions) ? transactions : [];

  const filtered = useMemo(() => txns.filter((r) => (
    (!type || r.type === type) && (!site || (r.site||'').includes(site)) && (
      search === '' || 
      (r.sku||'').toLowerCase().includes(search.toLowerCase()) || 
      (r.item||'').toLowerCase().includes(search.toLowerCase()) || 
      (r.ref||'').toLowerCase().includes(search.toLowerCase())
    )
  )), [search, type, site, txns]);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'ref', label: 'Ref' },
    { key: 'sku', label: 'SKU' },
    { key: 'item', label: 'Name' },
    { key: 'qty', label: 'Qty' },
    { key: 'site', label: 'Site' },
    { key: 'user', label: 'User' },
    { key: 'notes', label: 'Notes' },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-2">
        <button className="btn" onClick={()=> setViewing(r)}>View</button>
        <button className="btn" onClick={()=> navigator.clipboard.writeText(r.ref)}>Copy Ref</button>
      </div>
    )}
  ];

  function handleExport() {
    const headers = columns.filter(c => c.key && c.key !== 'actions').map(c=>c.key);
    exportToCSV('transactions.csv', headers, filtered);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-semibold">Transactions Log</h1>
        <div className="flex gap-2 w-full sm:w-auto items-stretch">
          <select className="hidden sm:block input text-sm px-2" value={type} onChange={(e)=>{ const v=e.target.value; setType(v); localStorage.setItem('rep_tx_type', v); }}>
            <option value="">All Types</option>
            {['RECEIVE','ISSUE','TRANSFER','ADJUST'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="hidden sm:block input text-sm px-2" placeholder="Filter by site" value={site} onChange={(e)=>{ const v=e.target.value; setSite(v); localStorage.setItem('rep_tx_site', v); }} />
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search..." value={search} onChange={(e)=>{ const v=e.target.value; setSearch(v); localStorage.setItem('rep_tx_search', v); }} />
          </div>
          <button className="btn" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <TableCard title="Recent Transactions" columns={columns} rows={filtered} />

      <ViewDrawer open={!!viewing} onClose={()=> setViewing(null)} title="Transaction Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">Date:</span> {viewing.date}</div>
            <div><span className="text-zinc-400">Type:</span> {viewing.type}</div>
            <div><span className="text-zinc-400">Ref:</span> {viewing.ref}</div>
            <div><span className="text-zinc-400">SKU:</span> {viewing.sku}</div>
            <div><span className="text-zinc-400">Qty:</span> {viewing.qty}</div>
            <div><span className="text-zinc-400">Site:</span> {viewing.site}</div>
            <div><span className="text-zinc-400">User:</span> {viewing.user}</div>
            {(viewing.linked?.po || viewing.linked?.grn || viewing.linked?.rma) && (
              <div className="mt-2"><span className="text-zinc-400">Linked:</span> {[viewing.linked?.po, viewing.linked?.grn, viewing.linked?.rma].filter(Boolean).join(', ')}</div>
            )}
          </div>
        )}
      </ViewDrawer>
    </div>
  );
}

