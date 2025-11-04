import { useEffect } from 'react';

const entries = [
	{ version: '1.4.0', date: '2025-10-20', notes: ['✨ Reports module', '🧩 Admin RBAC improvements'] },
	{ version: '1.3.0', date: '2025-09-12', notes: ['🐞 Fix white screen on procurement', '✨ CSV import/export'] },
];

export default function ChangelogDrawer({ open = true, onClose }) {
	useEffect(() => {
		function onKey(e){ if (e.key === 'Escape') onClose?.(); }
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [onClose]);
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<aside className="absolute right-0 top-0 h-full w-[420px] bg-zinc-900 border-l border-zinc-800 p-4 overflow-auto">
				<h2 className="text-lg font-semibold mb-2">What’s new</h2>
				<div className="space-y-4 text-sm">
					{entries.map(e => (
						<div key={e.version} className="rounded-lg border border-zinc-800 p-3">
							<div className="font-medium">v{e.version} <span className="text-xs text-zinc-500 ml-2">{e.date}</span></div>
							<ul className="list-disc pl-5 mt-2 space-y-1">
								{e.notes.map((n,i)=>(<li key={i}>{n}</li>))}
							</ul>
						</div>
					))}
				</div>
			</aside>
		</div>
	);
}
