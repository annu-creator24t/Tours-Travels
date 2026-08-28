import { z } from 'zod';

export const tripTypeSchema = z.enum(['ONE_WAY', 'ROUND_TRIP', 'LOCAL_RENTAL']);

export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
]);

export const createBookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
  customerEmail: z.string().email('Please enter a valid email').optional().nullable(),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  dropLocation: z.string().min(3, 'Destination/drop location is required'),
  pickupDatetime: z.string().or(z.date()),
  returnDatetime: z.string().or(z.date()).optional().nullable(),
  tripType: tripTypeSchema.default('ONE_WAY'),
  passengerCount: z.number().int().min(1).max(50),
  vehicleId: z.string().uuid().optional().nullable(),
  customerNotes: z.string().max(500).optional().nullable(),
});

export const updateBookingStatusSchema = z.object({
  status: bookingStatusSchema,
  vehicleId: z.string().uuid().optional().nullable(),
  driverId: z.string().uuid().optional().nullable(),
  finalPrice: z.number().positive().optional().nullable(),
  advanceAmount: z.number().min(0).optional().nullable(),
  balanceAmount: z.number().min(0).optional().nullable(),
  adminNotes: z.string().max(1000).optional().nullable(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
