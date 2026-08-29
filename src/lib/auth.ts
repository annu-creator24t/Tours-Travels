import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const DEV_FALLBACK_SECRET = 'dev-super-secure-jwt-secret-key-tours-and-travels-2026';

function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[SECURITY ERROR] NEXTAUTH_SECRET is not configured in production environment.'
      );
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  if (process.env.NODE_ENV === 'production' && secret === DEV_FALLBACK_SECRET) {
    throw new Error(
      '[SECURITY ERROR] Insecure development NEXTAUTH_SECRET placeholder cannot be used in production.'
    );
  }
  return new TextEncoder().encode(secret);
}

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
    .sign(getJwtSecret());
}

/**
 * Verifies a JWT token and returns payload if valid
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
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
