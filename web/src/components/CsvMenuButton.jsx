import { useState, useEffect, useRef } from 'react';

export default function CsvMenuButton({ onExport, onImport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onDoc);
      window.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDoc);
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
      >
        CSV
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-[50] overflow-hidden">
          <button
            className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors text-sm"
            onClick={() => {
              setOpen(false);
              onExport();
            }}
          >
            Export parts
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors text-sm border-t border-zinc-800"
            onClick={() => {
              setOpen(false);
              onImport();
            }}
          >
            Import parts
          </button>
        </div>
      )}
    </div>
  );
}

