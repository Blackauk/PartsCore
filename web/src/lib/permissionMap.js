/**
 * Maps user-specified permissions to actual permission keys in the system
 * 
 * The user specified permissions like:
 * - inventory.read, inventory.write, inventory.adjust
 * - procurement.read, procurement.receive, procurement.create
 * - labels.generate, labels.print
 * - reports.read
 * - users.admin, roles.admin, sites.admin
 * 
 * But the system uses format like:
 * - catalog:read, inventory:receive, etc.
 */

/**
 * Map user-specified permission to system permission keys
 * Returns array of permission keys that satisfy the requirement
 */
export function mapPermission(userPermission) {
  const mapping = {
    // Inventory permissions
    'inventory.read': ['catalog:read', 'inventory:receive'],
    'inventory.write': ['inventory:receive', 'inventory:issue', 'inventory:transfer'],
    'inventory.adjust': ['inventory:adjust'],
    
    // Procurement permissions
    'procurement.read': ['orders:read'],
    'procurement.receive': ['inventory:receive'], // GRN receiving
    'procurement.create': ['orders:create'],
    
    // Labels permissions
    'labels.generate': ['labels:print:sheets', 'labels:print:single'],
    'labels.print': ['labels:print:sheets', 'labels:print:single'],
    
    // Reports permissions
    'reports.read': ['reports:view'],
    
    // Admin permissions
    'users.admin': ['users:read', 'users:create', 'users:update', 'users:delete'],
    'roles.admin': ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
    'sites.admin': ['locations:site:read', 'locations:site:create', 'locations:site:update', 'locations:site:delete'],
  };

  return mapping[userPermission] || [];
}

/**
 * Check if user has the required permission (using user-specified format)
 * User permissions can be in either format:
 * - User format: "inventory.read"
 * - System format: "catalog:read"
 */
export function hasUserPermission(userPermissions, requiredPermission) {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  // Direct match (user format)
  if (userPermissions.includes(requiredPermission)) return true;
  
  // Check mapped permissions (if requiredPermission is in user format, check system format)
  const mapped = mapPermission(requiredPermission);
  if (mapped.length > 0) {
    return mapped.some(perm => userPermissions.includes(perm));
  }
  
  // Also check if requiredPermission is already in system format
  if (userPermissions.includes(requiredPermission)) return true;
  
  return false;
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyUserPermission(userPermissions, requiredPermissions) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some(perm => hasUserPermission(userPermissions, perm));
}

