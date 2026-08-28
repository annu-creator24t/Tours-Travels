import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';

export async function GET(
  request: Request,
  { params }: { params: { bookingRef: string } }
) {
  try {
    const booking = await BookingService.getBookingByRef(params.bookingRef);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking reference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve booking';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
