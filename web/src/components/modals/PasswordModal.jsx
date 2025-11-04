import { useState } from 'react';
import EditModal from '../EditModal.jsx';

export default function PasswordModal({ onClose }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const strength = next.length >= 12 ? 'Strong' : next.length >= 8 ? 'Medium' : 'Weak';

  return (
    <EditModal title="Change Password" onClose={onClose} onSave={() => {
      if (next !== confirm) { alert('Passwords do not match'); return; }
      if (!current) { alert('Enter current password (mock)'); return; }
      alert('Password updated (mock).');
      onClose();
    }}>
      <div className="space-y-3">
        <div>
          <label className="text-sm">Current password</label>
          <input type="password" className="input" value={current} onChange={(e)=>setCurrent(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">New password</label>
          <input type="password" className="input" value={next} onChange={(e)=>setNext(e.target.value)} />
          <div className="text-xs text-zinc-500 mt-1">Strength: {strength}</div>
        </div>
        <div>
          <label className="text-sm">Confirm new password</label>
          <input type="password" className="input" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </div>
      </div>
    </EditModal>
  );
}


