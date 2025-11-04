export default function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm">
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}


