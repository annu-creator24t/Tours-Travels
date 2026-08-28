import { NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

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
