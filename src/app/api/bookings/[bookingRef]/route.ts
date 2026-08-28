import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { applyRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

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
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve booking';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { bookingRef: string } }
) {
  // 1. Rate Limiting Check
  const rateLimitResponse = applyRateLimit(
    request,
    'PATCH_booking_cancel',
    RATE_LIMIT_CONFIGS.BOOKING_CANCEL
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    if (body.action === 'CANCEL' || body.status === 'CANCELLED') {
      const cancelledBooking = await BookingService.cancelBookingByCustomer(
        params.bookingRef,
        {
          customerPhone: body.customerPhone || '',
          reason: body.reason,
        }
      );

      return NextResponse.json({
        success: true,
        message: `Booking #${params.bookingRef} has been cancelled successfully`,
        data: cancelledBooking,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action requested' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update booking';
    const status = message.includes('Unauthorized')
      ? 403
      : message.includes('not found')
      ? 404
      : 400;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
