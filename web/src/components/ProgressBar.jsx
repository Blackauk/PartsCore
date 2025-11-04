export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="h-2 w-32 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400">{pct}%</span>
    </div>
  );
}


