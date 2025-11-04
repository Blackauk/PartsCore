/**
 * Centralized navigation configuration
 * Returns navigation items based on user roles and permissions
 */

export function getSidebarNav(user) {
  const can = (perm) => {
    if (!perm) return true;
    const perms = Array.isArray(perm) ? perm : [perm];
    const userPerms = user?.permissions ?? [];
    const isAdmin = (user?.roles ?? []).includes('admin');
    
    // Admin sees everything
    if (isAdmin) return true;
    
    // For array permissions, check if user has ANY (not all)
    if (Array.isArray(perm)) {
      return perms.some(p => userPerms.includes(p));
    }
    
    // Single permission check
    return userPerms.includes(perm);
  };

  const items = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: 'Home',
      perm: null // Always visible
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: 'Boxes',
      perm: 'inventory.read',
      children: [
        { label: 'Master List', path: '/inventory', perm: 'inventory.read' },
        { label: 'Catalog', path: '/inventory/catalog', perm: 'inventory.read' },
        { label: 'Stock', path: '/inventory/items', perm: 'inventory.read' },
        { label: 'Movements', path: '/movements', perm: 'inventory.read' },
      ]
    },
    {
      label: 'Procurement',
      path: '/procurement',
      icon: 'ShoppingCart',
      perm: 'procurement.read',
      children: [
        { label: 'Purchase Orders', path: '/procurement', perm: 'procurement.read' },
        { label: 'Deliveries / GRNs', path: '/procurement/deliveries', perm: 'procurement.read' },
      ]
    },
    {
      label: 'Labels & QR',
      path: '/labels-qr',
      icon: 'Printer',
      perm: ['labels.generate', 'labels.print']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: 'BarChart3',
      perm: 'reports.read'
    },
    {
      label: 'Manage',
      path: '/manage',
      icon: 'Settings',
      perm: ['users.admin', 'roles.admin', 'sites.admin'],
      children: [
        { label: 'Users & Roles', path: '/admin', perm: 'users.admin' },
        { label: 'Teams & Sites', path: '/admin/teams', perm: 'users.admin' },
        { label: 'Permissions', path: '/admin/permissions', perm: 'roles.admin' },
        { label: 'Settings', path: '/admin/settings', perm: ['users.admin', 'roles.admin', 'sites.admin'] },
      ]
    },
  ];

  // Filter items and their children based on permissions
  return items
    .filter(item => can(item.perm))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => can(child.perm))
        };
      }
      return item;
    });
}

