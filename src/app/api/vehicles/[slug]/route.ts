import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle.service';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const vehicle = await VehicleService.getVehicleBySlug(params.slug);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vehicle';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
