// Root cause: TableCard had no loading/error state handling, causing silent failures when data was undefined/empty.
// Fix: Added isLoading, error props with skeleton/error banner states, and better empty state messaging.

function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)' }} />
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
        <div 
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--table-header-bg)'
          }}
        >
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
        </div>
      )}
      
      {error && (
        <div 
          className="p-4 border-b"
          style={{
            backgroundColor: 'var(--danger-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm" style={{ color: 'var(--danger-text)' }}>Error loading data</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--danger-text)' }}>{error}</p>
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
                    className={`text-center px-4 py-3 font-medium ${
                      isSortable ? 'cursor-pointer select-none' : ''
                    }`}
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--table-header-bg)',
                      ...(isSortable ? {
                        transition: 'background-color 0.2s ease'
                      } : {})
                    }}
                    onMouseEnter={(e) => {
                      if (isSortable) {
                        e.currentTarget.style.backgroundColor = 'var(--table-row-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isSortable) {
                        e.currentTarget.style.backgroundColor = 'var(--table-header-bg)';
                      }
                    }}
                    title={isSortable ? 'Click to sort (asc → desc → off)' : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {isSortable && (
                        <span 
                          aria-hidden 
                          className="inline-block text-xs"
                          style={{ color: 'var(--muted)' }}
                        >
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
                <td 
                  className="px-4 py-12 text-center" 
                  colSpan={columns.length || 1}
                  style={{ color: 'var(--muted)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                // Use stable key: prefer id, sku, or a unique identifier, fallback to index
                const rowKey = r.id || r.sku || r.key || `row-${i}`;
                return (
                  <tr 
                    key={rowKey} 
                    className="border-t table-row-hover"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {columns.map((c) => (
                      <td 
                        key={c.key} 
                        className="px-4 py-3 text-center"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {c.render ? c.render(r) : (r[c.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


