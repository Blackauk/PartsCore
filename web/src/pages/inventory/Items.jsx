// Updated: Move controls to tab row and remove redundant title
// Fixed: Added mount logging, AbortController, debounced search, and effect guards
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const pageSize = 10;
  
  // Refs for effect guards and abort controller
  const abortControllerRef = useRef(null);
  const prevFiltersRef = useRef({ search: '', category: '' });
  const debounceTimerRef = useRef(null);

  // Mount/unmount logging for debugging
  useEffect(() => {
    console.debug('[Inventory/Items] mounted');
    return () => {
      console.debug('[Inventory/Items] unmounted');
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounce search input (250ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page on search change
    }, 250);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  // Simulate data loading with AbortController
  useEffect(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoading(true);
    const timer = setTimeout(() => {
      try {
        if (!signal.aborted) {
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError('Failed to load inventory items');
          setLoading(false);
        }
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run on mount/unmount

  const items = useMemo(() => allItems || [], []);
  
  // Filter with effect guard to prevent unnecessary recalculations
  const filtered = useMemo(() => {
    const currentFilters = { search: debouncedSearch, category };
    const filtersChanged = 
      prevFiltersRef.current.search !== debouncedSearch ||
      prevFiltersRef.current.category !== category;
    
    if (!filtersChanged && prevFiltersRef.current.items === items) {
      return prevFiltersRef.current.filtered || [];
    }
    
    prevFiltersRef.current = { search: debouncedSearch, category, items };
    
    const result = items.filter((r) =>
      (!category || r.category === category) && (
        debouncedSearch === '' ||
        (r.sku || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.name || '').toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );
    
    prevFiltersRef.current.filtered = result;
    return result;
  }, [debouncedSearch, category, items]);

  const start = page * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  // Define columns as stable reference
  const columns = useMemo(() => [
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
  ], []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 500);
  };

  // Define handleExport as stable callback
  const handleExportCallback = useMemo(() => {
    return () => {
      const headers = ['sku', 'name', 'stock', 'uom', 'min', 'location', 'status'];
      const rows = filtered.length ? filtered : [];
      if (rows.length === 0) {
        const templateHeaders = ['sku','name','stock','uom','min','location','status'];
        exportToCSV('items_template.csv', templateHeaders, []);
      } else {
        exportToCSV('items_data.csv', headers, rows);
      }
    };
  }, [filtered]);

  // Register controls with parent (stable dependencies)
  const controls = useMemo(() => (
    <>
      <select
        className="hidden sm:block input text-sm px-2"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setPage(0);
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
            // Page reset handled by debounce effect
          }}
        />
      </div>
      <button className="btn" onClick={() => toast('Feature coming soon', 'info')}>
        <Plus size={16} />
        <span className="hidden sm:inline">Add New</span>
      </button>
      <CsvMenuButton
        onExport={handleExportCallback}
        onImport={() => setImportOpen(true)}
      />
    </>
  ), [search, category, items, toast, handleExportCallback, setPage]);
  
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
 

