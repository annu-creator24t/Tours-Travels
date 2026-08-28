import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { loginSchema } from '@/lib/validators/auth.schema';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { applyRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limiting check to prevent brute-force attacks on admin credentials
  const rateLimitResponse = applyRateLimit(
    request,
    'POST_admin_login',
    RATE_LIMIT_CONFIGS.ADMIN_LOGIN
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { token, user } = await AuthService.login(validatedData);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid login credentials';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
