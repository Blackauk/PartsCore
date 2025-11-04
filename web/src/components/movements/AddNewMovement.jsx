import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';

// Toast Container
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 left-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Toast Component
function Toast({ message, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[320px] max-w-md transition-all duration-200">
      <span className="text-sm text-zinc-100 flex-1">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 200);
        }}
        className="text-zinc-400 hover:text-zinc-100 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Add Movement Modal Component
function AddMovementModal({ open, onClose, onSave }) {
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const typeSelectRef = useRef(null);
  const modalRef = useRef(null);

  // Mock current user
  const currentUser = 'MJ';

  // Mock part data (in real app, this would come from API)
  const mockPartData = {
    'PART-001': { description: 'Hydraulic Filter H-045', unit: 'EA', availableQty: 150 },
    'PART-002': { description: 'Bearing Pad B-221', unit: 'EA', availableQty: 75 },
    'PART-003': { description: 'Seal Ring S-012', unit: 'EA', availableQty: 200 },
  };

  // Handle mount/unmount with animation
  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setType('');
      setFormData({});
      setErrors({});
      setSaveError('');
      setIsSaving(false);
    } else {
      // Set default date to today
      setFormData({ date: new Date().toISOString().split('T')[0] });
    }
  }, [open]);

  // Focus type select when modal opens
  useEffect(() => {
    if (open && isAnimating && typeSelectRef.current) {
      typeSelectRef.current.focus();
    }
  }, [open, isAnimating]);

  // Auto-fill description and unit when part number changes
  useEffect(() => {
    if (formData.partNo && mockPartData[formData.partNo]) {
      const part = mockPartData[formData.partNo];
      setFormData(prev => ({
        ...prev,
        description: part.description,
        unit: part.unit,
        availableQty: part.availableQty,
      }));
    }
  }, [formData.partNo]);

  // Handle ESC key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && open && isMounted) {
        onClose();
      }
    }
    if (isMounted) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, isMounted, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isMounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMounted]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!type) {
      newErrors.type = 'Type is required';
    }

    // Common required fields
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.partNo) {
      newErrors.partNo = 'Part No. is required';
    }

    // Type-specific validation
    if (type === 'Issued') {
      if (!formData.issuedTo) newErrors.issuedTo = 'Issued To is required';
      if (!formData.jobPlant) newErrors.jobPlant = 'Job/Plant is required';
      if (!formData.qty || formData.qty <= 0) {
        newErrors.qty = 'Quantity must be greater than 0';
      } else if (formData.availableQty !== undefined && formData.qty > formData.availableQty) {
        newErrors.qty = `Quantity cannot exceed available stock (${formData.availableQty})`;
      }
      if (!formData.status) newErrors.status = 'Status is required';
    } else if (type === 'Received') {
      if (!formData.receivedFrom) newErrors.receivedFrom = 'Received From is required';
      if (!formData.qtyReceived || formData.qtyReceived <= 0) {
        newErrors.qtyReceived = 'Quantity Received must be greater than 0';
      }
      if (!formData.status) newErrors.status = 'Status is required';
    } else if (type === 'Transferred') {
      if (!formData.fromLocation) newErrors.fromLocation = 'From Location is required';
      if (!formData.toLocation) newErrors.toLocation = 'To Location is required';
      if (!formData.qty || formData.qty <= 0) {
        newErrors.qty = 'Quantity must be greater than 0';
      }
      if (!formData.status) newErrors.status = 'Status is required';
    } else if (type === 'Adjust') {
      if (!formData.qtyChange || formData.qtyChange === 0) {
        newErrors.qtyChange = 'Qty Change must be non-zero';
      }
      if (!formData.reason) newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setSaveError('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const payload = {
        type,
        date: formData.date,
        ...formData,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      setSaveError(error.message || 'Failed to save movement');
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  const FieldWrapper = ({ label, required, children, error, colSpan = 1 }) => (
    <div className={`${colSpan === 2 ? 'col-span-2' : ''}`}>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          ref={modalRef}
          className={`bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto transform transition-all duration-200 ${
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between p-4 z-10">
            <h2 className="text-lg font-semibold text-white">Add Movement</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error banner */}
            {saveError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type dropdown */}
              <FieldWrapper label="Type" required error={errors.type} colSpan={2}>
                <select
                  ref={typeSelectRef}
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setFormData({ date: formData.date || new Date().toISOString().split('T')[0] });
                    setErrors({});
                  }}
                  className={`input w-full ${errors.type ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Issued">Issued</option>
                  <option value="Received">Received</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Adjust">Adjust</option>
                </select>
              </FieldWrapper>

              {/* Dynamic fields based on type */}
              {type === 'Issued' && (
                <>
                  <FieldWrapper label="Date" required error={errors.date}>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => updateField('date', e.target.value)}
                      className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Issued To" required error={errors.issuedTo}>
                    <input
                      type="text"
                      value={formData.issuedTo || ''}
                      onChange={(e) => updateField('issuedTo', e.target.value)}
                      className={`input w-full ${errors.issuedTo ? 'border-red-500' : ''}`}
                      placeholder="Enter name or select..."
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Job/Plant" required error={errors.jobPlant}>
                    <input
                      type="text"
                      value={formData.jobPlant || ''}
                      onChange={(e) => updateField('jobPlant', e.target.value)}
                      className={`input w-full ${errors.jobPlant ? 'border-red-500' : ''}`}
                      placeholder="Enter job or plant..."
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Part No." required error={errors.partNo}>
                    <input
                      type="text"
                      value={formData.partNo || ''}
                      onChange={(e) => updateField('partNo', e.target.value)}
                      className={`input w-full ${errors.partNo ? 'border-red-500' : ''}`}
                      placeholder="PART-001, PART-002, etc."
                      list="part-numbers"
                      required
                    />
                    <datalist id="part-numbers">
                      {Object.keys(mockPartData).map(p => <option key={p} value={p} />)}
                    </datalist>
                  </FieldWrapper>
                  <FieldWrapper label="Description">
                    <input
                      type="text"
                      value={formData.description || ''}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Qty" required error={errors.qty}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.qty || ''}
                      onChange={(e) => updateField('qty', parseInt(e.target.value) || '')}
                      className={`input w-full ${errors.qty ? 'border-red-500' : ''}`}
                      required
                    />
                    {formData.availableQty !== undefined && (
                      <p className="text-xs text-zinc-400 mt-1">Available: {formData.availableQty}</p>
                    )}
                  </FieldWrapper>
                  <FieldWrapper label="Unit">
                    <input
                      type="text"
                      value={formData.unit || ''}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Issued By">
                    <input
                      type="text"
                      value={currentUser}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Status" required error={errors.status}>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => updateField('status', e.target.value)}
                      className={`input w-full ${errors.status ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select status...</option>
                      <option value="Pending">Pending</option>
                      <option value="Issued">Issued</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="Work Order Ref (Optional)">
                    <input
                      type="text"
                      value={formData.workOrderRef || ''}
                      onChange={(e) => updateField('workOrderRef', e.target.value)}
                      className="input w-full"
                      placeholder="WO-####"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Remarks / Reason" colSpan={2}>
                    <textarea
                      value={formData.remarks || ''}
                      onChange={(e) => updateField('remarks', e.target.value)}
                      className="input w-full min-h-[80px]"
                      rows={3}
                      placeholder="Optional remarks..."
                    />
                  </FieldWrapper>
                </>
              )}

              {type === 'Received' && (
                <>
                  <FieldWrapper label="Date" required error={errors.date}>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => updateField('date', e.target.value)}
                      className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Received From" required error={errors.receivedFrom}>
                    <input
                      type="text"
                      value={formData.receivedFrom || ''}
                      onChange={(e) => updateField('receivedFrom', e.target.value)}
                      className={`input w-full ${errors.receivedFrom ? 'border-red-500' : ''}`}
                      placeholder="Supplier or source..."
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="PO Number">
                    <input
                      type="text"
                      value={formData.poNumber || ''}
                      onChange={(e) => updateField('poNumber', e.target.value)}
                      className="input w-full"
                      placeholder="PO-####"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Part No." required error={errors.partNo}>
                    <input
                      type="text"
                      value={formData.partNo || ''}
                      onChange={(e) => updateField('partNo', e.target.value)}
                      className={`input w-full ${errors.partNo ? 'border-red-500' : ''}`}
                      placeholder="PART-001, PART-002, etc."
                      list="part-numbers"
                      required
                    />
                    <datalist id="part-numbers">
                      {Object.keys(mockPartData).map(p => <option key={p} value={p} />)}
                    </datalist>
                  </FieldWrapper>
                  <FieldWrapper label="Description">
                    <input
                      type="text"
                      value={formData.description || ''}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Qty Received" required error={errors.qtyReceived}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.qtyReceived || ''}
                      onChange={(e) => updateField('qtyReceived', parseInt(e.target.value) || '')}
                      className={`input w-full ${errors.qtyReceived ? 'border-red-500' : ''}`}
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Unit">
                    <input
                      type="text"
                      value={formData.unit || ''}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Received By">
                    <input
                      type="text"
                      value={currentUser}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Status" required error={errors.status}>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => updateField('status', e.target.value)}
                      className={`input w-full ${errors.status ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select status...</option>
                      <option value="Pending Inspection">Pending Inspection</option>
                      <option value="Received">Received</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="Delivery Note / Ref">
                    <input
                      type="text"
                      value={formData.deliveryRef || ''}
                      onChange={(e) => updateField('deliveryRef', e.target.value)}
                      className="input w-full"
                      placeholder="Delivery note reference..."
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Condition / Comments" colSpan={2}>
                    <textarea
                      value={formData.comments || ''}
                      onChange={(e) => updateField('comments', e.target.value)}
                      className="input w-full min-h-[80px]"
                      rows={3}
                      placeholder="Optional comments..."
                    />
                  </FieldWrapper>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.autoAddToStock || false}
                        onChange={(e) => updateField('autoAddToStock', e.target.checked)}
                        className="rounded"
                      />
                      <span>Add to Stock Automatically</span>
                    </label>
                  </div>
                </>
              )}

              {type === 'Transferred' && (
                <>
                  <FieldWrapper label="Date" required error={errors.date}>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => updateField('date', e.target.value)}
                      className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="From Location" required error={errors.fromLocation}>
                    <select
                      value={formData.fromLocation || ''}
                      onChange={(e) => updateField('fromLocation', e.target.value)}
                      className={`input w-full ${errors.fromLocation ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select location...</option>
                      <option value="Atlas Road">Atlas Road</option>
                      <option value="VRCB">VRCB</option>
                      <option value="West Ruislip">West Ruislip</option>
                      <option value="Flat Iron">Flat Iron</option>
                      <option value="Atlas Yard">Atlas Yard</option>
                      <option value="Depot South">Depot South</option>
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="To Location" required error={errors.toLocation}>
                    <select
                      value={formData.toLocation || ''}
                      onChange={(e) => updateField('toLocation', e.target.value)}
                      className={`input w-full ${errors.toLocation ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select location...</option>
                      <option value="Atlas Road">Atlas Road</option>
                      <option value="VRCB">VRCB</option>
                      <option value="West Ruislip">West Ruislip</option>
                      <option value="Flat Iron">Flat Iron</option>
                      <option value="Atlas Yard">Atlas Yard</option>
                      <option value="Depot South">Depot South</option>
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="Part No." required error={errors.partNo}>
                    <input
                      type="text"
                      value={formData.partNo || ''}
                      onChange={(e) => updateField('partNo', e.target.value)}
                      className={`input w-full ${errors.partNo ? 'border-red-500' : ''}`}
                      placeholder="PART-001, PART-002, etc."
                      list="part-numbers"
                      required
                    />
                    <datalist id="part-numbers">
                      {Object.keys(mockPartData).map(p => <option key={p} value={p} />)}
                    </datalist>
                  </FieldWrapper>
                  <FieldWrapper label="Description">
                    <input
                      type="text"
                      value={formData.description || ''}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Qty" required error={errors.qty}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.qty || ''}
                      onChange={(e) => updateField('qty', parseInt(e.target.value) || '')}
                      className={`input w-full ${errors.qty ? 'border-red-500' : ''}`}
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Transfer By">
                    <input
                      type="text"
                      value={currentUser}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Received By">
                    <input
                      type="text"
                      value={formData.receivedBy || ''}
                      onChange={(e) => updateField('receivedBy', e.target.value)}
                      className="input w-full"
                      placeholder="Optional..."
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Status" required error={errors.status}>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => updateField('status', e.target.value)}
                      className={`input w-full ${errors.status ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select status...</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="Transfer Ref">
                    <input
                      type="text"
                      value={formData.transferRef || ''}
                      onChange={(e) => updateField('transferRef', e.target.value)}
                      className="input w-full"
                      placeholder="Optional transfer reference..."
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Remarks" colSpan={2}>
                    <textarea
                      value={formData.remarks || ''}
                      onChange={(e) => updateField('remarks', e.target.value)}
                      className="input w-full min-h-[80px]"
                      rows={3}
                      placeholder="Optional remarks..."
                    />
                  </FieldWrapper>
                </>
              )}

              {type === 'Adjust' && (
                <>
                  <FieldWrapper label="Date" required error={errors.date}>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => updateField('date', e.target.value)}
                      className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Part No." required error={errors.partNo}>
                    <input
                      type="text"
                      value={formData.partNo || ''}
                      onChange={(e) => updateField('partNo', e.target.value)}
                      className={`input w-full ${errors.partNo ? 'border-red-500' : ''}`}
                      placeholder="PART-001, PART-002, etc."
                      list="part-numbers"
                      required
                    />
                    <datalist id="part-numbers">
                      {Object.keys(mockPartData).map(p => <option key={p} value={p} />)}
                    </datalist>
                  </FieldWrapper>
                  <FieldWrapper label="Description">
                    <input
                      type="text"
                      value={formData.description || ''}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Qty Change" required error={errors.qtyChange}>
                    <input
                      type="number"
                      step="1"
                      value={formData.qtyChange || ''}
                      onChange={(e) => updateField('qtyChange', parseInt(e.target.value) || '')}
                      className={`input w-full ${errors.qtyChange ? 'border-red-500' : ''}`}
                      placeholder="Negative for decrease, positive for increase"
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Reason" required error={errors.reason}>
                    <select
                      value={formData.reason || ''}
                      onChange={(e) => updateField('reason', e.target.value)}
                      className={`input w-full ${errors.reason ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select reason...</option>
                      <option value="Stock take correction">Stock take correction</option>
                      <option value="Damage">Damage</option>
                      <option value="Loss">Loss</option>
                      <option value="Admin error">Admin error</option>
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="Adjusted By">
                    <input
                      type="text"
                      value={currentUser}
                      className="input w-full bg-zinc-800/50 cursor-not-allowed"
                      readOnly
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Remarks" colSpan={2}>
                    <textarea
                      value={formData.remarks || ''}
                      onChange={(e) => updateField('remarks', e.target.value)}
                      className="input w-full min-h-[80px]"
                      rows={3}
                      placeholder="Optional remarks..."
                    />
                  </FieldWrapper>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval || false}
                        onChange={(e) => updateField('requiresApproval', e.target.checked)}
                        className="rounded"
                      />
                      <span>Requires Manager Approval</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn flex-1"
                disabled={isSaving || !type}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}

// Main Button Component
export default function AddNewMovementButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Mock async save function
  const saveMovement = async (payload) => {
    // TODO: Wire to real API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: `MOV-${Date.now()}` });
      }, 600);
    });
  };

  const handleSave = async (payload) => {
    try {
      await saveMovement(payload);
      
      // Determine qty for toast message
      const qty = payload.qty || payload.qtyReceived || payload.qtyChange;
      const qtyLabel = payload.qty ? 'Qty' : payload.qtyReceived ? 'Qty Received' : 'Qty Change';
      const toastMessage = `Movement added: ${payload.type} – ${payload.partNo} (${qtyLabel}: ${qty})`;
      
      // Add toast
      const toastId = Date.now();
      setToasts(prev => [...prev, { id: toastId, message: toastMessage }]);
      
      setModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="btn flex items-center gap-2"
      >
        <Plus size={16} />
        <span>Add New</span>
      </button>

      <AddMovementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
