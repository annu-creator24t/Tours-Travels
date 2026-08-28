import { z } from 'zod';

export const driverStatusSchema = z.enum([
  'AVAILABLE',
  'ON_TRIP',
  'OFF_DUTY',
  'INACTIVE',
]);

export const createDriverSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Driver name must be at least 2 characters')
    .max(100, 'Driver name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(10, 'Valid phone number is required (at least 10 digits)')
    .regex(/^[+0-9\s-]{10,20}$/, 'Invalid phone number format'),
  licenseNumber: z
    .string()
    .trim()
    .min(5, 'License number must be at least 5 characters')
    .max(50, 'License number cannot exceed 50 characters'),
  experienceYears: z
    .number({ invalid_type_error: 'Experience must be a number' })
    .int('Experience must be an integer')
    .min(0, 'Experience cannot be negative')
    .max(60, 'Experience cannot exceed 60 years'),
  status: driverStatusSchema.default('AVAILABLE'),
});

export const updateDriverSchema = createDriverSchema.partial();

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

