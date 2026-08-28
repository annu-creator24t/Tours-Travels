import prisma from '@/lib/db';
import { ReviewSource } from '@prisma/client';
import { CreateReviewInput } from '@/lib/validators/review.schema';

export class ReviewService {
  /**
   * Fetches public approved reviews (optionally filtered by vehicle or source)
   */
  static async getApprovedReviews(filters?: {
    vehicleId?: string;
    source?: ReviewSource;
    limit?: number;
  }) {
    return prisma.review.findMany({
      where: {
        isApproved: true,
        vehicleId: filters?.vehicleId,
        source: filters?.source,
      },
      include: {
        vehicle: {
          select: { name: true, brand: true, slug: true },
        },
      },
      orderBy: { reviewDate: 'desc' },
      take: filters?.limit || 20,
    });
  }

  /**
   * Submits a customer review (pending approval by default)
   */
  static async submitReview(input: CreateReviewInput) {
    return prisma.review.create({
      data: {
        ...input,
        isApproved: input.isApproved ?? false,
      },
    });
  }

  /**
   * Admin: Lists all reviews for moderation
   */
  static async getAllReviewsAdmin() {
    return prisma.review.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Toggles review approval status
   */
  static async setReviewApproval(id: string, isApproved: boolean) {
    return prisma.review.update({
      where: { id },
      data: { isApproved },
    });
  }
}
