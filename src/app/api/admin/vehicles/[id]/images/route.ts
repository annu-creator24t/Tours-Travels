import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle.service';
import {
  addVehicleImageSchema,
  reorderVehicleImagesSchema,
} from '@/lib/validators/vehicle.schema';
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const images = await VehicleService.getVehicleImages(params.id);
    return NextResponse.json({ success: true, data: images });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch vehicle images';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = addVehicleImageSchema.parse(body);

    const image = await VehicleService.addVehicleImage(params.id, validated);
    return NextResponse.json(
      {
        success: true,
        message: 'Image added to vehicle gallery successfully',
        data: image,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || 'Invalid image payload',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to add vehicle image';
    const status = message.includes('not found') ? 404 : 400;
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageIds } = reorderVehicleImagesSchema.parse(body);

    const updatedImages = await VehicleService.reorderVehicleImages(
      params.id,
      imageIds
    );
    return NextResponse.json({
      success: true,
      message: 'Vehicle images reordered successfully',
      data: updatedImages,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || 'Invalid reorder payload',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to reorder images';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
