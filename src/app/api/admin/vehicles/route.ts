import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle.service';
import { createVehicleSchema } from '@/lib/validators/vehicle.schema';

export async function GET() {
  try {
    const vehicles = await VehicleService.getAllVehiclesAdmin();
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createVehicleSchema.parse(body);

    const vehicle = await VehicleService.createVehicle(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Vehicle added successfully',
        data: vehicle,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create vehicle';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
