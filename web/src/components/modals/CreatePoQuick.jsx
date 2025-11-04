import EditModal from '../EditModal.jsx';
import { useState } from 'react';
import { toast } from '../../lib/toast.js';
import { useNavigate } from 'react-router-dom';

export default function CreatePoQuick({ open = false, onClose, part, site }) {
  const [qty, setQty] = useState(10);
  const [supplier, setSupplier] = useState('Metro Hydraulics');
  const navigate = useNavigate();
  if (!open) return null;
  const draftId = `PO-${Math.floor(9000 + Math.random()*900)}`;
  function submit() {
    toast(`Draft PO ${draftId} created (mock)`);
    onClose?.();
    navigate(`/procurement/purchase-orders/draft/${draftId}`);
  }
  return (
    <EditModal open title="Create Purchase Order" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm">Part: <span className="font-medium">{part}</span></div>
        <div className="text-sm">Site: <span className="font-medium">{site}</span></div>
        <div>
          <label className="text-sm">Quantity</label>
          <input className="input w-40" type="number" value={qty} onChange={(e)=>setQty(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm">Supplier</label>
          <input className="input w-64" value={supplier} onChange={(e)=>setSupplier(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={submit}>Create Draft PO</button>
        </div>
      </div>
    </EditModal>
  );
}


