import { NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';

export async function GET() {
  try {
    const reviews = await ReviewService.getAllReviewsAdmin();
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
