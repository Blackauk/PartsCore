import { Link } from 'react-router-dom';

export default function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <Link to={item.to} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
      aria-current={active ? 'page' : undefined}
    >
      {Icon ? <Icon size={18} /> : null}
      {!collapsed && <span className="text-sm">{item.label}</span>}
    </Link>
  );
}


