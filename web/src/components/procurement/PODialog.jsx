import { useMemo } from 'react';
import ModalRoot from '../ModalRoot.jsx';
import TableMini from '../TableMini.jsx';
import DocTag from '../DocTag.jsx';
import { formatCurrency } from '../../lib/currency.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { getPoById } from '../../data/mockReceiving.js';
import { purchaseOrders } from '../../data/mockProcurement.js';

export default function PODialog({ open, onClose, poId, mode = 'view' }) {
  const { settings } = useSettings();
  
  // Get PO data from either source
  const po = useMemo(() => {
    if (!poId) return null;
    let data = getPoById(poId);
    if (!data) {
      data = purchaseOrders.find(p => p.id === poId);
    }
    return data;
  }, [poId]);

  if (!open) return null;
  
  if (!po) {
    return (
      <ModalRoot open={open} onClose={onClose} title="Purchase Order Not Found" maxWidth="max-w-md">
        <div className="text-center py-4">
          <p className="text-sm text-zinc-400">Purchase order {poId} could not be found.</p>
          <button className="btn mt-4" onClick={onClose}>Close</button>
        </div>
      </ModalRoot>
    );
  }

  const isReadOnly = mode === 'view';

  const lineColumns = [
    { key: 'lineNo', label: 'Line' },
    { key: 'partNo', label: 'Part No.' },
    { key: 'description', label: 'Description' },
    { key: 'qty', label: 'Qty' },
    { key: 'qtyReceived', label: 'Received' },
    { key: 'qtyRemaining', label: 'Outstanding', render: (r) => r.qtyRemaining || (r.qty - (r.qtyReceived || 0)) },
    { key: 'unitPrice', label: 'Unit Price', render: (r) => r.unitPrice ? formatCurrency(r.unitPrice, settings.currency) : '-' },
    { key: 'lineTotal', label: 'Total', render: (r) => r.lineTotal ? formatCurrency(r.lineTotal, settings.currency) : '-' },
  ];

  const lines = po.lines || [];

  return (
    <ModalRoot 
      open={open} 
      onClose={onClose} 
      title={`${isReadOnly ? 'View' : 'Edit'} Purchase Order: ${po.id}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* PO Header Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-400">PO Number:</span>
            <div className="font-medium">{po.id}</div>
          </div>
          <div>
            <span className="text-zinc-400">Status:</span>
            <div className="font-medium">{po.status}</div>
          </div>
          <div>
            <span className="text-zinc-400">Supplier:</span>
            <div className="font-medium">{po.supplier}</div>
          </div>
          <div>
            <span className="text-zinc-400">Site:</span>
            <div className="font-medium">{po.site}</div>
          </div>
          <div>
            <span className="text-zinc-400">Order Date:</span>
            <div className="font-medium">{po.orderDate}</div>
          </div>
          <div>
            <span className="text-zinc-400">Expected Date:</span>
            <div className="font-medium">{po.expectedDate}</div>
          </div>
          {po.docs && po.docs.length > 0 && (
            <div className="col-span-2">
              <span className="text-zinc-400">Documents:</span>
              <div className="flex gap-2 mt-1">
                {po.docs.map((d) => <DocTag key={d.id} tag={d.tag} />)}
              </div>
            </div>
          )}
        </div>

        {/* PO Lines */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Line Items</h3>
          {lines.length > 0 ? (
            <TableMini columns={lineColumns} rows={lines} />
          ) : (
            <p className="text-sm text-zinc-400">No line items</p>
          )}
        </div>

        {/* Total */}
        {po.value && (
          <div className="flex justify-end text-sm">
            <div>
              <span className="text-zinc-400">Total Value: </span>
              <span className="font-semibold text-lg">
                {formatCurrency(po.value, settings.currency)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          {isReadOnly ? (
            <button className="btn" onClick={onClose}>Close</button>
          ) : (
            <>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn" onClick={() => {
                // TODO: Implement save logic
                onClose();
              }}>Save Changes</button>
            </>
          )}
        </div>
      </div>
    </ModalRoot>
  );
}

