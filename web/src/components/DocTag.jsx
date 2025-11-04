const colorMap = {
  'quote': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'purchase-order': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'invoice': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'credit-note': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'delivery-note': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'grn': 'bg-green-500/20 text-green-300 border-green-500/30',
  'rma': 'bg-red-500/20 text-red-300 border-red-500/30',
  'warranty': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'cert': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'insurance': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'pod': 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  'spec': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export default function DocTag({ tag }) {
  const cls = colorMap[tag] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>{tag}</span>;
}




