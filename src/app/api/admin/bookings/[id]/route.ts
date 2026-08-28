import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { updateBookingStatusSchema } from '@/lib/validators/booking.schema';
import { getCurrentAdminSession } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        vehicle: { include: { images: true } },
        driver: true,
        payments: true,
        managedByAdmin: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch booking details';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateBookingStatusSchema.parse(body);

    const updatedBooking = await BookingService.updateBookingStatus(
      params.id,
      validatedData,
      session.id
    );

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update booking status';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
