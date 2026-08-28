import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentAdminSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { user: session },
  });
}
