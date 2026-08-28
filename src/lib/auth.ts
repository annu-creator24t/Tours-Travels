import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-super-secure-jwt-secret-key-tours-and-travels-2026'
);

export const AUTH_COOKIE_NAME = 'admin_session_token';

export interface AdminJwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Signs a JWT token with the admin payload
 */
export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_KEY);
}

/**
 * Verifies a JWT token and returns payload if valid
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to retrieve the current logged-in admin session
 */
export async function getCurrentAdminSession(): Promise<AdminJwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
