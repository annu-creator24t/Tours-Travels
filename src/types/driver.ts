export type DriverStatus =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'OFF_DUTY'
  | 'INACTIVE';

export interface DriverItem {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  status: DriverStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}
