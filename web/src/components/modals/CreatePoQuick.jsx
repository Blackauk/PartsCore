import { useState, useRef, useEffect } from 'react';
import { toast } from '../../lib/toast.js';
import { useNavigate } from 'react-router-dom';
import ModalRoot from '../ModalRoot.jsx';

export default function CreatePoQuick({ open = false, onClose, part, site, triggerRef }) {
  const [qty, setQty] = useState(10);
  const [supplier, setSupplier] = useState('Metro Hydraulics');
  const navigate = useNavigate();
  const firstInputRef = useRef(null);

  // Focus management for accessibility
  useEffect(() => {
    if (open && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleClose = () => {
    onClose?.();
    // Return focus to trigger button for accessibility
    if (triggerRef?.current) {
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 100);
    }
  };

  const draftId = `PO-${Math.floor(9000 + Math.random()*900)}`;
  
  function submit() {
    toast(`Draft PO ${draftId} created (mock)`);
    handleClose();
    navigate(`/procurement/purchase-orders/draft/${draftId}`);
  }

  return (
    <ModalRoot open={open} onClose={handleClose} title="Create Purchase Order" maxWidth="max-w-md">
      <div className="space-y-4">
        {part && (
          <div className="text-sm">
            <span className="text-zinc-400">Part:</span>{' '}
            <span className="font-medium">{part}</span>
          </div>
        )}
        {site && (
          <div className="text-sm">
            <span className="text-zinc-400">Site:</span>{' '}
            <span className="font-medium">{site}</span>
          </div>
        )}
        <div>
          <label className="text-sm block mb-1">Quantity</label>
          <input 
            ref={firstInputRef}
            className="input w-full" 
            type="number" 
            value={qty} 
            onChange={(e)=>setQty(Number(e.target.value))} 
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Supplier</label>
          <input 
            className="input w-full" 
            value={supplier} 
            onChange={(e)=>setSupplier(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn" onClick={submit}>Create Draft PO</button>
        </div>
      </div>
    </ModalRoot>
  );
}


