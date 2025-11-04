import { useEffect } from 'react';

export default function HelpCenterDrawer({ open = true, onClose }) {
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
				<h2 className="text-lg font-semibold mb-2">Help Center</h2>
				<div className="space-y-4 text-sm">
					<section>
						<h3 className="font-medium">Getting Started</h3>
						<p>Use the sidebar to navigate modules. Search at the top to find items.</p>
					</section>
					<section>
						<h3 className="font-medium">FAQs</h3>
						<ul className="list-disc pl-5 space-y-1">
							<li>How to receive stock? Go to Movements → Receive.</li>
							<li>How to create a PO? Go to Procurement → Purchase Orders.</li>
						</ul>
					</section>
					<section>
						<h3 className="font-medium">Contact</h3>
						<a className="text-indigo-400" href="mailto:support@example.com">support@example.com</a>
					</section>
				</div>
			</aside>
		</div>
	);
}
