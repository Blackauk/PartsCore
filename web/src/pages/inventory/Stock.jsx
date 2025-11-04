// Stock page - Live stock view with filtering
import { useMemo, useState, useEffect, useRef } from 'react';
import { Search, Edit3 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import EditModal from '../../components/EditModal.jsx';
import { items as allItems } from '../../data/mockInventory.js';
import { useApp } from '../../context/AppContext.jsx';
import { usePageControls } from '../../contexts/PageControlsContext.jsx';

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

export default function Stock() {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 10;
  
  // Use refs to prevent infinite loops
  const prevFiltersRef = useRef({ search: '', category: '' });
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const rendersRef = useRef(0);

  // Render counter for debugging (temporary)
  rendersRef.current++;
  if (rendersRef.current % 50 === 0) {
    console.debug('[Inventory/Stock] renders:', rendersRef.current);
  }

  // Mount/unmount logging
  useEffect(() => {
    console.debug('[Inventory/Stock] mounted');
    return () => {
      console.debug('[Inventory/Stock] unmounted');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  // Simulate data loading with cancellation
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
          setError('Failed to load stock data');
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

  // Safe defaults
  const items = useMemo(() => allItems || [], []);
  
  // Filter with stable dependencies and effect guard
  const filtered = useMemo(() => {
    // Check if filters actually changed to prevent unnecessary recalculations
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

  // Register controls with parent (stable dependencies)
  const controls = useMemo(() => (
    <>
      <label htmlFor="stock-category-select" className="sr-only">Filter by category</label>
      <select
        id="stock-category-select"
        name="stock-category"
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
        <label htmlFor="stock-search-input" className="sr-only">Search stock items</label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
        <input
          id="stock-search-input"
          name="stock-search"
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
    </>
  ), [search, category, items]);
  
  usePageControls(controls);

  return (
    <div className="space-y-3">
      <TableCard columns={columns} rows={paged} isLoading={loading} error={error} onRetry={handleRetry} />
      <EditModal open={!!editing} onClose={() => setEditing(null)} row={editing} title="Edit Stock Item" />

      <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>Page {page + 1} of {pageCount}</span>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Prev</button>
          <button className="btn" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>Next</button>
        </div>
      </div>
    </div>
  );
}

