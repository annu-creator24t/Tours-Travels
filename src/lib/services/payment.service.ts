import prisma from '@/lib/db';
import { PaymentStatus, PaymentType } from '@prisma/client';

export interface CreateOrderParams {
  bookingRef: string;
  amount: number;
  paymentType: PaymentType;
}

export class PaymentService {
  /**
   * Generates or records a payment order for a booking
   */
  static async createPaymentRecord(params: CreateOrderParams) {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: params.bookingRef },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const transactionRef = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionRef,
        amount: params.amount,
        paymentType: params.paymentType,
        status: PaymentStatus.PENDING,
        gatewayName: process.env.RAZORPAY_KEY_ID ? 'RAZORPAY' : 'MANUAL_UPI',
      },
    });
  }

  /**
   * Updates payment status on confirmation/webhook
   */
  static async markPaymentPaid(
    transactionRef: string,
    gatewayResponse?: Record<string, unknown>
  ) {
    const payment = await prisma.payment.findUnique({
      where: { transactionRef },
      include: { booking: true },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        gatewayResponse: gatewayResponse ? (gatewayResponse as object) : undefined,
      },
    });

    // If advance payment was made, ensure booking is marked CONFIRMED
    if (payment.paymentType === PaymentType.ADVANCE) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    return updatedPayment;
  }
}
