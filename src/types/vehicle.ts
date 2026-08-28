export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'ON_TRIP' | 'MAINTENANCE' | 'INACTIVE';

export interface VehicleImageItem {
  id: string;
  vehicleId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
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
  perKmRate: number;
  baseDayRate: number;
  status: VehicleStatus;
  isFeatured: boolean;
  images?: VehicleImageItem[];
  createdAt: string | Date;
}
