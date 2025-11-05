import { useState, useEffect, useRef } from 'react';

export default function Tooltip({ children, content, delay = 500, visibleDuration = 5000, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Show tooltip after delay
    hoverTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setShowTooltip(true);
      
      // Hide after visibleDuration
      hideTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
        // Delay hiding the actual tooltip to allow fade out
        setTimeout(() => {
          setIsVisible(false);
        }, 200);
      }, visibleDuration);
    }, delay);
  };

  const handleMouseLeave = () => {
    // Clear any pending show timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Hide tooltip
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    setShowTooltip(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-describedby={isVisible ? tooltipId.current : undefined}
    >
      {children}
      {isVisible && (
        <span
          id={tooltipId.current}
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-xs bg-zinc-800 text-zinc-100 rounded border border-zinc-700 shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
            positionClasses[position]
          } ${showTooltip ? 'opacity-100' : 'opacity-0'}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}

