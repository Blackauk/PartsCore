import EditModal from '../EditModal.jsx';

export default function HelpModal({ open = true, onClose }) {
  if (!open) return null;
  return (
    <EditModal title="Help Center" onClose={onClose} onSave={onClose}>
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
    </EditModal>
  );
}


