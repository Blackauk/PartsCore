import EditModal from '../EditModal.jsx';

const sessions = [
  { device: 'Windows', browser: 'Chrome', ip: '192.168.1.10', last: 'Just now' },
  { device: 'iPhone', browser: 'Safari', ip: '10.0.0.5', last: '2h ago' },
];

export default function SessionsModal({ onClose }) {
  return (
    <EditModal title="Active sessions & devices" onClose={onClose} onSave={() => { alert('Signed out all (mock)'); onClose(); }}>
      <div className="space-y-3">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1">Device</th>
              <th className="text-left px-2 py-1">Browser</th>
              <th className="text-left px-2 py-1">IP</th>
              <th className="text-left px-2 py-1">Last Active</th>
              <th className="px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={i} className="border-t border-zinc-800">
                <td className="px-2 py-1">{s.device}</td>
                <td className="px-2 py-1">{s.browser}</td>
                <td className="px-2 py-1">{s.ip}</td>
                <td className="px-2 py-1">{s.last}</td>
                <td className="px-2 py-1 text-right"><button className="btn btn-xs" onClick={()=>alert('Signed out (mock)')}>Sign out</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end">
          <button className="btn" onClick={()=>{ alert('Signed out all (mock)'); onClose(); }}>Sign out all</button>
        </div>
      </div>
    </EditModal>
  );
}


