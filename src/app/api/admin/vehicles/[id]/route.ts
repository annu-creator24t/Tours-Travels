import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle.service';
import { updateVehicleSchema } from '@/lib/validators/vehicle.schema';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await VehicleService.getVehicleById(params.id);

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateVehicleSchema.parse(body);

    const vehicle = await VehicleService.updateVehicle(params.id, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update vehicle';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vehicle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vehicle removed successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete vehicle';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
