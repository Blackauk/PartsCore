// Main wizard component for receiving deliveries and creating GRNs

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import StepItems from './StepItems.jsx';
import StepDocuments from './StepDocuments.jsx';
import StepReview from './StepReview.jsx';
import StepLabels from './StepLabels.jsx';
import { generateGrnId, buildTransactions, updatePoBalances, validateGrn } from '../../lib/receiving.js';
import { getPoById } from '../../data/mockReceiving.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../lib/toast.js';

const STEPS = [
  { id: 1, label: 'Items', component: StepItems },
  { id: 2, label: 'Documents', component: StepDocuments },
  { id: 3, label: 'Review', component: StepReview },
  { id: 4, label: 'Labels', component: StepLabels },
];

export default function ReceiveDeliveryWizard({ open, onClose, poId, onSubmitted }) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [step, setStep] = useState(1);
  const [po, setPo] = useState(null);
  const [lines, setLines] = useState([]);
  const [documents, setDocuments] = useState({ files: [], deliveryNoteNo: '', carrier: '', trackingNo: '' });
  const [grn, setGrn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allowOverReceipt, setAllowOverReceipt] = useState(false);

  // Load PO data on mount
  useEffect(() => {
    if (!open || !poId) return;
    const poData = getPoById(poId);
    if (!poData) {
      toast('PO not found', 'error');
      onClose();
      return;
    }
    setPo(poData);
    
    // Initialize lines from PO
    const initialLines = poData.lines.map((line) => ({
      ...line,
      id: `line-${line.lineNo}`,
      previouslyReceived: line.qtyReceived || 0, // Store original PO received qty
      qtyReceived: 0, // Current receiving qty in this GRN (starts at 0)
      qtyRejected: 0,
      qtyRemaining: line.qtyRemaining !== undefined 
        ? line.qtyRemaining 
        : Math.max(0, line.qty - (line.qtyReceived || 0)),
      location: null,
      printLabel: false,
    }));
    setLines(initialLines);

    // Initialize GRN
    setGrn({
      id: generateGrnId(),
      poId: poData.id,
      supplierId: poData.supplierId,
      supplier: poData.supplier,
      supplierEmail: poData.supplierEmail,
      date: dayjs().format('YYYY-MM-DD'),
      site: poData.site,
      receivedBy: currentUser?.name || 'M. Jones',
      status: 'Draft',
      lines: initialLines,
      allowOverReceipt: false,
      markAsBackorder: true,
      createChaseTask: false,
      emailSupplier: true,
      postInventory: true,
      printLabelsAfterSubmit: false,
    });
  }, [open, poId, currentUser, toast, onClose]);

  const currentStepComponent = STEPS.find((s) => s.id === step)?.component;
  const canGoNext = useMemo(() => {
    if (step === 1) {
      const validation = validateGrn({ ...grn, lines });
      return validation.valid;
    }
    if (step === 3) {
      return grn && validateGrn(grn).valid;
    }
    return true;
  }, [step, lines, grn]);

  function handleNext() {
    if (step < STEPS.length) {
      setStep(step + 1);
    }
  }

  function handlePrev() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  async function handleSubmit(grnData) {
    setIsLoading(true);
    try {
      // Update GRN with latest lines
      const finalGrn = {
        ...grnData,
        lines: lines.map((l) => ({
          ...l,
          partNo: l.partNo || l.sku,
          description: l.description || l.name,
        })),
        documents: documents,
        status: 'Pending Inspection',
      };

      // Build transactions
      const transactions = buildTransactions(finalGrn, {
        postImmediately: finalGrn.postInventory,
      });

      // Update PO balances (mock - would be API call)
      const updatedPo = updatePoBalances(po, finalGrn);

      // Mock: Create chase task
      if (finalGrn.createChaseTask && finalGrn.chaseNote) {
        console.log('Chase task created:', finalGrn.chaseNote);
      }

      // Mock: Send email
      if (finalGrn.emailSupplier && finalGrn.supplierEmail) {
        console.log('Email sent to:', finalGrn.supplierEmail);
      }

      toast('GRN submitted successfully', 'success');

      // Navigate to labels step if enabled, otherwise close
      if (finalGrn.printLabelsAfterSubmit || lines.some((l) => l.printLabel)) {
        setStep(4);
      } else {
        handleSuccess(finalGrn.id);
      }
    } catch (error) {
      toast('Failed to submit GRN: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveDraft() {
    const draftGrn = {
      ...grn,
      lines: lines,
      documents: documents,
      status: 'Draft',
    };
    toast('GRN saved as draft', 'info');
    console.log('Draft GRN:', draftGrn);
    // Would save to API here
  }

  function handleSuccess(grnId) {
    if (onSubmitted) {
      onSubmitted(grnId);
    } else {
      navigate(`/procurement/deliveries/${grnId}`);
    }
    onClose();
  }

  function handleClose() {
    if (window.confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
      setStep(1);
      setLines([]);
      setDocuments({ files: [] });
      setGrn(null);
      onClose();
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSaveDraft();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (step === 3 && canGoNext) {
            handleSubmit(grn);
          } else if (step < 3) {
            handleNext();
          }
        }
      } else if (e.key === 'Escape') {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, step, canGoNext, grn]);

  if (!open || !po || !grn) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-6xl bg-neutral-900 text-white rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Receive Delivery</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
              <span>
                <strong className="text-white">Supplier:</strong> {po.supplier}
              </span>
              <span>
                <strong className="text-white">Site:</strong> {po.site}
              </span>
              <span>
                <strong className="text-white">Expected:</strong>{' '}
                {dayjs(po.expectedDate).format('DD MMM YYYY')}
              </span>
              <span>
                <strong className="text-white">Status:</strong> {po.status}
              </span>
              <a
                href={`/procurement/purchase-orders/${po.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <FileText size={14} />
                View PO
              </a>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-2 ${
                    step === s.id
                      ? 'text-white'
                      : step > s.id
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step === s.id
                        ? 'border-white bg-white text-neutral-900'
                        : step > s.id
                        ? 'border-emerald-400 bg-emerald-400 text-white'
                        : 'border-zinc-600 bg-transparent'
                    }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      step > s.id ? 'bg-emerald-400' : 'bg-zinc-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <StepItems
              po={po}
              lines={lines}
              onChange={setLines}
              allowOverReceipt={allowOverReceipt}
            />
          )}
          {step === 2 && (
            <StepDocuments documents={documents} onChange={setDocuments} />
          )}
          {step === 3 && (
            <StepReview
              po={po}
              grn={{ ...grn, lines }}
              onGrnChange={(updated) => {
                setGrn(updated);
                setAllowOverReceipt(updated.allowOverReceipt || false);
              }}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading}
            />
          )}
          {step === 4 && (
            <StepLabels
              lines={lines.filter((l) => Number(l.qtyReceived || 0) > 0)}
              grnId={grn.id}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-zinc-900/50">
          <div className="text-xs text-zinc-500">
            {step === 3 && 'Ctrl+Enter to submit • '}
            Ctrl+S to save draft • Esc to close
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrev}
                disabled={isLoading}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
            )}
            {step < STEPS.length ? (
              <button
                type="button"
                className="btn"
                onClick={handleNext}
                disabled={!canGoNext || isLoading}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => handleSuccess(grn.id)}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

