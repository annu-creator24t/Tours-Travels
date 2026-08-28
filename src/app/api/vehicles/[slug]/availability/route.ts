import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { VehicleService } from '@/lib/services/vehicle.service';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const pickupStr = searchParams.get('pickupDatetime');
    const returnStr = searchParams.get('returnDatetime');

    if (!pickupStr) {
      return NextResponse.json(
        { success: false, error: 'pickupDatetime query parameter is required' },
        { status: 400 }
      );
    }

    const pickupDatetime = new Date(pickupStr);
    const returnDatetime = returnStr ? new Date(returnStr) : null;

    if (isNaN(pickupDatetime.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid pickupDatetime format' },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { slug: params.slug },
      select: { id: true, name: true, status: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const result = await VehicleService.isVehicleAvailable(
      vehicle.id,
      pickupDatetime,
      returnDatetime
    );

    return NextResponse.json({
      success: true,
      data: {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        isAvailable: result.available,
        reason: result.reason || null,
        requestedPickup: pickupDatetime.toISOString(),
        requestedReturn: returnDatetime ? returnDatetime.toISOString() : null,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to check vehicle availability';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
