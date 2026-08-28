import { z } from 'zod';

export const tripTypeSchema = z.enum(['ONE_WAY', 'ROUND_TRIP', 'LOCAL_RENTAL']);

export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
]);

export const createBookingSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    customerPhone: z
      .string()
      .trim()
      .min(10, 'Please enter a valid 10-digit mobile number')
      .max(15, 'Mobile number cannot exceed 15 digits')
      .regex(/^[0-9+\s\-()]+$/, 'Please enter a valid phone number'),
    customerEmail: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .optional()
      .nullable()
      .or(z.literal('')),
    pickupLocation: z
      .string()
      .trim()
      .min(3, 'Pickup location must be at least 3 characters')
      .max(200, 'Pickup location cannot exceed 200 characters'),
    dropLocation: z
      .string()
      .trim()
      .min(3, 'Destination/drop location must be at least 3 characters')
      .max(200, 'Drop location cannot exceed 200 characters'),
    pickupDatetime: z.string().min(1, 'Pickup date and time is required'),
    returnDatetime: z.string().optional().nullable().or(z.literal('')),
    tripType: tripTypeSchema.default('ONE_WAY'),
    passengerCount: z
      .number({ invalid_type_error: 'Passenger count must be a number' })
      .int('Passenger count must be a whole number')
      .min(1, 'At least 1 passenger is required')
      .max(60, 'Maximum 60 passengers allowed per vehicle booking'),
    vehicleId: z.string().uuid().optional().nullable().or(z.literal('')),
    customerNotes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      const pickup = new Date(data.pickupDatetime);
      return !isNaN(pickup.getTime());
    },
    {
      message: 'Invalid pickup date and time format',
      path: ['pickupDatetime'],
    }
  )
  .refine(
    (data) => {
      if (data.tripType === 'ROUND_TRIP') {
        if (!data.returnDatetime) return false;
        const pickup = new Date(data.pickupDatetime);
        const ret = new Date(data.returnDatetime);
        return !isNaN(ret.getTime()) && ret.getTime() >= pickup.getTime();
      }
      return true;
    },
    {
      message: 'Return date & time must be after or equal to pickup date & time',
      path: ['returnDatetime'],
    }
  );

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
