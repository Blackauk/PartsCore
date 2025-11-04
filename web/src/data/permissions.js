/**
 * Centralized permissions data structure
 * Using RESOURCE:ACTION format for consistency
 */

export const PERMISSIONS = {
  catalog: {
    id: 'catalog',
    label: 'Catalog & Assets',
    icon: 'Package',
    permissions: [
      { key: 'catalog:read', label: 'View Catalog', description: 'View parts and asset catalog' },
      { key: 'catalog:create', label: 'Add Part', description: 'Create new catalog entries' },
      { key: 'catalog:update', label: 'Edit Part', description: 'Modify existing catalog entries' },
      { key: 'catalog:delete', label: 'Delete Part', description: 'Remove catalog entries' },
      { key: 'catalog:import', label: 'Import Catalog', description: 'Bulk import catalog data' },
      { key: 'catalog:export', label: 'Export Catalog', description: 'Export catalog to CSV/Excel' },
    ],
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory Movements',
    icon: 'ClipboardCheck',
    permissions: [
      { key: 'inventory:receive', label: 'Receive Goods', description: 'Book in deliveries and update stock' },
      { key: 'inventory:issue', label: 'Issue Stock', description: 'Remove items from inventory' },
      { key: 'inventory:transfer', label: 'Transfer Stock', description: 'Move items between locations' },
      { key: 'inventory:adjust', label: 'Adjust Stock', description: 'Manual stock corrections' },
      { key: 'inventory:count:start', label: 'Start Count', description: 'Begin stock counting process' },
      { key: 'inventory:count:finalize', label: 'Finalize Count', description: 'Complete and approve stock counts' },
      { key: 'inventory:export', label: 'Export Movements', description: 'Export transaction history' },
    ],
  },
  locations: {
    id: 'locations',
    label: 'Locations (Sites/Zones/Bins)',
    icon: 'MapPin',
    permissions: [
      { key: 'locations:site:read', label: 'View Sites', description: 'View site information' },
      { key: 'locations:site:create', label: 'Create Site', description: 'Add new sites' },
      { key: 'locations:site:update', label: 'Edit Site', description: 'Modify site details' },
      { key: 'locations:site:delete', label: 'Delete Site', description: 'Remove sites' },
      { key: 'locations:zone:read', label: 'View Zones', description: 'View zone information' },
      { key: 'locations:zone:create', label: 'Create Zone', description: 'Add new zones' },
      { key: 'locations:zone:update', label: 'Edit Zone', description: 'Modify zone details' },
      { key: 'locations:zone:delete', label: 'Delete Zone', description: 'Remove zones' },
      { key: 'locations:bin:read', label: 'View Bins', description: 'View bin/location details' },
      { key: 'locations:bin:create', label: 'Create Bin', description: 'Add new storage bins' },
      { key: 'locations:bin:update', label: 'Edit Bin', description: 'Modify bin details' },
      { key: 'locations:bin:delete', label: 'Delete Bin', description: 'Remove bins' },
    ],
  },
  orders: {
    id: 'orders',
    label: 'Orders (Purchase/Returns)',
    icon: 'ShoppingCart',
    permissions: [
      { key: 'orders:read', label: 'View Orders', description: 'View purchase orders and returns' },
      { key: 'orders:create', label: 'Create Order', description: 'Create new purchase orders' },
      { key: 'orders:update', label: 'Edit Order', description: 'Modify existing orders' },
      { key: 'orders:approve', label: 'Approve Order', description: 'Approve purchase orders' },
      { key: 'orders:close', label: 'Close Order', description: 'Mark orders as completed' },
      { key: 'orders:reopen', label: 'Reopen Order', description: 'Reopen closed orders' },
      { key: 'orders:export', label: 'Export Orders', description: 'Export order data' },
    ],
  },
  suppliers: {
    id: 'suppliers',
    label: 'Suppliers & Compliance',
    icon: 'Truck',
    permissions: [
      { key: 'suppliers:read', label: 'View Suppliers', description: 'View supplier information' },
      { key: 'suppliers:create', label: 'Add Supplier', description: 'Create new supplier records' },
      { key: 'suppliers:update', label: 'Edit Supplier', description: 'Modify supplier details' },
      { key: 'suppliers:delete', label: 'Delete Supplier', description: 'Remove supplier records' },
      { key: 'suppliers:compliance', label: 'Manage Compliance', description: 'Attach compliance documents' },
    ],
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    icon: 'FileText',
    permissions: [
      { key: 'reports:view', label: 'View Reports', description: 'Access all reports' },
      { key: 'reports:export', label: 'Export Reports', description: 'Export report data' },
    ],
  },
  users: {
    id: 'users',
    label: 'Users & Roles',
    icon: 'UserCog',
    permissions: [
      { key: 'users:read', label: 'View Users', description: 'View user accounts' },
      { key: 'users:create', label: 'Create User', description: 'Add new users' },
      { key: 'users:update', label: 'Edit User', description: 'Modify user details' },
      { key: 'users:delete', label: 'Delete User', description: 'Remove user accounts' },
      { key: 'users:password:reset', label: 'Reset Password', description: 'Reset user passwords' },
      { key: 'roles:read', label: 'View Roles', description: 'View role definitions' },
      { key: 'roles:create', label: 'Create Role', description: 'Create new roles' },
      { key: 'roles:update', label: 'Edit Role', description: 'Modify role permissions' },
      { key: 'roles:delete', label: 'Delete Role', description: 'Remove roles' },
    ],
  },
  admin: {
    id: 'admin',
    label: 'System Admin',
    icon: 'Settings',
    permissions: [
      { key: 'settings:manage', label: 'Manage Settings', description: 'Configure system settings' },
      { key: 'integrations:manage', label: 'Manage Integrations', description: 'Configure external integrations' },
      { key: 'i18n:manage', label: 'Manage Localization', description: 'Configure language/regional settings' },
      { key: 'audit:read', label: 'View Audit Log', description: 'Access audit trail' },
      { key: 'api:read', label: 'View API Tokens', description: 'View API access tokens' },
      { key: 'api:write', label: 'Manage API Tokens', description: 'Create/revoke API tokens' },
    ],
  },
  labels: {
    id: 'labels',
    label: 'Labels / QR Codes',
    icon: 'Printer',
    permissions: [
      { key: 'labels:print:sheets', label: 'Print Label Sheets', description: 'Print batch label sheets' },
      { key: 'labels:print:single', label: 'Print Single Label', description: 'Print individual labels' },
    ],
  },
};

// Get all permission keys in a flat array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(
  (category) => category.permissions.map((p) => p.key)
);

// Legacy permission mapping (for backwards compatibility)
export const LEGACY_PERMISSION_MAP = {
  ASSET_VIEW: 'catalog:read',
  ASSET_EDIT: 'catalog:update',
  STOCK_VIEW: 'inventory:receive', // Approximate
  STOCK_MOVE: 'inventory:transfer',
  STOCK_ADJUST: 'inventory:adjust',
  PO_CREATE: 'orders:create',
  PO_APPROVE: 'orders:approve',
  GRN_RECEIVE: 'inventory:receive',
  RMA_CREATE: 'orders:create',
  REPORT_VIEW: 'reports:view',
  ADMIN_USER: 'users:read',
  ADMIN_ROLE: 'roles:read',
  ADMIN_SITE: 'locations:site:read',
  ADMIN_SETTINGS: 'settings:manage',
};

// Default role permissions (comprehensive)
export const DEFAULT_ROLE_PERMISSIONS = {
  Admin: ALL_PERMISSIONS, // All permissions
  Manager: [
    // Catalog
    'catalog:read', 'catalog:create', 'catalog:update', 'catalog:export',
    // Inventory
    'inventory:receive', 'inventory:issue', 'inventory:transfer', 'inventory:adjust', 'inventory:count:start', 'inventory:count:finalize', 'inventory:export',
    // Locations (read-only)
    'locations:site:read', 'locations:zone:read', 'locations:bin:read',
    // Orders
    'orders:read', 'orders:create', 'orders:update', 'orders:approve', 'orders:export',
    // Suppliers
    'suppliers:read', 'suppliers:create', 'suppliers:update',
    // Reports
    'reports:view', 'reports:export',
    // Users (limited)
    'users:read', 'users:create', 'users:update',
    // Labels
    'labels:print:sheets', 'labels:print:single',
  ],
  Supervisor: [
    // Catalog
    'catalog:read', 'catalog:export',
    // Inventory (operations)
    'inventory:receive', 'inventory:issue', 'inventory:transfer', 'inventory:count:start',
    // Locations (read-only)
    'locations:site:read', 'locations:zone:read', 'locations:bin:read',
    // Orders (limited)
    'orders:read', 'orders:create',
    // Reports
    'reports:view',
    // Labels
    'labels:print:sheets', 'labels:print:single',
  ],
  Fitter: [
    // Catalog
    'catalog:read',
    // Inventory (basic operations)
    'inventory:receive', 'inventory:issue', 'inventory:transfer',
    // Locations (read-only)
    'locations:site:read', 'locations:zone:read', 'locations:bin:read',
    // Labels
    'labels:print:single',
  ],
  Viewer: [
    // Read-only access
    'catalog:read',
    'inventory:receive', // View receipts
    'locations:site:read', 'locations:zone:read', 'locations:bin:read',
    'orders:read',
    'suppliers:read',
    'reports:view',
  ],
};

