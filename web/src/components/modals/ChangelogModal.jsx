import EditModal from '../EditModal.jsx';

const entries = [
  { version: '1.4.0', date: '2025-10-20', notes: ['Reports module', 'Admin RBAC improvements'] },
  { version: '1.3.0', date: '2025-09-12', notes: ['Fix white screen on procurement', 'CSV import/export'] },
];

export default function ChangelogModal({ open = true, onClose }) {
  if (!open) return null;
  return (
    <EditModal title="What’s new" onClose={onClose} onSave={onClose}>
      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.version} className="rounded-lg border border-zinc-800 p-3">
            <div className="font-medium">v{e.version} <span className="text-xs text-zinc-500 ml-2">{e.date}</span></div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {e.notes.map((n,i)=>(<li key={i}>{n}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </EditModal>
  );
}


