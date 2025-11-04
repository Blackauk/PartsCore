import { useState } from 'react';
import EditModal from '../EditModal.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../lib/toast.js';

export default function TokensModal({ onClose }) {
	const tokens = useAuthStore((s) => s.tokens);
	const createToken = useAuthStore((s) => s.createToken);
	const revokeToken = useAuthStore((s) => s.revokeToken);
	const [label, setLabel] = useState('');
	return (
		<EditModal title="API Tokens" onClose={onClose} onSave={() => onClose()}>
			<div className="space-y-3">
				<div className="flex gap-2">
					<input className="input flex-1" placeholder="Label" value={label} onChange={(e)=>setLabel(e.target.value)} />
					<button className="btn" onClick={()=>{ if (!label) return; createToken(label); toast('Token created (mock)'); setLabel(''); }}>Create</button>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr>
							<th className="text-left px-2 py-1">Label</th>
							<th className="text-left px-2 py-1">Last 4</th>
							<th className="text-left px-2 py-1">Created</th>
							<th className="text-left px-2 py-1">Last used</th>
							<th className="px-2 py-1">Action</th>
						</tr>
					</thead>
					<tbody>
						{tokens.map(t => (
							<tr key={t.id} className="border-t border-zinc-800">
								<td className="px-2 py-1">{t.label}</td>
								<td className="px-2 py-1">{t.tokenLast4}</td>
								<td className="px-2 py-1">{t.createdAt}</td>
								<td className="px-2 py-1">{t.lastUsedAt}</td>
								<td className="px-2 py-1 text-right"><button className="btn btn-xs" onClick={()=>{ revokeToken(t.id); toast('Revoked (mock)'); }}>Revoke</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</EditModal>
	);
}
