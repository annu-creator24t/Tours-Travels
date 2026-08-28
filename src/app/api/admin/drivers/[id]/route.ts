import { NextResponse } from 'next/server';
import { DriverService } from '@/lib/services/driver.service';
import { updateDriverSchema } from '@/lib/validators/driver.schema';
import { getCurrentAdminSession } from '@/lib/auth';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const driver = await DriverService.getDriverById(params.id);
    return NextResponse.json({ success: true, data: driver });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch driver';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateDriverSchema.parse(body);

    const driver = await DriverService.updateDriver(params.id, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver,
    });
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
      error instanceof Error ? error.message : 'Failed to update driver';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    await DriverService.deleteDriver(params.id);

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete driver';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

