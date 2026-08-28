import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-super-secure-jwt-secret-key-tours-and-travels-2026'
);

const AUTH_COOKIE_NAME = 'admin_session_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect /api/admin/* API endpoints (except login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth/login') {
    const token =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, JWT_SECRET_KEY);
      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }
  }

  // 2. Protect /admin UI routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET_KEY);
      return NextResponse.next();
    } catch {
      // Invalid or expired token -> clear cookie & redirect
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  // 3. If accessing /admin/login while already authenticated, redirect to /admin dashboard
  if (pathname === '/admin/login') {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET_KEY);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch {
        // Token invalid, proceed to login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
