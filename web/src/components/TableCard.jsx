// Root cause: TableCard had no loading/error state handling, causing silent failures when data was undefined/empty.
// Fix: Added isLoading, error props with skeleton/error banner states, and better empty state messaging.

function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-zinc-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function TableCard({ 
  title, 
  columns = [], 
  rows = [], 
  isLoading = false, 
  error = null, 
  onRetry = null, 
  emptyMessage = 'No data available',
  sortConfig = null, // { key: string, direction: 'asc' | 'desc' | null }
  onSort = null // (key: string) => void
}) {
  const handleHeaderClick = (columnKey) => {
    if (onSort && columnKey !== 'actions') {
      onSort(columnKey);
    }
  };

  return (
    <div className="card">
      {title && (
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="font-medium">{title}</div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-400 font-medium text-sm">Error loading data</h3>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
            </div>
            {onRetry && (
              <button className="btn btn-xs" onClick={onRetry}>Retry</button>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {columns.map((c) => {
                const isSortable = onSort && c.key !== 'actions';
                const isSorted = sortConfig && sortConfig.key === c.key && sortConfig.direction;
                return (
                  <th 
                    key={c.key} 
                    onClick={() => isSortable && handleHeaderClick(c.key)}
                    className={`text-center px-4 py-3 text-zinc-400 font-medium ${
                      isSortable ? 'cursor-pointer select-none hover:bg-zinc-800/50' : ''
                    }`}
                    title={isSortable ? 'Click to sort (asc → desc → off)' : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {isSortable && (
                        <span aria-hidden className="inline-block text-xs text-zinc-500">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? '▲' : '▼'
                          ) : (
                            '⇅'
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} colCount={columns.length || 1} />
              ))
            ) : !rows || rows.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-zinc-500 text-center" colSpan={columns.length || 1}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/40">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-center text-zinc-200">
                      {c.render ? c.render(r) : (r[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


