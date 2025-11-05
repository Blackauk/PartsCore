/**
 * Skeleton loading state for Catalog page
 */
export default function CatalogSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Toolbar skeleton */}
      <div className="card p-4 space-y-3">
        <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
        <div className="h-10 bg-zinc-800 rounded"></div>
      </div>
      
      {/* Table skeleton */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {Array.from({ length: 10 }).map((_, i) => (
                  <th key={i} className="px-4 py-2">
                    <div className="h-4 bg-zinc-800 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-t border-base">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-800 rounded w-32"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-zinc-800 rounded w-16"></div>
          <div className="h-8 bg-zinc-800 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

