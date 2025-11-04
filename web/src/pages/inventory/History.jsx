import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function History() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sku = searchParams.get('sku');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // TODO: Fetch history from API based on sku
    if (sku) {
      // Mock data
      setHistory([
        { id: '1', date: '2025-11-03', type: 'Adjustment', qty: -2, user: 'M. Jones', note: 'Cycle count correction' },
        { id: '2', date: '2025-11-01', type: 'Transfer', qty: 10, user: 'G. Smith', note: 'Moved to Zone B2' },
        { id: '3', date: '2025-10-28', type: 'Received', qty: 50, user: 'R. Taylor', note: 'GRN-2025' },
      ]);
    }
  }, [sku]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          <div className="text-xs text-zinc-400 mt-2">Stock History</div>
          <h1 className="text-xl font-semibold">
            {sku ? `History for ${sku}` : 'Stock History'}
          </h1>
          {!sku && (
            <p className="text-sm text-zinc-400">
              Filter by SKU to view specific item history
            </p>
          )}
        </div>
      </div>

      {/* Search/Filter */}
      {!sku && (
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by SKU..."
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 focus:ring-2 focus:ring-[#F7931E]/50 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold">Transaction History</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            {sku ? `No history found for ${sku}` : 'Enter a SKU to view history'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-zinc-400">Date</th>
                  <th className="px-4 py-2 text-left text-zinc-400">Type</th>
                  <th className="px-4 py-2 text-left text-zinc-400">Quantity</th>
                  <th className="px-4 py-2 text-left text-zinc-400">User</th>
                  <th className="px-4 py-2 text-left text-zinc-400">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-800">
                    <td className="px-4 py-2">{entry.date}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.type === 'Received' ? 'bg-emerald-500/20 text-emerald-300' :
                        entry.type === 'Transfer' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2 font-mono ${
                      entry.qty > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {entry.qty > 0 ? '+' : ''}{entry.qty}
                    </td>
                    <td className="px-4 py-2">{entry.user}</td>
                    <td className="px-4 py-2 text-zinc-400">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Placeholder note */}
      <div className="card p-4 bg-blue-900/20 border-blue-800/30">
        <p className="text-sm text-blue-300">
          📋 <strong>Placeholder page.</strong> This will show a complete transaction history with filters, date ranges, and export options.
        </p>
      </div>
    </div>
  );
}

