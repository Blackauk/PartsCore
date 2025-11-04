// Root cause: Data arrays may be undefined causing filter/map errors. ErrorBoundary catching runtime errors.
// Fix: Added safe defaults for all data arrays. Ensured single table render. Added error handling.

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import { mockAdjustments } from '../../data/mockMovements.js';
import { useApp } from '../../context/AppContext.jsx';
import EditModal from '../../components/EditModal.jsx';
import { Edit3 } from 'lucide-react';
import { exportToCSV } from '../../utils/csvUtils.js';
import CSVModal from '../../components/CSVModal.jsx';
import CsvMenuButton from '../../components/CsvMenuButton.jsx';
import AddNewMovementButton from '../../components/movements/AddNewMovement.jsx';

export default function Adjust() {
  const [searchParams] = useSearchParams();
  const skuFromQuery = searchParams.get('sku');
  const { toast } = useApp();
  const [search, setSearch] = useState(skuFromQuery || '');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const pageSize = 10;
  
  // Pre-fill search if sku query param exists
  useEffect(() => {
    if (skuFromQuery && !search) {
      setSearch(skuFromQuery);
    }
  }, [skuFromQuery, search]);

  // Safe defaults
  const adjustments = Array.isArray(mockAdjustments) ? mockAdjustments : [];
  
  // Tri-state sorting: ASC → DESC → RESET
  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null); // reset
    } else {
      setSortDir('asc');
    }
  };

  // Apply sorting before filtering
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return adjustments;
    const copy = [...adjustments];
    copy.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      // Handle date columns
      if (sortKey === 'date') {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
      } else if (sortKey === 'adjustment' || sortKey === 'oldQty' || sortKey === 'newQty') {
        // Handle numeric columns
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      } else {
        // Normalize strings
        const na = typeof va === 'string' ? va.toLowerCase() : va;
        const nb = typeof vb === 'string' ? vb.toLowerCase() : vb;

        if (na == null && nb == null) return 0;
        if (na == null) return sortDir === 'asc' ? -1 : 1;
        if (nb == null) return sortDir === 'asc' ? 1 : -1;

        if (na < nb) return sortDir === 'asc' ? -1 : 1;
        if (na > nb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }

      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [adjustments, sortKey, sortDir]);
  
  const filtered = useMemo(() => {
    if (!sorted.length) return [];
    const q = (search || '').toLowerCase();
    return sorted.filter((r) => {
      if (!r) return false;
      if (!q) return true;
      const reason = (r.reason || '').toLowerCase();
      const partNo = (r.partNo || '').toLowerCase();
      return reason.includes(q) || partNo.includes(q);
    });
  }, [search, sorted]);
  
  const start = page * pageSize;
  const paged = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  const columns = useMemo(() => [
    { key: 'date', label: 'Date' },
    { key: 'reason', label: 'Reason' },
    { key: 'partNo', label: 'Part No.' },
    { key: 'description', label: 'Description' },
    {
      key: 'adjustment',
      label: 'Adjustment',
      render: (r) => (
        <span className={r.adjustment >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {r.adjustment >= 0 ? '+' : ''}{r.adjustment}
        </span>
      ),
    },
    { key: 'oldQty', label: 'Old Qty' },
    { key: 'newQty', label: 'New Qty' },
    { key: 'by', label: 'By' },
    { key: 'actions', label: '', render: (r) => (
      <button title="Edit record" className="btn" onClick={() => setEditing(r)}>
        <Edit3 size={16} />
      </button>
    ) },
  ], []);

  function handleExport() {
    const headers = columns.filter((c) => c.key !== 'actions').map((c) => c.key);
    const rows = filtered.length ? filtered : [];
    if (rows.length === 0) {
      const templateHeaders = ['date','reason','partNo','description','adjustment','oldQty','newQty','by'];
      exportToCSV('adjust_template.csv', templateHeaders, []);
    } else {
      exportToCSV('adjust_data.csv', headers, rows);
    }
  }

  // DOM assertion check for duplicate tables (dev only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const tables = document.querySelectorAll('[role="table"], table');
        console.assert(tables.length === 1, 'Expected 1 table, found', tables.length);
      }, 0);
    }
  });

  return (
    <div className="space-y-3">
      {/* Controls row: Search + CSV + Add New on single row */}
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <CsvMenuButton
            onExport={handleExport}
            onImport={() => setImportOpen(true)}
          />
          <AddNewMovementButton />
        </div>
      </div>

      <TableCard 
        title="Stock Adjustments" 
        columns={columns} 
        rows={paged}
        sortConfig={sortKey && sortDir ? { key: sortKey, direction: sortDir } : null}
        onSort={handleSort}
      />
      <EditModal open={!!editing} onClose={() => setEditing(null)} row={editing} title="Edit Adjustment" />
      <CSVModal open={importOpen} onClose={() => setImportOpen(false)} onImport={(rows) => { toast(`${rows.length} items imported (mock)`); console.log('Imported rows (mock):', rows); }} />

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Page {page + 1} of {pageCount}</span>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Prev
            </button>
            <button
              className="btn"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
