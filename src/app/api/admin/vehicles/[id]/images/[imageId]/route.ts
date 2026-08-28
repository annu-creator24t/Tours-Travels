import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle.service';
import { getCurrentAdminSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updatedImage = await VehicleService.setPrimaryImage(
      params.id,
      params.imageId
    );

    return NextResponse.json({
      success: true,
      message: 'Primary vehicle image updated successfully',
      data: updatedImage,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update image';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await VehicleService.deleteVehicleImage(
      params.id,
      params.imageId
    );

    return NextResponse.json({
      success: true,
      message: result.message || 'Image removed successfully',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete vehicle image';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
