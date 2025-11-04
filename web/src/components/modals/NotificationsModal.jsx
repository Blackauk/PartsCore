import EditModal from '../EditModal.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../lib/toast.js';

export default function NotificationsModal({ open = true, onClose }) {
  if (!open) return null;
  const prefs = useAuthStore((s) => s.currentUser?.prefs);
  const setPrefs = useAuthStore((s) => s.setPrefs);
  if (!prefs) return null;
  const notify = prefs.notify || {};
  return (
    <EditModal title="Notifications" onClose={onClose} onSave={() => { toast('Preferences saved'); onClose?.(); }}>
      <div className="space-y-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!notify.lowStock} onChange={(e)=>setPrefs({ notify: { ...notify, lowStock: e.target.checked } })} /> Low stock alerts</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!notify.grn} onChange={(e)=>setPrefs({ notify: { ...notify, grn: e.target.checked } })} /> GRN received</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!notify.po} onChange={(e)=>setPrefs({ notify: { ...notify, po: e.target.checked } })} /> Purchase orders</label>
        <div>
          <button className="btn btn-xs" onClick={()=>toast('Notification test sent (mock)')}>Send test</button>
        </div>
      </div>
    </EditModal>
  );
}


