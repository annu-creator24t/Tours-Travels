import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { BookingStatus, VehicleStatus, PaymentStatus, PaymentType } from '@prisma/client';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const [
      totalVehicles,
      availableVehicles,
      vehiclesOnTrip,
      vehiclesMaintenance,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      advancePaymentsResult,
      recentBookings,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.MAINTENANCE } }),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      prisma.payment.aggregate({
        where: {
          paymentType: PaymentType.ADVANCE,
          status: PaymentStatus.PAID,
        },
        _sum: { amount: true },
      }),
      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          bookingRef: true,
          customerName: true,
          pickupLocation: true,
          dropLocation: true,
          pickupDatetime: true,
          status: true,
          finalPrice: true,
          estimatedPrice: true,
          advanceAmount: true,
          createdAt: true,
          vehicle: {
            select: {
              name: true,
              brand: true,
              vehicleType: true,
            },
          },
          payments: {
            select: {
              id: true,
              paymentType: true,
              status: true,
              amount: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          vehicles: {
            total: totalVehicles,
            available: availableVehicles,
            onTrip: vehiclesOnTrip,
            maintenance: vehiclesMaintenance,
          },
          bookings: {
            pending: pendingBookings,
            confirmed: confirmedBookings,
            completed: completedBookings,
            cancelled: cancelledBookings,
          },
          finance: {
            totalAdvanceReceived: Number(advancePaymentsResult._sum.amount || 0),
          },
        },
        recentBookings,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch dashboard metrics';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
