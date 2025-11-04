import EditModal from '../EditModal.jsx';

export default function ConfirmLogout({ open = true, onConfirm, onClose }) {
  if (!open) return null;
  return (
    <EditModal title="Log out?" onClose={onClose} onSave={() => { onConfirm?.(); onClose?.(); }}>
      <div className="space-y-4 text-sm">
        <p>Are you sure you want to log out of your account?</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={() => { onConfirm?.(); onClose?.(); }}>Confirm</button>
        </div>
      </div>
    </EditModal>
  );
}


