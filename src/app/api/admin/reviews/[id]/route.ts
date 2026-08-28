import { NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import prisma from '@/lib/db';
import { z } from 'zod';

const reviewApprovalSchema = z.object({
  isApproved: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = reviewApprovalSchema.parse(body);

    const review = await ReviewService.setReviewApproval(
      params.id,
      validatedData.isApproved
    );

    return NextResponse.json({
      success: true,
      message: `Review ${validatedData.isApproved ? 'approved' : 'hidden'} successfully`,
      data: review,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update review';
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
    await prisma.review.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete review';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
