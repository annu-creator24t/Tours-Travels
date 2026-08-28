export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentType = 'ADVANCE' | 'FULL' | 'BALANCE';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  transactionRef: string;
  gatewayName: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  createdAt: string | Date;
}
