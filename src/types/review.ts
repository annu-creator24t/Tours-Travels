export type ReviewSource = 'JUSTDIAL' | 'VERIFIED_CUSTOMER' | 'OTHER';

export interface ReviewItem {
  id: string;
  vehicleId?: string | null;
  authorName: string;
  rating: number;
  reviewText: string;
  reviewDate: string | Date;
  source: ReviewSource;
  sourceUrl?: string | null;
  isApproved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
