export default function StatusBadge({ status }) {
  const colors = {
    'Complete': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'In Transit': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Issued': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Approved': 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  const colorClass = colors[status] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
}

