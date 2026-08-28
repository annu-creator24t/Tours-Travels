import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleType = searchParams.get('type') || undefined;
    const seatingCapacity = searchParams.get('seats')
      ? parseInt(searchParams.get('seats')!, 10)
      : undefined;
    const hasAc = searchParams.get('ac')
      ? searchParams.get('ac') === 'true'
      : undefined;
    const isFeatured = searchParams.get('featured')
      ? searchParams.get('featured') === 'true'
      : undefined;

    const vehicles = await VehicleService.getPublicVehicles({
      vehicleType,
      seatingCapacity,
      hasAc,
      isFeatured,
    });

    return NextResponse.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vehicles';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
