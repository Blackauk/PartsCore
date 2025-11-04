import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

/**
 * Split button with dropdown menu
 * Left side triggers primary action, right caret opens menu
 */
export default function SplitButton({ primaryAction, menuItems, disabled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [menuOpen]);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        className="btn rounded-r-none border-r-0"
        onClick={primaryAction.onClick}
        disabled={disabled}
        aria-label={primaryAction.label}
      >
        {primaryAction.icon && <primaryAction.icon size={16} />}
        <span>{primaryAction.label}</span>
      </button>
      <button
        type="button"
        className="btn rounded-l-none px-2 border-l border-base"
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={disabled}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="More options"
      >
        <ChevronDown size={16} className={menuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-48 card p-1 shadow-lg z-[70]"
          role="menu"
        >
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-primary hover:bg-elevated"
              onClick={() => {
                item.onClick();
                setMenuOpen(false);
              }}
              role="menuitem"
            >
              {item.icon && <item.icon size={16} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

