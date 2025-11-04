export default function FormField({ label, hint, error, children }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm text-zinc-300">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}


