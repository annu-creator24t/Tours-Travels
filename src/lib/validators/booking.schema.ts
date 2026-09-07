import { z } from 'zod';
import {
  parseDateTime,
  validateTravelDateTime,
  validateReturnDateTime,
} from '@/lib/utils/date';

export const tripTypeSchema = z.enum(['ONE_WAY', 'ROUND_TRIP', 'LOCAL_RENTAL']);

export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
]);

// Phone number regex: matches Indian numbers (10 digits starting with 6-9, optional +91/91/0 prefix) or international E.164
const phoneRegex = /^(?:(?:\+|0{0,2})91|0)?[6-9]\d{9}$|^\+[1-9]\d{7,14}$/;

export const createBookingSchema = z
  .object({
    customerName: z
      .string({ required_error: 'Customer name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    customerPhone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .min(10, 'Please enter a valid phone number (at least 10 digits)')
      .max(20, 'Phone number cannot exceed 20 characters')
      .refine(
        (val) => {
          const cleaned = val.replace(/[\s\-()]/g, '');
          return phoneRegex.test(cleaned);
        },
        {
          message: 'Please enter a valid mobile number (e.g. 10-digit starting with 6, 7, 8, or 9, or international + format)',
        }
      ),
    customerEmail: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .optional()
      .nullable()
      .or(z.literal('')),
    pickupLocation: z
      .string({ required_error: 'Pickup location is required' })
      .trim()
      .min(3, 'Pickup location must be at least 3 characters')
      .max(200, 'Pickup location cannot exceed 200 characters'),
    dropLocation: z
      .string({ required_error: 'Drop location/destination is required' })
      .trim()
      .min(3, 'Destination/drop location must be at least 3 characters')
      .max(200, 'Drop location cannot exceed 200 characters'),
    pickupDatetime: z.string({ required_error: 'Pickup date and time is required' }).min(1, 'Pickup date and time is required'),
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
      const parsed = parseDateTime(data.pickupDatetime);
      return parsed !== null && !isNaN(parsed.getTime());
    },
    {
      message: 'Invalid pickup date and time format',
      path: ['pickupDatetime'],
    }
  )
  .refine(
    (data) => {
      const res = validateTravelDateTime(data.pickupDatetime);
      return res.isValid;
    },
    (data) => {
      const res = validateTravelDateTime(data.pickupDatetime);
      return {
        message: res.error || 'Pickup date and time cannot be in the past',
        path: ['pickupDatetime'],
      };
    }
  )
  .refine(
    (data) => {
      const res = validateReturnDateTime(
        data.pickupDatetime,
        data.returnDatetime,
        data.tripType === 'ROUND_TRIP'
      );
      return res.isValid;
    },
    (data) => {
      const res = validateReturnDateTime(
        data.pickupDatetime,
        data.returnDatetime,
        data.tripType === 'ROUND_TRIP'
      );
      return {
        message:
          res.error ||
          'Return date and time must be after or equal to pickup date and time',
        path: ['returnDatetime'],
      };
    }
  );

export const updateBookingStatusSchema = z
  .object({
    status: bookingStatusSchema,
    vehicleId: z.string().uuid().optional().nullable().or(z.literal('')),
    driverId: z.string().uuid().optional().nullable().or(z.literal('')),
    finalPrice: z
      .number({ invalid_type_error: 'Final price must be a number' })
      .min(0, 'Final quote price cannot be negative')
      .optional()
      .nullable(),
    advanceAmount: z
      .number({ invalid_type_error: 'Advance amount must be a number' })
      .min(0, 'Advance amount cannot be negative')
      .optional()
      .nullable(),
    balanceAmount: z
      .number({ invalid_type_error: 'Balance amount must be a number' })
      .min(0, 'Balance amount cannot be negative')
      .optional()
      .nullable(),
    adminNotes: z
      .string()
      .max(1000, 'Admin notes cannot exceed 1000 characters')
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (
        data.finalPrice !== undefined &&
        data.finalPrice !== null &&
        data.advanceAmount !== undefined &&
        data.advanceAmount !== null
      ) {
        return data.advanceAmount <= data.finalPrice;
      }
      return true;
    },
    {
      message: 'Advance amount cannot be greater than the final quote price',
      path: ['advanceAmount'],
    }
  );

export const cancelBookingCustomerSchema = z.object({
  customerPhone: z
    .string({ required_error: 'Registered mobile number is required for verification' })
    .trim()
    .min(1, 'Phone number is required for cancellation verification'),
  reason: z
    .string()
    .trim()
    .max(500, 'Cancellation reason cannot exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingCustomerInput = z.infer<typeof cancelBookingCustomerSchema>;
