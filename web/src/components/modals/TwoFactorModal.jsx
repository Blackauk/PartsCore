import { useMemo, useState } from 'react';
import EditModal from '../EditModal.jsx';
import { toast } from '../../lib/toast.js';

export default function TwoFactorModal({ onClose }) {
	const [enabled, setEnabled] = useState(false);
	const codes = useMemo(() => Array.from({ length: 6 }, () => Math.random().toString(36).slice(2,8).toUpperCase()), [enabled]);
	return (
		<EditModal title="Two-factor authentication" onClose={onClose} onSave={() => { toast('Two-factor settings saved (mock)'); onClose(); }}>
			<div className="space-y-3">
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} /> Enable 2FA</label>
				{enabled && (
					<div className="space-y-2">
						<div className="text-sm text-zinc-400">Scan this QR in your authenticator app (mock)</div>
						<div className="w-32 h-32 bg-zinc-800 rounded" />
						<div className="text-sm">Backup codes:</div>
						<ul className="grid grid-cols-2 gap-2 text-xs">
							{codes.map(c => <li key={c} className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700">{c}</li>)}
						</ul>
						<div className="flex gap-2">
							<button className="btn btn-xs" onClick={()=>toast('Codes copied (mock)')}>Copy codes</button>
							<button className="btn btn-xs" onClick={()=>toast('Codes regenerated (mock)')}>Regenerate</button>
						</div>
					</div>
				)}
			</div>
		</EditModal>
	);
}
