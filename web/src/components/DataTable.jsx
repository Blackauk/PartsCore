import { useMemo, useState } from 'react';

export default function DataTable({ columns = [], rows = [], pageSize = 10, emptyMessage = 'No data' }) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av > bv ? 1 : -1;
    });
    return sortDir === 'asc' ? copy : copy.reverse();
  }, [rows, sortKey, sortDir]);

  const start = page * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  const pageCount = Math.ceil((rows?.length || 0) / pageSize) || 1;

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (!rows || rows.length === 0) {
    return <div className="card p-6 text-sm text-zinc-400">{emptyMessage}</div>;
  }

  return (
    <div className="card">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60">
            <tr>
              {columns.map((c) => (
                <th key={c.key}
                    onClick={() => c.sortable !== false && toggleSort(c.key)}
                    className={`text-center px-4 py-3 font-medium text-zinc-300 ${c.sortable !== false ? 'cursor-pointer' : ''}`}>
                  {c.label}
                  {sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr key={idx} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-center text-zinc-200">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 text-xs text-zinc-400">
        <span>
          Page {page + 1} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Prev
          </button>
          <button className="btn" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


