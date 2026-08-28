import { z } from 'zod';

export const vehicleStatusSchema = z.enum([
  'AVAILABLE',
  'BOOKED',
  'ON_TRIP',
  'MAINTENANCE',
  'INACTIVE',
]);

export const createVehicleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brand: z.string().min(2, 'Brand must be at least 2 characters'),
  vehicleType: z.string().min(2, 'Vehicle type is required (e.g. Sedan, SUV)'),
  seatingCapacity: z.number().int().min(1).max(50),
  luggageCapacity: z.number().int().min(0).max(50),
  hasAc: z.boolean().default(true),
  fuelType: z.string().min(2, 'Fuel type is required'),
  transmission: z.string().optional().nullable(),
  perKmRate: z.number().positive('Per-KM rate must be positive'),
  baseDayRate: z.number().positive('Base day rate must be positive'),
  status: vehicleStatusSchema.default('AVAILABLE'),
  isFeatured: z.boolean().default(false),
  imageUrls: z.array(z.string().url()).optional().default([]),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
