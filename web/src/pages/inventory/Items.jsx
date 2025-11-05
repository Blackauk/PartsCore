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
  let style = { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-text)' };
  
  if (stock === 0) {
    status = 'Out';
    style = { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-text)' };
  } else if (stock < min) {
    status = 'Low';
    style = { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-text)' };
  }
  
  return (
    <span 
      className="inline-block px-2 py-0.5 rounded text-xs border"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
        opacity: 0.9
      }}
    >
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)' }} />
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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


  // Register controls with parent (stable dependencies)
  // Memoize categories list to prevent unnecessary recalculations
  const categories = useMemo(() => 
    Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items]
  );

  // Stabilize handleExport to prevent control re-renders
  const stableHandleExport = useCallback(() => {
    const headers = ['sku', 'name', 'stock', 'uom', 'min', 'location', 'status'];
    const rows = filtered.length ? filtered : [];
    if (rows.length === 0) {
      const templateHeaders = ['sku','name','stock','uom','min','location','status'];
      exportToCSV('items_template.csv', templateHeaders, []);
    } else {
      exportToCSV('items_data.csv', headers, rows);
    }
  }, [filtered]);

  // Stabilize handleImport to prevent control re-renders
  const stableHandleImport = useCallback(() => {
    setImportOpen(true);
  }, []);

  // Register controls - memoize to prevent infinite loops
  // Only recreate when search, category, or categories list actually changes
  const controls = useMemo(() => (
    <>
      <label htmlFor="items-category-select" className="sr-only">Filter by category</label>
      <select
        id="items-category-select"
        name="items-category"
        className="hidden sm:block input text-sm px-2"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setPage(0);
        }}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <div className="relative flex-1 sm:flex-initial">
        <label htmlFor="items-search-input" className="sr-only">Search items</label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
        <input
          id="items-search-input"
          name="items-search"
          type="search"
          className="input w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm"
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
        onExport={stableHandleExport}
        onImport={stableHandleImport}
      />
    </>
  ), [search, category, categories, toast, stableHandleExport, stableHandleImport]);
  
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
 

