import { useState, useEffect } from 'react';

/**
 * Hook to manage collapsible panel state with localStorage persistence
 * @param {string} storageKey - Key for localStorage
 * @param {boolean} defaultExpanded - Default expanded state (default: true)
 * @returns {[boolean, () => void]} - [isExpanded, toggle]
 */
export function useCollapsiblePanel(storageKey, defaultExpanded = true) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setIsExpanded(stored === 'true');
      }
    }
  }, [storageKey]);

  // Save to localStorage when state changes
  const toggle = () => {
    setIsExpanded((prev) => {
      const newValue = !prev;
      if (storageKey) {
        localStorage.setItem(storageKey, String(newValue));
      }
      return newValue;
    });
  };

  return [isExpanded, toggle];
}

