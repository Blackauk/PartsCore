import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Package, Boxes, ScanLine, History, ShoppingCart, FileText, Users, Building2, FileDown, BarChart3, Home } from 'lucide-react';

const nav = [
  { label: 'Dashboard', icon: Home, to: '/' },
  {
    label: 'Catalogue',
    children: [
      { label: 'All Parts', to: '/catalogue/all-parts' },
      { label: 'New Part', to: '/catalogue/new-part' },
    ],
    icon: Package,
  },
  {
    label: 'Stock',
    children: [
      { label: 'Live View', to: '/stock/live' },
      { label: 'Low Stock', to: '/stock/low' },
    ],
    icon: Boxes,
  },
  {
    label: 'Transactions',
    children: [
      { label: 'Book In', to: '/tx/book-in' },
      { label: 'Book Out', to: '/tx/book-out' },
      { label: 'History', to: '/tx/history', icon: History },
      { label: 'Scanning', to: '/tx/scanning', icon: ScanLine },
    ],
    icon: History,
  },
  {
    label: 'Orders',
    children: [
      { label: 'Requisitions', to: '/orders/requisitions' },
      { label: 'Purchase Orders', to: '/orders/purchase-orders' },
    ],
    icon: ShoppingCart,
  },
  { label: 'Suppliers', icon: FileText, to: '/suppliers' },
  {
    label: 'Analytics',
    children: [
      { label: 'Usage by Asset', to: '/analytics/usage-by-asset' },
      { label: 'Usage by Site', to: '/analytics/usage-by-site' },
    ],
    icon: BarChart3,
  },
  {
    label: 'Admin',
    children: [
      { label: 'Users & Roles', to: '/admin/users-roles', icon: Users },
      { label: 'Sites & Locations', to: '/admin/sites-locations', icon: Building2 },
      { label: 'Reason Codes', to: '/admin/reason-codes', icon: FileText },
      { label: 'Import/Export', to: '/admin/import-export', icon: FileDown },
    ],
    icon: Users,
  },
];

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const isActive = (to) => location.pathname === to;
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 flex items-center gap-2" onClick={() => setOpen((v) => !v)}>
          {item.icon ? <item.icon size={18} /> : null}
          {!collapsed && <span>{item.label}</span>}
        </button>
        {open && (
          <div className="mt-1 ml-2 space-y-1">
            {item.children.map((c) => (
              <Link key={c.to} to={c.to} className={`block px-3 py-2 rounded-lg hover:bg-zinc-800 text-sm ${isActive(c.to) ? 'bg-zinc-800' : ''}`}>
                {c.icon ? <c.icon size={16} className="mr-2 inline" /> : null}
                {!collapsed && c.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={item.to} className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 ${isActive(item.to) ? 'bg-zinc-800' : ''}`}>
      {item.icon ? <item.icon size={18} /> : null}
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function SparePartsLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-full grid" style={{ gridTemplateColumns: collapsed ? '64px 1fr' : '260px 1fr' }}>
      <aside className="h-full border-r border-zinc-800 p-3">
        <div className="flex items-center justify-between mb-3">
          {collapsed ? (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-orange)' }}>
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="CoreStock" className="w-6 h-6" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="CoreStock" className="h-8" />
            </div>
          )}
          <button className="btn" onClick={() => setCollapsed((v) => !v)}>
            <Menu size={16} />
          </button>
        </div>
        <nav className="space-y-2">
          {nav.map((n) => (
            <NavItem key={n.label} item={n} collapsed={collapsed} />
          ))}
        </nav>
      </aside>
      <main className="h-full flex flex-col">
        <header className="border-b border-zinc-800 p-3 flex items-center justify-between">
          <div className="text-sm text-zinc-300">Welcome, MJ — Atlas Road</div>
        </header>
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
}


