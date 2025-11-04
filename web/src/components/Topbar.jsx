import { Menu, Plus, Sun, Moon, Package, FileText, Truck } from 'lucide-react';
import SearchInput from './SearchInput.jsx';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu.jsx';

export default function Topbar({ onHamburger }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const authStoreUser = useAuthStore((s) => s.currentUser);
  const { user: authUser } = useAuth();
  const currentUser = authUser || authStoreUser;
  const role = currentUser?.role || (authUser?.roles?.includes('admin') ? 'Admin' : 'Viewer');
  const setRole = useAuthStore((s) => s.setRole);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  const newActions = [
    { label: 'New Item', icon: Package, action: () => navigate('/inventory') },
    { label: 'New PO', icon: FileText, action: () => navigate('/procurement') },
    { label: 'Receive Delivery', icon: Truck, action: () => navigate('/movements') },
  ];

  return (
    <header className="sticky top-0 z-40 h-[56px] border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60" style={{'--header-h': '56px'}}>
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-800 rounded-lg transition-colors"
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
          <button className="btn" onClick={toggleTheme} aria-label="Toggle Theme" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {currentUser && <UserMenu />}
        </div>
      </div>
    </header>
  );
}


