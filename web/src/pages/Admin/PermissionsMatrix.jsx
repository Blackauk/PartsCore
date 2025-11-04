import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Package, ClipboardCheck, MapPin, ShoppingCart, Truck, FileText, 
  UserCog, Settings, Printer, Search, ChevronDown, ChevronRight, 
  Info, Check, X, Download, Eye, ChevronsDown, ChevronsUp
} from 'lucide-react';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSIONS } from '../../data/permissions.js';
import { useAuthStore } from '../../store/authStore.js';
import Guard from '../../components/Guard.jsx';
import { useApp } from '../../context/AppContext.jsx';

// Icon mapping
const ICONS = {
  Package,
  ClipboardCheck,
  MapPin,
  ShoppingCart,
  Truck,
  FileText,
  UserCog,
  Settings,
  Printer,
};

// Store permissions in localStorage for persistence
function loadRolePermissions() {
  try {
    const stored = localStorage.getItem('role-permissions');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load permissions', e);
  }
  return DEFAULT_ROLE_PERMISSIONS;
}

function saveRolePermissions(permissions) {
  try {
    localStorage.setItem('role-permissions', JSON.stringify(permissions));
  } catch (e) {
    console.error('Failed to save permissions', e);
  }
}

export default function PermissionsMatrix() {
  const { toast } = useApp();
  const role = useAuthStore((s) => s.currentUser.role);
  const can = useAuthStore((s) => s.can);
  const isAdmin = can('ADMIN_ROLE');

  const [rolePermissions, setRolePermissions] = useState(() => loadRolePermissions());
  const groupIds = useMemo(() => Object.keys(PERMISSIONS), []);
  
  // Track expand state with proper initialization
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // All groups expanded by default
    return groupIds.reduce((acc, key) => ({ ...acc, [key]: true }), {});
  });
  
  // Remember state before search to restore later
  const openMapBeforeSearch = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const roles = ['Admin', 'Manager', 'Supervisor', 'Fitter', 'Viewer'];
  
  // Toast deduplication
  const lastToast = useRef(null);
  const showToast = (message, type = 'success') => {
    const now = Date.now();
    const id = message;
    // Dedupe: same message within 600ms = ignore
    if (lastToast.current && lastToast.current.id === id && now - lastToast.current.ts < 600) {
      return;
    }
    lastToast.current = { id, ts: now };
    toast(message, type);
  };

  // Calculate permission counts per role
  const roleSummary = useMemo(() => {
    return roles.map(r => {
      const count = rolePermissions[r]?.length || 0;
      const total = ALL_PERMISSIONS.length;
      const percentage = Math.round((count / total) * 100);
      return { role: r, count, total, percentage };
    });
  }, [rolePermissions]);

  // Normalize search query
  const normalize = (s) => s.toLowerCase().trim();
  
  // Calculate which groups match the search
  const matchingGroups = useMemo(() => {
    if (!searchQuery) return null;
    const nq = normalize(searchQuery);
    const result = {};
    Object.keys(PERMISSIONS).forEach((gid) => {
      const category = PERMISSIONS[gid];
      result[gid] = category.permissions.some(
        p =>
          normalize(p.key).includes(nq) ||
          normalize(p.label).includes(nq) ||
          normalize(p.description).includes(nq)
      );
    });
    return result;
  }, [searchQuery]);

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return PERMISSIONS;
    const filtered = {};
    const query = searchQuery.toLowerCase();

    Object.entries(PERMISSIONS).forEach(([key, category]) => {
      const matchingPerms = category.permissions.filter(p => 
        p.key.toLowerCase().includes(query) ||
        p.label.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );

      if (matchingPerms.length > 0) {
        filtered[key] = {
          ...category,
          permissions: matchingPerms,
        };
      }
    });

    return filtered;
  }, [searchQuery]);

  const permissionsToDisplay = searchQuery ? filteredPermissions : PERMISSIONS;

  // Auto-expand/collapse groups based on search
  useEffect(() => {
    if (searchQuery && matchingGroups) {
      // Save current state if not already saved
      if (!openMapBeforeSearch.current) {
        openMapBeforeSearch.current = { ...expandedGroups };
      }
      // Open only matching groups
      const next = Object.fromEntries(
        Object.keys(PERMISSIONS).map((gid) => [gid, !!matchingGroups[gid]])
      );
      setExpandedGroups(next);
    } else if (!searchQuery && openMapBeforeSearch.current) {
      // Restore previous state when search cleared
      setExpandedGroups(openMapBeforeSearch.current);
      openMapBeforeSearch.current = null;
    }
  }, [searchQuery, matchingGroups]);

  // Expand/Collapse all functions
  const expandAll = () => {
    setExpandedGroups(groupIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
  };

  const collapseAll = () => {
    setExpandedGroups(groupIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}));
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === '/' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search permissions"]');
        searchInput?.focus();
      } else if (e.key === '*' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        expandAll();
      } else if (e.key === '-' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        collapseAll();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [groupIds]); // expandAll and collapseAll use groupIds which is stable

  const togglePermission = (roleName, permissionKey, checked) => {
    if (!isAdmin) return;

    setRolePermissions(prev => {
      const rolePerms = prev[roleName] || [];
      const hasPermission = rolePerms.includes(permissionKey);
      
      // Only update if state is actually changing
      if (hasPermission === checked) return prev;
      
      const updated = {
        ...prev,
        [roleName]: hasPermission
          ? rolePerms.filter(p => p !== permissionKey)
          : [...rolePerms, permissionKey],
      };

      saveRolePermissions(updated);
      showToast(`Permission ${hasPermission ? 'removed' : 'granted'} for ${roleName}`);
      return updated;
    });
  };

  const toggleGroupForRole = (roleName, categoryId) => {
    if (!isAdmin) return;

    const category = PERMISSIONS[categoryId];
    if (!category) return;

    const categoryPerms = category.permissions.map(p => p.key);
    const rolePerms = rolePermissions[roleName] || [];
    const hasAll = categoryPerms.every(p => rolePerms.includes(p));

    setRolePermissions(prev => {
      const currentPerms = prev[roleName] || [];
      const updated = {
        ...prev,
        [roleName]: hasAll
          ? currentPerms.filter(p => !categoryPerms.includes(p))
          : [...new Set([...currentPerms, ...categoryPerms])],
      };

      saveRolePermissions(updated);
      showToast(`${hasAll ? 'Removed' : 'Granted'} all ${category.label} permissions for ${roleName}`);
      return updated;
    });
  };

  const hasPermission = (roleName, permissionKey) => {
    return rolePermissions[roleName]?.includes(permissionKey) || false;
  };

  const hasAllInGroup = (roleName, categoryId) => {
    const category = PERMISSIONS[categoryId];
    if (!category) return false;
    const rolePerms = rolePermissions[roleName] || [];
    return category.permissions.every(p => rolePerms.includes(p.key));
  };

  const exportRoleConfig = () => {
    const json = JSON.stringify(rolePermissions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-permissions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Role configuration exported', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Permissions Matrix</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage role-based access control</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-zinc-400">
            Current Role: <span className="font-medium text-zinc-200">{role}</span>
          </div>
          {isAdmin && (
            <button onClick={exportRoleConfig} className="btn-secondary" title="Export role configuration">
              <Download size={16} />
              Export Config
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {roleSummary.map(({ role: r, count, total, percentage }) => (
          <div key={r} className="card p-4">
            <div className="text-xs text-zinc-400 mb-1">{r}</div>
            <div className="text-2xl font-bold mb-1">{percentage}%</div>
            <div className="text-xs text-zinc-500">
              {count} / {total} permissions
            </div>
            <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search permissions... (Press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="btn-secondary btn-sm"
              title="Expand all groups (Press * for keyboard shortcut)"
            >
              <ChevronsDown size={16} />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="btn-secondary btn-sm"
              title="Collapse all groups (Press - for keyboard shortcut)"
            >
              <ChevronsUp size={16} />
              Collapse All
            </button>
          </div>
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterRole === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            All Roles
          </button>
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filterRole === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Table */}
      <div className="space-y-3">
        {Object.entries(permissionsToDisplay).map(([categoryId, category]) => {
          const Icon = ICONS[category.icon] || Package;
          const isExpanded = expandedGroups[categoryId];
          const filteredRoles = filterRole === 'all' ? roles : [filterRole];

          return (
            <div key={categoryId} className="card overflow-hidden">
              {/* Group Header */}
              <div
                className="flex items-center justify-between p-4 bg-zinc-900 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => toggleGroup(categoryId)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-zinc-400" />
                  <div>
                    <h3 className="font-semibold">{category.label}</h3>
                    <p className="text-xs text-zinc-500">
                      {category.permissions.length} permission{category.permissions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Group select all indicator */}
                  {filteredRoles.map(r => {
                    const hasAll = hasAllInGroup(r, categoryId);
                    return (
                      <div key={r} className="text-xs text-zinc-500">
                        {hasAll ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-zinc-600" />}
                      </div>
                    );
                  })}
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {/* Group Content */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  {category.permissions.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 text-sm">
                      No matches found in this group
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-900/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold min-w-[300px]">
                            <div className="flex items-center gap-2">
                              Permission
                              <div className="group relative">
                                <Info size={14} className="text-zinc-500 cursor-help" />
                                <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 p-2 bg-zinc-800 border border-zinc-700 rounded shadow-lg text-xs z-50">
                                  Hover over permission names for descriptions
                                </div>
                              </div>
                            </div>
                          </th>
                          {filteredRoles.map(r => (
                            <th key={r} className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span>{r}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroupForRole(r, categoryId);
                                  }}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                  title={`Toggle all ${category.label} permissions for ${r}`}
                                  disabled={!isAdmin}
                                >
                                  {hasAllInGroup(r, categoryId) ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {category.permissions.map((perm, idx) => (
                          <tr
                            key={perm.key}
                            className={`border-t border-zinc-800 ${
                              idx % 2 === 0 ? 'bg-zinc-950/30' : ''
                            } hover:bg-zinc-800/30 transition-colors`}
                          >
                            <td className="px-4 py-3">
                              <div className="group relative">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-zinc-300">{perm.label}</span>
                                  <Info
                                    size={14}
                                    className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-help"
                                  />
                                </div>
                                <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 p-2 bg-zinc-800 border border-zinc-700 rounded shadow-lg text-xs z-50">
                                  <div className="font-mono text-zinc-400 mb-1">{perm.key}</div>
                                  <div className="text-zinc-300">{perm.description}</div>
                                </div>
                                <div className="text-xs text-zinc-500 font-mono mt-1">{perm.key}</div>
                              </div>
                            </td>
                            {filteredRoles.map(r => {
                              const checked = hasPermission(r, perm.key);
                              return (
                                <td key={r} className="px-4 py-3 text-center">
                                  <Guard perm="ADMIN_ROLE" mode="disable">
                                    <label className="inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          e.stopPropagation(); // Prevent any parent handlers
                                          togglePermission(r, perm.key, e.target.checked);
                                        }}
                                        onClick={(e) => e.stopPropagation()} // Prevent row click handlers
                                        disabled={!isAdmin}
                                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </label>
                                  </Guard>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      {!isAdmin && (
        <div className="card p-3 bg-amber-500/10 border-amber-500/30">
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <Info size={16} />
            <span>Only Admin users can modify permissions.</span>
          </div>
        </div>
      )}

      {/* Empty state for search */}
      {searchQuery && Object.keys(permissionsToDisplay).length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-zinc-400">No permissions found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
