import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { Suspense } from 'react';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div 
      className="min-h-screen grid" 
      style={{ 
        gridTemplateColumns: collapsed ? '72px 1fr' : '280px 1fr',
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      <aside 
        className="hidden md:block h-full border-r" 
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-panel)'
        }}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              onClick={() => setSidebarOpen(false)} 
            />
            <div 
              className="absolute inset-y-0 left-0 w-[80%] max-w-[320px] border-r focus:outline-none" 
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-color)'
              }}
              tabIndex={-1}
            >
              <Sidebar collapsed={false} setCollapsed={() => {}} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
      </div>

      <main className="h-full flex flex-col">
        <Topbar onHamburger={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto p-4 md:p-6 min-h-[calc(100vh-56px)]">
          <ErrorBoundary>
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}


