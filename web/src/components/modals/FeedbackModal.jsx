import { useState } from 'react';
import EditModal from '../EditModal.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../lib/toast.js';

export default function FeedbackModal({ open = true, onClose }) {
	if (!open) return null;
	const user = useAuthStore((s) => s.currentUser);
  const [category, setCategory] = useState('bug');
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [file, setFile] = useState(null);
	const [diag, setDiag] = useState(true);
	return (
		<EditModal title="Send feedback" onClose={onClose} onSave={() => {
			const payload = { category, subject, message, file: file?.name, diag: diag ? { role: user?.role, site: user?.activeSite, version: '1.4.0' } : undefined };
			console.log('feedback', payload);
			toast('Thanks for your feedback!');
			onClose();
		}}>
			<div className="space-y-3">
        <div>
          <label className="text-sm">Category</label>
          <select className="input" value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option value="bug">Bug</option>
            <option value="feature">Feature Request</option>
            <option value="ui">UI Issue</option>
            <option value="data">Data Issue</option>
            <option value="other">Other</option>
          </select>
        </div>
				<div>
					<label className="text-sm">Subject</label>
					<input className="input" value={subject} onChange={(e)=>setSubject(e.target.value)} />
				</div>
				<div>
					<label className="text-sm">Message</label>
					<textarea className="input min-h-[120px]" value={message} onChange={(e)=>setMessage(e.target.value)} />
				</div>
				<div>
					<label className="text-sm">Screenshot / file (optional)</label>
					<input type="file" className="input" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
				</div>
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={diag} onChange={(e)=>setDiag(e.target.checked)} /> Include diagnostics</label>
			</div>
		</EditModal>
	);
}
