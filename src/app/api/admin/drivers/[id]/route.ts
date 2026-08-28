import { NextResponse } from 'next/server';
import { DriverService } from '@/lib/services/driver.service';
import { updateDriverSchema } from '@/lib/validators/driver.schema';
import prisma from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateDriverSchema.parse(body);

    const driver = await DriverService.updateDriver(params.id, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update driver';
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
    await prisma.driver.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete driver';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
