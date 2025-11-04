// Updated: Move controls to tab row and remove redundant title
import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Edit3 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import EditModal from '../../components/EditModal.jsx';
import { items as allItems } from '../../data/mockInventory.js';
import { useApp } from '../../context/AppContext.jsx';
import CSVModal from '../../components/CSVModal.jsx';
import CsvMenuButton from '../../components/CsvMenuButton.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';
import { exportToCSV } from '../../utils/csvUtils.js';

function StatusBadge({ stock, min }) {
  let status = 'In Stock';
  let className = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  
  if (stock === 0) {
    status = 'Out';
    className = 'bg-red-500/20 text-red-400 border-red-500/40';
  } else if (stock < min) {
    status = 'Low';
    className = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  }
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs border ${className}`}>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-zinc-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function Items() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const pageSize = 10;

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Mock API call
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load inventory items');
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => allItems || [], []);
  
  const filtered = useMemo(() => {
    return items.filter((r) =>
      (!category || r.category === category) && (
        search === '' ||
        (r.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.name || '').toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, category, items]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  // Define handleExport
  function handleExport() {
    const headers = columns.filter((c) => c.key !== 'actions').map((c) => c.key);
    const rows = filtered.length ? filtered : [];
    if (rows.length === 0) {
      const templateHeaders = ['sku','name','stock','uom','min','location','status'];
      exportToCSV('items_template.csv', templateHeaders, []);
    } else {
      exportToCSV('items_data.csv', headers, rows);
    }
  }

  const columns = [
    { key: 'sku', label: 'Part No.', render: (r) => r.sku || '—' },
    { key: 'name', label: 'Description', render: (r) => r.name || '—' },
    { key: 'stock', label: 'Stock (On hand)', render: (r) => r.stock ?? 0 },
    { key: 'uom', label: 'Unit', render: (r) => r.uom || 'EA' },
    { key: 'min', label: 'Min Stock', render: (r) => r.min ?? 0 },
    { key: 'location', label: 'Location', render: (r) => r.location || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge stock={r.stock} min={r.min} /> },
    { key: 'actions', label: '', render: (r) => (
      <button title="Edit record" className="btn" onClick={() => setEditing(r)}>
        <Edit3 size={16} />
      </button>
    ) },
  ];

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 500);
  };

  // Register controls with parent (after columns and handleExport are defined)
  const controls = useMemo(() => (
    <>
      <select
        className="hidden sm:block input text-sm px-2"
        value={category}
        onChange={(e) => {
          const newCategory = e.target.value;
          setCategory(newCategory);
          // Guard setPage in case it's undefined
          if (typeof setPage === 'function') {
            setPage(0);
          }
        }}
      >
        <option value="">All Categories</option>
        {Array.from(new Set(items.map((i) => i.category).filter(Boolean))).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <div className="relative flex-1 sm:flex-initial">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <input
          className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // Guard setPage in case it's undefined
            if (typeof setPage === 'function') {
              setPage(0);
            }
          }}
        />
      </div>
      <button className="btn" onClick={() => toast('Feature coming soon', 'info')}>
        <Plus size={16} />
        <span className="hidden sm:inline">Add New</span>
      </button>
      <CsvMenuButton
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
      />
    </>
  ), [search, category, items, toast, handleExport, setPage]);
  usePageControls(controls);

  return (
    <div className="space-y-3">
      <TableCard columns={columns} rows={paged} isLoading={loading} error={error} onRetry={handleRetry} />
      <EditModal open={!!editing} onClose={() => setEditing(null)} row={editing} title="Edit Item" />
      <CSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(rows) => {
          toast(`${rows.length} items imported (mock)`);
          console.log('Imported rows (mock):', rows);
        }}
      />
    </div>
  );
}
 

