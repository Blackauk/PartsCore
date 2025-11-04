export default function EditModal({ open = true, onClose, title = 'Edit Record', row }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md card border-l border-zinc-800 p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-zinc-400">Part No.</label>
            <input className="input w-full mt-1" defaultValue={row?.partNo || ''} readOnly />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Description</label>
            <input className="input w-full mt-1" defaultValue={row?.description || ''} readOnly />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Qty</label>
            <input className="input w-full mt-1" defaultValue={row?.qty ?? row?.qtyReceived ?? ''} readOnly />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Status</label>
            <input className="input w-full mt-1" defaultValue={row?.status || ''} readOnly />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onClose} title="Mock save">Save</button>
        </div>
      </div>
    </div>
  );
}


