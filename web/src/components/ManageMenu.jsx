// Reusable dropdown menu component for item management actions
// Used in Inventory Master List and other tables

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../lib/paths.js';

export default function ManageMenu({ 
  item, 
  onEdit, 
  onPrintQr, 
  onViewDetails, 
  onAdjustStock, 
  onTransfer, 
  onViewHistory, 
  onSetMinMax, 
  onArchive,
  can = {
    edit: true,
    printQR: true,
    view: true,
    history: true,
    adjust: true,
    transfer: true,
    minmax: true,
    archive: true,
  },
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [clickDisabled, setClickDisabled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDoc);
      window.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDoc);
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [open]);

  // Debounce double-clicks
  function handleAction(action) {
    if (clickDisabled) return;
    setOpen(false);
    setClickDisabled(true);
    setTimeout(() => setClickDisabled(false), 300);
    action();
  }

  const handlers = {
    onEdit: onEdit || (() => {
      if (item?.sku) navigate(paths.itemEdit(item.sku));
    }),
    onPrintQr: onPrintQr || (() => {
      if (item?.sku) navigate(paths.labelsForSku(item.sku));
    }),
    onViewDetails: onViewDetails || (() => {
      if (item?.sku) navigate(paths.item(item.sku));
    }),
    onViewHistory: onViewHistory || (() => {
      if (item?.sku) navigate(paths.historyForSku(item.sku));
    }),
    onAdjustStock: onAdjustStock || (() => {
      if (item?.sku) navigate(paths.adjustForSku(item.sku));
    }),
    onTransfer: onTransfer || (() => {
      if (item?.sku) navigate(paths.transferForSku(item.sku));
    }),
    onSetMinMax: onSetMinMax || (() => {
      console.log('TODO: Set min/max for', item?.sku);
    }),
    onArchive: onArchive || (async () => {
      if (!item?.sku) return;
      const confirmed = window.confirm(`Archive / deactivate ${item.sku}? You can restore it later.`);
      if (confirmed) {
        console.log('TODO: Archive item', item.sku);
        // TODO: Call archive API
      }
    }),
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="px-2 py-1 rounded-lg border border-white/10 bg-neutral-800 hover:bg-white/10 text-sm text-white"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Manage item"
        title="Manage"
      >
        ⋯
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-[70] overflow-hidden"
          aria-label="Item actions menu"
        >
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.edit ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.edit && handleAction(handlers.onEdit)}
            disabled={!can.edit}
            aria-label={`Edit ${item?.sku || 'item'}`}
          >
            Edit
          </button>
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.printQR ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.printQR && handleAction(handlers.onPrintQr)}
            disabled={!can.printQR}
            aria-label={`Print QR for ${item?.sku || 'item'}`}
          >
            Print QR
          </button>
          <div className="h-px bg-zinc-800" />
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.view ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.view && handleAction(handlers.onViewDetails)}
            disabled={!can.view}
            aria-label={`View details for ${item?.sku || 'item'}`}
          >
            View details
          </button>
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.history ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.history && handleAction(handlers.onViewHistory)}
            disabled={!can.history}
            aria-label={`View history for ${item?.sku || 'item'}`}
          >
            View history
          </button>
          <div className="h-px bg-zinc-800" />
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.adjust ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.adjust && handleAction(handlers.onAdjustStock)}
            disabled={!can.adjust}
            aria-label={`Adjust stock for ${item?.sku || 'item'}`}
          >
            Adjust stock
          </button>
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.transfer ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.transfer && handleAction(handlers.onTransfer)}
            disabled={!can.transfer}
            aria-label={`Transfer/Move ${item?.sku || 'item'}`}
          >
            Transfer / Move
          </button>
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${
              !can.minmax ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.minmax && handleAction(handlers.onSetMinMax)}
            disabled={!can.minmax}
            aria-label={`Set min/max for ${item?.sku || 'item'}`}
          >
            Set min/max level
          </button>
          <div className="h-px bg-zinc-800" />
          <button 
            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors text-red-400 ${
              !can.archive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => can.archive && handleAction(handlers.onArchive)}
            disabled={!can.archive}
            aria-label={`Archive ${item?.sku || 'item'}`}
          >
            Archive / Deactivate
          </button>
        </div>
      )}
    </div>
  );
}

