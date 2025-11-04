import { useState } from 'react';
import { parseCSV } from '../utils/csvUtils.js';

export default function CSVModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!open) return null;

  function handlePreview() {
    if (!file) return;
    parseCSV(file, ({ headers, rows }) => {
      setPreview({ headers, rows: rows.slice(0, 5) });
    });
  }

  function handleConfirm() {
    if (!file) return;
    parseCSV(file, ({ rows }) => {
      onImport?.(rows);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg card p-5 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Import CSV</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-3">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input w-full" />
          <div className="flex gap-2">
            <button className="btn" onClick={handlePreview} disabled={!file}>Preview</button>
            <button className="btn" onClick={handleConfirm} disabled={!file}>Confirm Import</button>
          </div>
          {preview && (
            <div className="mt-3 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {preview.headers.map((h) => (
                      <th key={h} className="px-2 py-1 text-left text-zinc-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, i) => (
                    <tr key={i} className="border-t border-zinc-800">
                      {preview.headers.map((h) => (
                        <td key={h} className="px-2 py-1">{r[h] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


