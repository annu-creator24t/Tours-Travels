export type VehicleStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'ON_TRIP'
  | 'MAINTENANCE'
  | 'INACTIVE';

export interface VehicleImageItem {
  id: string;
  vehicleId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string | Date;
}

export interface VehicleItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  vehicleType: string;
  seatingCapacity: number;
  luggageCapacity: number;
  hasAc: boolean;
  fuelType: string;
  transmission?: string | null;
  perKmRate: number;
  baseDayRate: number;
  status: VehicleStatus;
  isFeatured: boolean;
  images?: VehicleImageItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AvailabilityBlockItem {
  id: string;
  vehicleId: string;
  startDatetime: string | Date;
  endDatetime: string | Date;
  reason: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
