import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { BookingStatus, DriverStatus } from '@prisma/client';

export async function GET() {
  try {
    const [pendingBookings, confirmedBookings, totalVehicles, activeDrivers, recentBookings] =
      await Promise.all([
        prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
        prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
        prisma.vehicle.count(),
        prisma.driver.count({ where: { status: DriverStatus.AVAILABLE } }),
        prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: { select: { name: true, brand: true } },
            driver: { select: { name: true, phone: true } },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          pendingInquiries: pendingBookings,
          confirmedTrips: confirmedBookings,
          totalFleet: totalVehicles,
          availableDrivers: activeDrivers,
        },
        recentBookings,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard metrics';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
