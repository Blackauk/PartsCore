import { Menu, Plus, Sun, Moon, Package, FileText, Truck } from 'lucide-react';
import SearchInput from './SearchInput.jsx';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu.jsx';
import { useTheme } from '../hooks/useTheme.js';

export default function Topbar({ onHamburger }) {
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const authStoreUser = useAuthStore((s) => s.currentUser);
  const { user: authUser } = useAuth();
  const currentUser = authUser || authStoreUser;
  const role = currentUser?.role || (authUser?.roles?.includes('admin') ? 'Admin' : 'Viewer');
  const setRole = useAuthStore((s) => s.setRole);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setNewMenuOpen(false);
      }
    }
    if (newMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [newMenuOpen]);

  const newActions = [
    { label: 'New Item', icon: Package, action: () => navigate('/inventory/new-item') },
    { label: 'New PO', icon: FileText, action: () => navigate('/procurement/new-po') },
    { label: 'Receive Delivery', icon: Truck, action: () => navigate('/deliveries/receive-delivery') },
  ];

  return (
    <header 
      className="sticky top-0 z-40 h-[56px] border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-80" 
      style={{
        '--header-h': '56px',
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-color)',
        opacity: 0.95
      }}
    >
      <div className="flex items-center gap-3 p-3 h-full">
        <button className="btn md:hidden" onClick={onHamburger} aria-label="Open sidebar">
          <Menu size={16} />
        </button>
        <SearchInput />
        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button className="btn" onClick={() => setNewMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={newMenuOpen}>
              <Plus size={16} />
              <span className="hidden sm:inline">New</span>
            </button>
            {newMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 card p-1 shadow-lg z-[70]">
                {newActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                      style={{
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => {
                        action.action();
                        setNewMenuOpen(false);
                      }}
                    >
                      <Icon size={16} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {currentUser && (
            <select
              className="hidden md:block input text-xs px-2 py-1"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              title="Switch Role (dev)"
            >
              {['Admin','Manager','Supervisor','Fitter','Viewer'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          <button
            id="theme-toggle-button"
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === 'light'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="btn"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          {currentUser && <UserMenu />}
        </div>
      </div>
    </header>
  );
}


