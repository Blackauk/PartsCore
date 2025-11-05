import { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from '../../lib/toast.js';
import { useNavigate } from 'react-router-dom';
import ModalRoot from '../ModalRoot.jsx';
import TableMini from '../TableMini.jsx';

export default function CreatePoQuick({ open = false, onClose, part, site, triggerRef, prefilledLines }) {
  const [qty, setQty] = useState(10);
  const [supplier, setSupplier] = useState('Metro Hydraulics');
  const navigate = useNavigate();
  const firstInputRef = useRef(null);

  // If prefilled lines exist, extract supplier and set default qty
  useEffect(() => {
    if (prefilledLines && prefilledLines.length > 0) {
      // Use supplier from first line if available
      const firstSupplier = prefilledLines[0]?.supplier || prefilledLines[0]?.supplierId;
      if (firstSupplier) {
        setSupplier(firstSupplier);
      }
    }
  }, [prefilledLines]);

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
  
  // Format prefilled lines for display
  const lineColumns = [
    { key: 'part', label: 'Part' },
    { key: 'name', label: 'Description' },
    { key: 'qty', label: 'Qty' },
  ];

  const formattedLines = useMemo(() => {
    if (!prefilledLines) return [];
    return prefilledLines.map((line, idx) => ({
      part: line.part || line.sku,
      name: line.name || line.description || `Item ${line.part || line.sku}`,
      qty: line.qty || line.suggestQty || 1,
    }));
  }, [prefilledLines]);
  
  function submit() {
    const lineCount = prefilledLines?.length || (part ? 1 : 0);
    toast(`Draft PO ${draftId} created with ${lineCount} line${lineCount !== 1 ? 's' : ''} (mock)`);
    handleClose();
    navigate(`/procurement/purchase-orders/draft/${draftId}`);
  }

  const hasPrefilledLines = prefilledLines && prefilledLines.length > 0;

  return (
    <ModalRoot open={open} onClose={handleClose} title="Create Purchase Order" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {hasPrefilledLines ? (
          <>
            <div className="text-sm text-zinc-400">
              {prefilledLines.length} line{prefilledLines.length !== 1 ? 's' : ''} from Reorder Assistance
            </div>
            <div>
              <label className="text-sm block mb-1">Supplier</label>
              <input 
                ref={firstInputRef}
                className="input w-full" 
                value={supplier} 
                onChange={(e)=>setSupplier(e.target.value)} 
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Line Items</h3>
              <TableMini columns={lineColumns} rows={formattedLines} />
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn" onClick={submit}>Create Draft PO</button>
        </div>
      </div>
    </ModalRoot>
  );
}


