import { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';

export default function DropdownMenu({ children, trigger }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      {trigger ? (
        <div onClick={() => setOpen(!open)}>
          {trigger}
        </div>
      ) : (
        <button
          className="btn btn-xs"
          onClick={() => setOpen(!open)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Actions"
        >
          <MoreVertical size={16} />
        </button>
      )}
      {open && (
        <div 
          className="absolute right-0 mt-1 w-48 rounded-lg bg-zinc-900 border border-zinc-800 shadow-lg z-50 py-1"
          role="menu"
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, disabled, icon: Icon }) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-zinc-800 cursor-pointer'
      }`}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

