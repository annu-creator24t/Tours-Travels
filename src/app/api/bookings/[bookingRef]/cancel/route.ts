import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { cancelBookingCustomerSchema } from '@/lib/validators/booking.schema';
import { ZodError } from 'zod';

export async function POST(
  request: Request,
  { params }: { params: { bookingRef: string } }
) {
  try {
    const body = await request.json();
    const validatedData = cancelBookingCustomerSchema.parse(body);

    const cancelledBooking = await BookingService.cancelBookingByCustomer(
      params.bookingRef,
      validatedData
    );

    return NextResponse.json({
      success: true,
      message: `Booking #${params.bookingRef} has been cancelled successfully`,
      data: cancelledBooking,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || 'Invalid cancellation request',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to cancel booking';
    const status = message.includes('Unauthorized')
      ? 403
      : message.includes('not found')
      ? 404
      : 400;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
