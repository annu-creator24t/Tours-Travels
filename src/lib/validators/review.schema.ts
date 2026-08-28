import { z } from 'zod';

export const reviewSourceSchema = z.enum([
  'JUSTDIAL',
  'VERIFIED_CUSTOMER',
  'OTHER',
]);

export const createReviewSchema = z.object({
  vehicleId: z.string().uuid().optional().nullable(),
  authorName: z.string().min(2, 'Author name must be at least 2 characters'),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(5, 'Review text must be at least 5 characters'),
  source: reviewSourceSchema.default('VERIFIED_CUSTOMER'),
  sourceUrl: z.string().url().optional().nullable(),
  isApproved: z.boolean().default(false),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
