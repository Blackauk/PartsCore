import { useMemo, useState } from 'react';
import EditModal from '../EditModal.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { passwordStrength } from '../../lib/validators.js';
import { toast } from '../../lib/toast.js';

// Content component (for use in ModalRoot)
export function ProfileModalContent({ onClose }) {
  const user = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const twoFAEnabled = useAuthStore((s) => s._twoFAEnabled);
  const toggle2FA = useAuthStore((s) => s.toggle2FA);
  const sessions = useAuthStore((s) => s.sessions);
  const signOutSession = useAuthStore((s) => s.signOutSession);
  const revokeAllSessions = useAuthStore((s) => s.revokeAllSessions);

  const [tab, setTab] = useState('profile');
  const [firstName, setFirstName] = useState(user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.name.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const strength = useMemo(() => passwordStrength(next).label, [next]);

  function saveProfile() {
    updateProfile({ name: `${firstName} ${lastName}`.trim(), phone, title });
    toast('Profile updated');
  }

  function savePassword() {
    if (next !== confirm) { toast('Passwords do not match'); return; }
    if (!current) { toast('Enter current password'); return; }
    changePassword(current, next);
    toast('Password changed');
    setCurrent(''); setNext(''); setConfirm('');
  }

  return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-zinc-800">
          <button className={`px-3 py-2 text-sm ${tab==='profile'?'text-white border-b-2 border-zinc-200':'text-zinc-400'}`} onClick={()=>setTab('profile')}>Profile Info</button>
          <button className={`px-3 py-2 text-sm ${tab==='security'?'text-white border-b-2 border-zinc-200':'text-zinc-400'}`} onClick={()=>setTab('security')}>Security</button>
        </div>

        {tab === 'profile' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm">Avatar</label>
              <input type="file" className="input" />
            </div>
            <div>
              <label className="text-sm">Full name</label>
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="First" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                <input className="input" placeholder="Last" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm">Job title</label>
              <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Phone</label>
              <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input className="input" value={user.email} readOnly />
            </div>
            <div className="flex justify-end">
              <button className="btn" onClick={saveProfile}>Save changes</button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="font-medium">Change password</div>
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
              <div className="flex justify-end">
                <button className="btn" onClick={savePassword}>Save password</button>
              </div>
            </section>

            <section className="space-y-3">
              <div className="font-medium">Two-factor authentication</div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={twoFAEnabled} onChange={toggle2FA} /> Enable 2FA</label>
              {twoFAEnabled ? (
                <div className="space-y-2">
                  <div className="text-sm text-zinc-400">Scan this QR in your authenticator app (mock)</div>
                  <div className="w-32 h-32 bg-zinc-800 rounded" />
                  <div className="text-sm">Backup codes:</div>
                  <ul className="grid grid-cols-2 gap-2 text-xs">
                    {Array.from({length:6},(_,i)=>`CODE-${i+1}`).map(c => <li key={c} className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700">{c}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="text-sm text-zinc-400">Protect your account with a second step when signing in.</div>
              )}
            </section>

            <section className="space-y-3">
              <div className="font-medium">Active sessions & devices</div>
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
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-t border-zinc-800">
                      <td className="px-2 py-1">{s.device}</td>
                      <td className="px-2 py-1">{s.browser}</td>
                      <td className="px-2 py-1">{s.ip}</td>
                      <td className="px-2 py-1">{s.lastActive}</td>
                      <td className="px-2 py-1 text-right"><button className="btn btn-xs" onClick={()=>{ signOutSession(s.id); toast('Signed out (mock)'); }}>Sign out</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end">
                <button className="btn" onClick={()=>{ revokeAllSessions(); toast('Signed out all (mock)'); }}>Sign out all</button>
              </div>
            </section>
          </div>
        )}
      </div>
  );
}

// Full modal with EditModal wrapper (for backward compatibility)
export default function ProfileModal({ open = true, onClose }) {
  if (!open) return null;
  return (
    <EditModal title="Profile & Security" onClose={onClose} onSave={onClose}>
      <ProfileModalContent onClose={onClose} />
    </EditModal>
  );
}


