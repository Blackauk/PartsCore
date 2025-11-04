export default function StatCard({ title, value, subtitle, trend }) {
  const trendColor = trend == null ? '' : trend >= 0 ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="card p-5">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle && <div className={`mt-1 text-xs ${trendColor}`}>{subtitle}</div>}
    </div>
  );
}


