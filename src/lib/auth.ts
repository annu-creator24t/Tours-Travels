/**
 * Admin Authentication & Session helper functions
 */

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  // Basic validation - detailed JWT verification is expanded in future phases
  return token.length > 10;
}
