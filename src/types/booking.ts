export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type TripType = 'ONE_WAY' | 'ROUND_TRIP' | 'LOCAL_RENTAL';

export interface BookingItem {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  pickupLocation: string;
  dropLocation: string;
  pickupDatetime: string | Date;
  returnDatetime?: string | Date | null;
  tripType: TripType;
  passengerCount: number;
  vehicleId?: string | null;
  driverId?: string | null;
  status: BookingStatus;
  estimatedPrice: number;
  finalPrice?: number | null;
  advanceAmount?: number | null;
  balanceAmount?: number | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  createdAt: string | Date;
}
