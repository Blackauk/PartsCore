// Updated: Register controls with PageControlsContext and remove redundant title
import { useMemo, useState } from 'react';
import { Plus, Search, Edit3 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import EditModal from '../../components/EditModal.jsx';
import { lowStock as allLowStock } from '../../data/mockInventory.js';
import { useApp } from '../../context/AppContext.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';

export default function LowStock() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const pageSize = 10;

  // Safe defaults
  const lowStock = Array.isArray(allLowStock) ? allLowStock : [];

  const filtered = useMemo(() => {
    return lowStock.filter((r) =>
      search === '' ||
      (r.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [search, lowStock]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  // Register controls with parent
  const controls = useMemo(() => (
    <>
      <div className="relative flex-1 sm:flex-initial">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <input
          className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>
      <button className="btn" onClick={() => toast('Feature coming soon', 'info')}>
        <Plus size={16} />
        <span className="hidden sm:inline">Add New</span>
      </button>
    </>
  ), [search, toast]);
  usePageControls(controls);

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Name' },
    { key: 'stock', label: 'Stock' },
    { key: 'min', label: 'Min' },
    { key: 'deficit', label: 'Deficit' },
    { key: 'suggestedReorder', label: 'Suggested Reorder' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'leadTime', label: 'Lead Time' },
    { key: 'lastOrder', label: 'Last Order' },
    { key: 'actions', label: '', render: (r) => (
      <button title="Edit record" className="btn" onClick={() => setEditing(r)}>
        <Edit3 size={16} />
      </button>
    ) },
  ];

  return (
    <div className="space-y-4">
      <TableCard columns={columns} rows={paged} />
      <EditModal open={!!editing} onClose={() => setEditing(null)} row={editing} title="Edit Low Stock" />

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
 

