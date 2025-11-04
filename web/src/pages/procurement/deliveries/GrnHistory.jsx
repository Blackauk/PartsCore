// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import TableCard from '../../../components/TableCard.jsx';
import ViewDrawer from '../../../components/ViewDrawer.jsx';
import DocTag from '../../../components/DocTag.jsx';
import { grnHistory } from '../../../data/mockDeliveries.js';
import { exportToCSV } from '../../../utils/csvUtils.js';
import { Link } from 'react-router-dom';

export default function GrnHistory() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);

  // Safe defaults
  const history = Array.isArray(grnHistory) ? grnHistory : [];

  const filtered = useMemo(() => history.filter((r) =>
    (!status || r.status === status) && (
      search === '' || 
      (r.id || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.supplier || '').toLowerCase().includes(search.toLowerCase())
    )
  ), [search, status, history]);

  const columns = [
    { key: 'id', label: 'GRN', render: (r) => <Link to={`/procurement/deliveries/${r.id}`} className="link">{r.id}</Link> },
    { key: 'poId', label: 'PO' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'date', label: 'Date Received' },
    { key: 'receivedBy', label: 'Received By' },
    { key: 'site', label: 'Site' },
    { key: 'status', label: 'Status' },
    { key: 'docs', label: 'Docs', render: (r) => (r.docs || []).map((d) => <DocTag key={d.id} tag={d.tag} />) },
    { key: 'actions', label: '', render: (r) => <button className="btn" onClick={() => setViewing(r)}>Quick View</button> },
  ];

  function handleExport() {
    const headers = columns.filter((c) => c.key && !['actions','docs'].includes(c.key)).map((c) => c.key);
    exportToCSV('grn_history.csv', headers, filtered);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 w-full sm:w-auto items-stretch">
        <select className="hidden sm:block input text-sm px-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Pending Inspection','Accepted','Rejected','Partially Received'].map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn" onClick={handleExport}>Export CSV</button>
      </div>

      <TableCard title="GRN History" columns={columns} rows={filtered} />

      <ViewDrawer open={!!viewing} onClose={() => setViewing(null)} title="GRN Details">
        {viewing && (
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">GRN:</span> {viewing.id}</div>
            <div><span className="text-zinc-400">PO:</span> {viewing.poId}</div>
            <div><span className="text-zinc-400">Supplier:</span> {viewing.supplier}</div>
            <div className="mt-2"><span className="text-zinc-400">Docs:</span> {(viewing.docs || []).map((d) => <DocTag key={d.id} tag={d.tag} />)}</div>
          </div>
        )}
      </ViewDrawer>
    </div>
  );
}


