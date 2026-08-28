import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { createBookingSchema } from '@/lib/validators/booking.schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const booking = await BookingService.createBookingRequest(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request received successfully',
        data: {
          bookingRef: booking.bookingRef,
          status: booking.status,
          customerName: booking.customerName,
          pickupDatetime: booking.pickupDatetime,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit booking request';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
