// Updated: Clean tab bar with proper spacing, no overlap with filters
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function TabbedLayout({ tabs = [], rightControls = null }) {
  const location = useLocation();
  const tabListRef = useRef(null);
  
  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!tabListRef.current) return;
      const buttons = Array.from(tabListRef.current.querySelectorAll('button[role="tab"]'));
      const currentIndex = buttons.findIndex((b) => b === document.activeElement);
      
      if (currentIndex === -1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = buttons[currentIndex - 1] || buttons[buttons.length - 1];
        prev?.focus();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = buttons[currentIndex + 1] || buttons[0];
        next?.focus();
      }
    }
    
    const tabList = tabListRef.current;
    if (tabList) {
      tabList.addEventListener('keydown', handleKeyDown);
      return () => tabList.removeEventListener('keydown', handleKeyDown);
    }
  }, []);
  
  return (
    <>
      {/* Tab Bar - Sticky, flush under header, positioned absolutely to break out of padding */}
      <div className="sticky z-30 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 border-b border-zinc-800/60 -mx-4 md:-mx-6" style={{ top: '0' }}>
        <div className="flex items-center gap-2 flex-wrap px-4 md:px-6 py-2">
          <nav
            ref={tabListRef}
            role="tablist"
            aria-label="Inventory sections"
            className="flex gap-1 overflow-x-auto no-scrollbar flex-1 min-w-[220px]"
          >
            {tabs.map((tab) => {
              const to = tab.to;
              const isActive = location.pathname === to || (to !== tabs[0].to && location.pathname.startsWith(to + '/'));
              return (
                <NavLink
                  key={to}
                  to={to}
                  role="tab"
                  id={`tab-${to.replace(/\//g, '-')}`}
                  aria-controls={`panel-${to.replace(/\//g, '-')}`}
                  aria-selected={isActive}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                    isActive
                      ? 'text-white bg-zinc-800 border-b-2 border-indigo-500'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60 border-b-2 border-transparent'
                  }`}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
          {rightControls && (
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {rightControls}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="pt-2">
        <Outlet />
      </div>
    </>
  );
}

