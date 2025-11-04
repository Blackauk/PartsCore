import { Link, useLocation } from 'react-router-dom';
import { Menu, Home, Boxes, ShoppingCart, BarChart3, Settings, Printer, ChevronRight } from 'lucide-react';
import NavItem from './NavItem.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getSidebarNav } from '../config/nav.js';
import { useState } from 'react';

const iconMap = {
  Home,
  Boxes,
  ShoppingCart,
  BarChart3,
  Settings,
  Printer,
};

export default function Sidebar({ collapsed, setCollapsed, onNavigate }) {
  const location = useLocation();
  const { user, roles, permissions } = useAuth();
  const [expandedItems, setExpandedItems] = useState(new Set(['/inventory', '/procurement', '/manage']));
  
  const navItems = getSidebarNav({ roles, permissions });
  
  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleExpand = (path) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="h-full p-3">
      <div className="flex items-center justify-between mb-4">
        {collapsed ? (
          <div className="w-10 h-10 rounded-lg bg-[#F7931E] flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Core Stock" className="w-6 h-6" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Core Stock" className="h-8" />
          </div>
        )}
        {setCollapsed && (
          <button className="btn" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
            <Menu size={16} />
          </button>
        )}
      </div>
      <nav className="space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Boxes;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.has(item.path);
          const active = isActive(item.path);

          return (
            <div key={item.path}>
              <Link
                to={item.path}
                onClick={(e) => {
                  if (hasChildren && !collapsed) {
                    e.preventDefault();
                    toggleExpand(item.path);
                  } else {
                    onNavigate?.();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                {!collapsed && (
                  <>
                    <span className="text-sm flex-1">{item.label}</span>
                    {hasChildren && (
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    )}
                  </>
                )}
              </Link>
              {!collapsed && hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childActive = isActive(child.path);
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={onNavigate}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          childActive
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                        aria-current={childActive ? 'page' : undefined}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}


