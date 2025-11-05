import { createContext, useContext, useState, useEffect, useRef } from 'react';

const PageControlsContext = createContext(null);

export function PageControlsProvider({ children }) {
  const [controls, setControls] = useState(null);

  return (
    <PageControlsContext.Provider value={{ controls, setControls }}>
      {children}
    </PageControlsContext.Provider>
  );
}

export function usePageControls(initialControls = null) {
  const { setControls } = useContext(PageControlsContext);
  const prevControlsRef = useRef(null);
  
  useEffect(() => {
    // Only update if controls actually changed (reference equality check)
    // This prevents infinite loops when JSX elements are recreated
    if (initialControls !== null && prevControlsRef.current !== initialControls) {
      prevControlsRef.current = initialControls;
      setControls?.(initialControls);
    }
    return () => {
      if (prevControlsRef.current === initialControls) {
        setControls?.(null);
        prevControlsRef.current = null;
      }
    };
  }, [setControls, initialControls]);

  return useContext(PageControlsContext);
}




