import { NextResponse } from 'next/server';
import { DriverService } from '@/lib/services/driver.service';
import { createDriverSchema } from '@/lib/validators/driver.schema';

export async function GET() {
  try {
    const drivers = await DriverService.getAllDrivers();
    return NextResponse.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch drivers';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createDriverSchema.parse(body);

    const driver = await DriverService.createDriver(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Driver profile created successfully',
        data: driver,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create driver';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
