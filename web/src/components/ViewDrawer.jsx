import { useEffect } from 'react';

export default function ViewDrawer({ open, onClose, title = 'Details', children, actions = [] }) {
  if (!open) return null;
  useEffect(() => {
    function onEsc(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-lg card border-l border-zinc-800 p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        {children}
        {actions.length > 0 && (
          <div className="mt-6 flex gap-2">
            {actions.map((a) => (
              <button key={a.label} className="btn" onClick={a.onClick}>{a.label}</button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}


