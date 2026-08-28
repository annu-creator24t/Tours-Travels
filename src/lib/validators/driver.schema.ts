import { z } from 'zod';

export const driverStatusSchema = z.enum([
  'AVAILABLE',
  'ON_TRIP',
  'OFF_DUTY',
  'INACTIVE',
]);

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Driver name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid mobile number is required'),
  licenseNumber: z.string().min(5, 'License number is required'),
  experienceYears: z.number().int().min(0).max(50),
  status: driverStatusSchema.default('AVAILABLE'),
});

export const updateDriverSchema = createDriverSchema.partial();

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
