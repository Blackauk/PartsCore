import EditModal from '../EditModal.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export default function QuickActionsModal({ open = true, onClose, onNav }) {
	if (!open) return null;
	const role = useAuthStore((s) => s.currentUser?.role);
	const navigate = useNavigate();
	const actions = [
		{ label: 'New PO', roles: ['Admin','Manager'], to: '/procurement' },
		{ label: 'Approve PO', roles: ['Admin','Manager'], to: '/procurement' },
		{ label: 'Receive Goods', roles: ['Admin','Manager','Supervisor','Fitter'], to: '/movements' },
		{ label: 'Export Report', roles: ['Admin','Manager','Supervisor','Viewer'], to: '/reports/exports' },
	];
	const visible = actions.filter(a => a.roles.includes(role));
	return (
		<EditModal title="Quick actions" onClose={onClose} onSave={onClose}>
			<div className="grid gap-2">
				{visible.map(a => (
					<button key={a.label} className="btn" onClick={()=>{ onNav ? onNav(a.to) : navigate(a.to); onClose?.(); }}>{a.label}</button>
				))}
			</div>
		</EditModal>
	);
}
