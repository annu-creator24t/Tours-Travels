import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { createBookingSchema } from '@/lib/validators/booking.schema';
import { applyRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  // 1. Rate Limiting Check
  const rateLimitResponse = applyRateLimit(
    request,
    'POST_bookings',
    RATE_LIMIT_CONFIGS.BOOKING_CREATE
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const booking = await BookingService.createBookingRequest({
      ...validatedData,
      vehicleId: validatedData.vehicleId ? validatedData.vehicleId : undefined,
      customerEmail: validatedData.customerEmail ? validatedData.customerEmail : undefined,
      returnDatetime: validatedData.returnDatetime ? validatedData.returnDatetime : undefined,
      customerNotes: validatedData.customerNotes ? validatedData.customerNotes : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request received successfully',
        data: {
          id: booking.id,
          bookingRef: booking.bookingRef,
          status: booking.status,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation,
          pickupDatetime: booking.pickupDatetime,
          returnDatetime: booking.returnDatetime,
          tripType: booking.tripType,
          passengerCount: booking.passengerCount,
          vehicle: booking.vehicle
            ? {
                name: booking.vehicle.name,
                brand: booking.vehicle.brand,
                slug: booking.vehicle.slug,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || 'Invalid booking form submission',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to submit booking request';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
