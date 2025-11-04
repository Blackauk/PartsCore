/**
 * Permissions constants - Legacy support with new structure
 * @deprecated Use data/permissions.js for new permissions
 */

import { DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSIONS, LEGACY_PERMISSION_MAP } from '../data/permissions.js';

// Legacy permissions list (for backwards compatibility)
export const PERMISSIONS = [
  'ASSET_VIEW', 'ASSET_EDIT', 'STOCK_VIEW', 'STOCK_MOVE', 'STOCK_ADJUST',
  'PO_CREATE', 'PO_APPROVE', 'GRN_RECEIVE', 'RMA_CREATE',
  'REPORT_VIEW', 'ADMIN_USER', 'ADMIN_ROLE', 'ADMIN_SITE', 'ADMIN_SETTINGS'
];

// Legacy role permission map (maintained for compatibility)
// This is now loaded from localStorage if available, otherwise uses DEFAULT_ROLE_PERMISSIONS
function getRolePermissionMap() {
  try {
    const stored = localStorage.getItem('role-permissions');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert new format to legacy format for backward compatibility
      const legacy = {};
      Object.keys(parsed).forEach(role => {
        const newPerms = parsed[role] || [];
        // Map new permissions back to legacy ones where applicable
        const legacyPerms = PERMISSIONS.filter(legacyPerm => {
          const mappedNewPerm = LEGACY_PERMISSION_MAP[legacyPerm];
          return newPerms.includes(mappedNewPerm);
        });
        // Always include legacy permissions that might not have direct mappings
        legacy[role] = [...new Set([...legacyPerms, ...newPerms])];
      });
      return legacy;
    }
  } catch (e) {
    console.error('Failed to load role permissions', e);
  }

  // Fallback to default mapping
  const defaultLegacy = {};
  Object.keys(DEFAULT_ROLE_PERMISSIONS).forEach(role => {
    const newPerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
    const legacyPerms = PERMISSIONS.filter(legacyPerm => {
      const mappedNewPerm = LEGACY_PERMISSION_MAP[legacyPerm];
      return newPerms.includes(mappedNewPerm);
    });
    defaultLegacy[role] = [...new Set([...legacyPerms, ...newPerms])];
  });
  return defaultLegacy;
}

export const ROLE_PERMISSION_MAP = getRolePermissionMap();

// Helper to check if a role has a permission (supports both legacy and new format)
export function hasPermission(role, permission) {
  const rolePerms = ROLE_PERMISSION_MAP[role] || [];
  // Check direct match
  if (rolePerms.includes(permission)) return true;
  // Check if legacy permission maps to a new one that role has
  const mappedNew = LEGACY_PERMISSION_MAP[permission];
  if (mappedNew && rolePerms.includes(mappedNew)) return true;
  return false;
}
