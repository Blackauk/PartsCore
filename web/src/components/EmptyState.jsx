export default function EmptyState({ title = 'Nothing here', subtitle = 'Try adjusting your filters.' }) {
  return (
    <div className="card p-10 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-zinc-400 mt-2">{subtitle}</p>
    </div>
  );
}


