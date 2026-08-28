import { NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { createReviewSchema } from '@/lib/validators/review.schema';
import { ReviewSource } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId') || undefined;
    const source = (searchParams.get('source') as ReviewSource) || undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;

    const reviews = await ReviewService.getApprovedReviews({
      vehicleId,
      source,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    const review = await ReviewService.submitReview(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully. It will be visible after moderation.',
        data: review,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
