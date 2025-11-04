import { createContext, useContext, useState, useEffect } from 'react';

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
  
  useEffect(() => {
    if (initialControls !== null) {
      setControls?.(initialControls);
    }
    return () => {
      setControls?.(null);
    };
  }, [setControls, initialControls]);

  return useContext(PageControlsContext);
}




