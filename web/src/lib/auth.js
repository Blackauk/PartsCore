/**
 * Authentication API functions
 * All endpoints are prefixed by VITE_API_URL
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Login with identifier (email or username) and password
 * @param {string} identifier - Email or username
 * @param {string} password - User password
 * @returns {Promise<{token: string} | {requiresMfa: true, mfaToken: string}>}
 */
export async function login(identifier, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for HttpOnly session cookies
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid credentials');
  }

  return response.json();
}

/**
 * Verify MFA code
 * @param {string} mfaToken - Token from login response
 * @param {string} otp - One-time password code
 * @returns {Promise<{token: string}>}
 */
export async function verifyMfa(mfaToken, otp) {
  const response = await fetch(`${API_URL}/auth/mfa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ mfaToken, otp }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'MFA verification failed' }));
    throw new Error(error.message || 'Invalid verification code');
  }

  const data = await response.json();
  
  // Store token if provided (for JWT-based auth)
  if (data.token) {
    const storage = sessionStorage; // Use sessionStorage by default
    storage.setItem('auth_token', data.token);
  }

  return data;
}

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  // Always return success (non-enumerating) - don't reveal if email exists
  if (!response.ok) {
    // Still return success to prevent email enumeration
    return;
  }
}

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} password - New password
 * @returns {Promise<void>}
 */
export async function resetPassword(token, password) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Password reset failed' }));
    throw new Error(error.message || 'Invalid or expired reset token');
  }
}

/**
 * Register new user
 * @param {Object} data - Registration data
 * @param {string} data.name - User name
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @returns {Promise<void>}
 */
export async function register({ name, email, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
}

/**
 * Get current user information
 * @returns {Promise<{id: string, name: string, email: string, roles: string[], permissions: string[], siteIds?: string[]}>}
 */
export async function getMe() {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  
  // Handle mock auth in development
  if (import.meta.env.DEV && token === 'demo.jwt.token') {
    return {
      id: 'demo-001',
      name: 'Demo Admin',
      email: 'demo@corestock.local',
      roles: ['admin'],
      permissions: [
        'inventory.read', 'inventory.write', 'inventory.adjust',
        'procurement.read', 'procurement.receive', 'procurement.create',
        'labels.generate', 'labels.print',
        'reports.read',
        'users.admin', 'roles.admin', 'sites.admin'
      ],
      siteIds: []
    };
  }
  
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if using JWT
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    // Clear invalid token
    if (token) {
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token');
    }
    throw new Error('Authentication required');
  }

  return response.json();
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
  } catch (error) {
    // Ignore errors on logout
    console.error('Logout error:', error);
  } finally {
    // Clear auth tokens only - preserve cs.* data
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
    // Do NOT clear cs.* keys - preserve app data
  }
}

