import { NextResponse } from 'next/server';
import { DriverService } from '@/lib/services/driver.service';
import { createDriverSchema } from '@/lib/validators/driver.schema';
import { getCurrentAdminSession } from '@/lib/auth';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';
    const pickupDatetime = searchParams.get('pickupDatetime');
    const returnDatetime = searchParams.get('returnDatetime');
    const excludeBookingId = searchParams.get('excludeBookingId') || undefined;

    const drivers =
      availableOnly || pickupDatetime
        ? await DriverService.getAvailableDrivers(
            pickupDatetime || undefined,
            returnDatetime || undefined,
            excludeBookingId
          )
        : await DriverService.getAllDrivers();

    return NextResponse.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch drivers';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

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
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || 'Invalid driver input',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to create driver';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
