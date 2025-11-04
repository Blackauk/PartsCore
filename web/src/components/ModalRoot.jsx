import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ModalRoot({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  const contentRef = useRef(null);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      setTimeout(() => {
        const firstInput = contentRef.current?.querySelector('input, select, textarea, button:not([disabled])');
        firstInput?.focus();
      }, 100);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        ref={contentRef}
        className={`w-full ${maxWidth} bg-panel text-primary rounded-2xl border border-base shadow-2xl max-h-[90vh] overflow-y-auto`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="sticky top-0 bg-panel border-b border-base flex items-center justify-between px-5 py-4 z-10">
          <h2 id="modal-title" className="text-lg font-semibold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-elevated flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-secondary" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

