/**
 * Get role-based redirect path
 * @param {string[]} roles - User roles
 * @returns {string} Redirect path
 */
export function getRoleRedirectPath(roles) {
  if (roles.includes('admin')) return '/manage';
  if (roles.includes('stores')) return '/inventory';
  if (roles.includes('manager')) return '/reports';
  if (roles.includes('fitter')) return '/movements';
  return '/dashboard';
}

