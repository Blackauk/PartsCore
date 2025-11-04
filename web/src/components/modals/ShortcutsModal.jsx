import EditModal from '../EditModal.jsx';

export default function ShortcutsModal({ open = true, onClose }) {
    if (!open) return null;
    return (
        <EditModal title="Keyboard shortcuts" onClose={onClose} onSave={onClose}>
			<table className="w-full text-sm">
				<tbody>
					<tr><td className="py-1">/</td><td className="py-1">Focus search</td></tr>
					<tr><td className="py-1">N</td><td className="py-1">New / Invite</td></tr>
					<tr><td className="py-1">E</td><td className="py-1">Export CSV</td></tr>
					<tr><td className="py-1">R</td><td className="py-1">Refresh</td></tr>
					<tr><td className="py-1">?</td><td className="py-1">Help</td></tr>
					<tr><td className="py-1">Esc</td><td className="py-1">Close</td></tr>
				</tbody>
			</table>
		</EditModal>
	);
}
