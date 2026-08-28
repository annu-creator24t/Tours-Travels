import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { BookingStatus } from '@prisma/client';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as BookingStatus) || undefined;

    const bookings = await BookingService.getAllBookings(status);

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch bookings';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
