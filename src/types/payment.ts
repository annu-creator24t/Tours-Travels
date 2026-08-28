export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentType = 'ADVANCE' | 'BALANCE' | 'FULL' | 'REFUND';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  transactionRef?: string | null;
  gatewayName: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  gatewayResponse?: Record<string, unknown> | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
