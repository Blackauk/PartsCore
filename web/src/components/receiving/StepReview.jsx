// Step 3: Review & Submit - Show summary, options, and submit GRN

import { useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Mail, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import { validateGrn } from '../../lib/receiving.js';
import { receivingUsers } from '../../data/mockReceiving.js';
import { useAuthStore } from '../../store/authStore.js';

export default function StepReview({
  po,
  grn,
  onGrnChange,
  onSubmit,
  onSaveDraft,
  isLoading = false,
}) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [showChaseNote, setShowChaseNote] = useState(false);

  const validation = useMemo(() => validateGrn(grn), [grn]);

  // Categorize lines
  const categorized = useMemo(() => {
    const fullyReceived = [];
    const shortBackordered = [];
    const rejected = [];

    grn.lines.forEach((line) => {
      const ordered = line.qty || 0;
      // Note: In the receiving flow, line.qtyReceived is the CURRENT receiving quantity (not previously received)
      // Previously received is tracked in the PO line itself
      const prevReceived = (line.previouslyReceived || 0); // From PO
      const currentReceived = Number(line.qtyReceived || 0); // Current receiving in this GRN
      const remaining = line.qtyRemaining !== undefined 
        ? line.qtyRemaining 
        : Math.max(0, ordered - prevReceived);
      const rejectedQty = Number(line.qtyRejected || 0);

      if (rejectedQty > 0) {
        rejected.push({ ...line, rejectedQty });
      } else if (currentReceived >= remaining && remaining > 0) {
        fullyReceived.push(line);
      } else if (currentReceived < remaining && currentReceived > 0) {
        shortBackordered.push({ ...line, shortage: remaining - currentReceived });
      }
    });

    return { fullyReceived, shortBackordered, rejected };
  }, [grn.lines]);

  function handleSubmit() {
    if (!validation.valid) {
      return;
    }
    onSubmit(grn);
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Expected Date</label>
          <div className="text-white">{dayjs(po.expectedDate).format('DD MMM YYYY')}</div>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Date Received</label>
          <input
            type="date"
            className="input w-full"
            value={grn.date || dayjs().format('YYYY-MM-DD')}
            onChange={(e) => onGrnChange({ ...grn, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Received By</label>
          <select
            className="input w-full"
            value={grn.receivedBy || currentUser?.name || ''}
            onChange={(e) => onGrnChange({ ...grn, receivedBy: e.target.value })}
          >
            {receivingUsers.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">GRN Number</label>
          <div className="text-white font-mono">{grn.id || 'Will be generated on submit'}</div>
        </div>
      </div>

      {/* Variance Panels */}
      <div className="space-y-4">
        {/* Fully Received */}
        {categorized.fullyReceived.length > 0 && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="text-emerald-400" size={20} />
              <h3 className="font-medium text-emerald-400">
                Fully Received ({categorized.fullyReceived.length})
              </h3>
            </div>
            <div className="space-y-1 text-sm">
              {categorized.fullyReceived.map((line, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{line.partNo || line.sku}</span>
                  <span className="text-emerald-300">
                    {line.qtyReceived || 0} / {line.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Short/Backordered */}
        {categorized.shortBackordered.length > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-amber-400" size={20} />
              <h3 className="font-medium text-amber-400">
                Short/Backordered ({categorized.shortBackordered.length})
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              {categorized.shortBackordered.map((line, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{line.partNo || line.sku}</span>
                  <span className="text-amber-300">
                    Short: {line.shortage} (Received: {line.qtyReceived || 0} / Ordered: {line.qty})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected */}
        {categorized.rejected.length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="text-red-400" size={20} />
              <h3 className="font-medium text-red-400">
                Rejected ({categorized.rejected.length})
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              {categorized.rejected.map((line, idx) => (
                <div key={idx}>
                  <div className="flex justify-between">
                    <span>{line.partNo || line.sku}</span>
                    <span className="text-red-300">Qty: {line.rejectedQty}</span>
                  </div>
                  <div className="text-xs text-red-300/80 mt-1">
                    Reason: {line.rejectionReason || 'Not specified'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h3 className="font-medium text-sm mb-3">Options</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={grn.markAsBackorder !== false}
            onChange={(e) =>
              onGrnChange({ ...grn, markAsBackorder: e.target.checked })
            }
            className="rounded"
          />
          <span className="text-sm text-zinc-300">Mark short items as Backorder</span>
        </label>
        {grn.markAsBackorder && (
          <div className="ml-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={grn.createChaseTask || false}
                onChange={(e) => {
                  setShowChaseNote(e.target.checked);
                  onGrnChange({ ...grn, createChaseTask: e.target.checked });
                }}
                className="rounded"
              />
              <span className="text-sm text-zinc-300">
                Create Supplier Chase Task for shortages
              </span>
            </label>
            {showChaseNote && (
              <textarea
                className="input w-full mt-2 min-h-[60px]"
                placeholder="Chase note..."
                value={grn.chaseNote || ''}
                onChange={(e) => onGrnChange({ ...grn, chaseNote: e.target.value })}
              />
            )}
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={grn.emailSupplier !== false}
            onChange={(e) =>
              onGrnChange({ ...grn, emailSupplier: e.target.checked })
            }
            className="rounded"
          />
          <Mail size={16} className="text-zinc-400" />
          <span className="text-sm text-zinc-300">
            Email supplier with GRN summary
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={grn.postInventory !== false}
            onChange={(e) =>
              onGrnChange({ ...grn, postInventory: e.target.checked })
            }
            className="rounded"
          />
          <span className="text-sm text-zinc-300">Post inventory immediately</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={grn.printLabelsAfterSubmit || false}
            onChange={(e) =>
              onGrnChange({ ...grn, printLabelsAfterSubmit: e.target.checked })
            }
            className="rounded"
          />
          <FileText size={16} className="text-zinc-400" />
          <span className="text-sm text-zinc-300">
            Print labels after submit (any lines ticked in Step 1)
          </span>
        </label>
      </div>

      {/* Validation Errors */}
      {!validation.valid && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h3 className="font-medium text-red-400 mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
            {validation.errors.map((err, idx) => (
              <li key={idx}>
                Line {err.lineIndex + 1}: {err.errors.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          type="button"
          className="btn-secondary"
          onClick={onSaveDraft}
          disabled={isLoading}
        >
          Save as Draft
        </button>
        <button
          type="button"
          className="btn"
          onClick={handleSubmit}
          disabled={!validation.valid || isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit GRN'}
        </button>
      </div>
    </div>
  );
}

