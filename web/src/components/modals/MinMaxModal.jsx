import { useState, useEffect } from 'react';
import ModalRoot from '../ModalRoot.jsx';
import { toast } from '../../lib/toast.js';

export default function MinMaxModal({ open, onClose, item, onSave }) {
  const [formData, setFormData] = useState({
    minQty: 0,
    maxQty: 0,
    reorderPoint: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item && open) {
      // TODO: Load actual min/max data from item
      setFormData({
        minQty: item.minQty || 0,
        maxQty: item.maxQty || 0,
        reorderPoint: item.reorderPoint || 0,
      });
    }
  }, [item, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Mock save
    setTimeout(() => {
      setSaving(false);
      onSave?.(formData);
      toast('Min/Max levels updated', 'success');
    }, 500);
  };

  if (!open || !item) return null;

  return (
    <ModalRoot open={open} onClose={onClose} title={`Set Min/Max Levels – ${item.sku}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Minimum Quantity</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={formData.minQty}
            onChange={(e) => setFormData({ ...formData, minQty: parseInt(e.target.value) || 0 })}
            required
          />
          <p className="text-xs text-muted mt-1">Alert when stock falls below this level</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Maximum Quantity</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={formData.maxQty}
            onChange={(e) => setFormData({ ...formData, maxQty: parseInt(e.target.value) || 0 })}
            required
          />
          <p className="text-xs text-muted mt-1">Upper limit for stock level</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Reorder Point</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={formData.reorderPoint}
            onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
            required
          />
          <p className="text-xs text-muted mt-1">Automatically create PO when stock reaches this level</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-base">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            style={{
              backgroundColor: 'rgba(247, 147, 30, 0.2)',
              borderColor: 'rgba(247, 147, 30, 0.3)',
              color: 'var(--brand-orange)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(247, 147, 30, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(247, 147, 30, 0.2)';
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </ModalRoot>
  );
}

