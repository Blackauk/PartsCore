/**
 * Mock authentication API for local development
 * DO NOT use in production - this is for development only
 */

export async function mockLoginApi({ identifier, password, otp, remember }) {
  // Small artificial delay so UX states show
  await new Promise(r => setTimeout(r, 500));

  // Developer/demo account (local dev only)
  const DEMO_USER = {
    email: "demo@corestock.local",
    username: "demouser",
    password: "Password123!",
    token: "demo.jwt.token",
    roles: ["admin"],
    permissions: ["inventory.read", "inventory.write", "procurement.receive", "users.admin"]
  };

  // Accept either email or username for convenience
  const idLower = (identifier || "").toLowerCase();
  const matchesDemo = idLower === DEMO_USER.email || idLower === DEMO_USER.username;

  if (matchesDemo && password === DEMO_USER.password) {
    // Skip MFA for demo account
    // Admin should have all permissions for full menu visibility
    const adminPermissions = [
      'inventory.read', 'inventory.write', 'inventory.adjust',
      'procurement.read', 'procurement.receive', 'procurement.create',
      'labels.generate', 'labels.print',
      'reports.read',
      'users.admin', 'roles.admin', 'sites.admin'
    ];
    
    return { 
      ok: true, 
      token: DEMO_USER.token, 
      user: { 
        name: "Demo Admin", 
        email: DEMO_USER.email, 
        roles: DEMO_USER.roles,
        permissions: adminPermissions
      } 
    };
  }

  // Generic error for other creds
  return { ok: false, message: "Invalid credentials" };
}

