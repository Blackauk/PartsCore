import { formatDelta, formatQuantity } from '../lib/number.js';
import { Link } from 'react-router-dom';

export default function KpiCard({ title, value = 0, delta = 0, to }) {
  const positive = delta >= 0;
  return (
    <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-950">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className="mt-1 text-3xl font-semibold">{formatQuantity(value)}</div>
      <div className={`mt-1 text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>{formatDelta(delta)} vs 30d</div>
      {to && <Link to={to} className="text-sm mt-3 inline-block link">View</Link>}
    </div>
  );
}


