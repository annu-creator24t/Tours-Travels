import prisma from '@/lib/db';
import { PaymentStatus, PaymentType, Prisma } from '@prisma/client';
import { paymentGateway } from './payment-gateway.provider';

export interface VerifyPaymentInput {
  bookingRef: string;
  orderId: string;
  paymentId: string;
  signature: string;
  rawResponse?: Record<string, unknown>;
}


export class PaymentService {
  /**
   * Generates an advance payment order for a confirmed booking.
   * Payment is ONLY available after the booking has been confirmed by admin with an advance quote.
   */
  static async createAdvanceOrder(bookingRef: string) {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // 1. Availability check: Booking must be CONFIRMED
    if (booking.status !== 'CONFIRMED') {
      throw new Error(
        'Advance payment is only available for confirmed bookings. Please wait for admin approval.'
      );
    }

    // 2. Advance amount check
    const advanceAmount = Number(booking.advanceAmount || 0);
    if (advanceAmount <= 0) {
      throw new Error(
        'No advance payment amount has been configured by the admin for this booking.'
      );
    }

    const finalPrice = Number(booking.finalPrice || booking.estimatedPrice);
    if (advanceAmount > finalPrice) {
      throw new Error(
        `Advance amount (₹${advanceAmount}) cannot exceed total booking quote (₹${finalPrice}).`
      );
    }

    // 3. Duplicate payment prevention: Check if already paid
    const existingPaid = booking.payments.find(
      (p) => p.paymentType === PaymentType.ADVANCE && p.status === PaymentStatus.PAID
    );

    if (existingPaid) {
      throw new Error('Advance payment for this booking has already been completed.');
    }

    // 4. Create Gateway Order
    const gatewayOrder = await paymentGateway.createOrder({
      amount: advanceAmount,
      currency: 'INR',
      receipt: booking.bookingRef,
      notes: {
        bookingRef: booking.bookingRef,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
      },
    });

    // 5. Store / Upsert Pending Payment record in Database
    const existingPendingPayment = booking.payments.find(
      (p) => p.paymentType === PaymentType.ADVANCE && p.status === PaymentStatus.PENDING
    );

    let paymentRecord;
    if (existingPendingPayment) {
      paymentRecord = await prisma.payment.update({
        where: { id: existingPendingPayment.id },
        data: {
          transactionRef: gatewayOrder.orderId,
          amount: advanceAmount,
          status: PaymentStatus.PENDING,
          gatewayName: gatewayOrder.gatewayName,
        },
      });
    } else {
      paymentRecord = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          transactionRef: gatewayOrder.orderId,
          amount: advanceAmount,
          paymentType: PaymentType.ADVANCE,
          status: PaymentStatus.PENDING,
          gatewayName: gatewayOrder.gatewayName,
        },
      });
    }

    return {
      orderId: gatewayOrder.orderId,
      amount: advanceAmount,
      currency: gatewayOrder.currency,
      keyId: gatewayOrder.keyId,
      bookingRef: booking.bookingRef,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail || undefined,
      paymentId: paymentRecord.id,
    };
  }

  /**
   * Cryptographically verifies payment signature on backend and updates records safely.
   * NEVER marks payment as paid based only on client response without cryptographic check.
   */
  static async verifyPayment(input: VerifyPaymentInput) {
    const { bookingRef, orderId, paymentId, signature, rawResponse } = input;

    // 1. Cryptographic HMAC verification
    const isValid = paymentGateway.verifySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      // Mark matching payment record as FAILED if invalid signature
      await prisma.payment.updateMany({
        where: { transactionRef: orderId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
      throw new Error('Payment verification failed: Invalid signature');
    }

    // 2. Atomic Transaction: Record payment & update booking
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { bookingRef },
        include: { payments: true },
      });

      if (!booking) {
        throw new Error('Booking not found during verification');
      }

      // Check if already paid (prevent duplicate processing)
      const payment = await tx.payment.findFirst({
        where: {
          bookingId: booking.id,
          transactionRef: orderId,
        },
      });

      if (!payment) {
        throw new Error('Payment order record not found');
      }

      if (payment.status === PaymentStatus.PAID) {
        return { success: true, message: 'Payment already processed', payment };
      }

      // Update payment record to PAID
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          gatewayResponse: {
            paymentId,
            orderId,
            verifiedAt: new Date().toISOString(),
            ...rawResponse,
          },
        },
      });

      // Re-calculate balance on booking
      const totalPaid = await tx.payment.aggregate({
        where: {
          bookingId: booking.id,
          status: PaymentStatus.PAID,
        },
        _sum: { amount: true },
      });

      const totalPaidSum = Number(totalPaid._sum.amount || 0);
      const finalPrice = Number(booking.finalPrice || booking.estimatedPrice);
      const newBalance = Math.max(0, finalPrice - totalPaidSum);

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          balanceAmount: newBalance,
          status: 'CONFIRMED',
        },
      });

      return {
        success: true,
        message: 'Advance payment verified and credited successfully',
        payment: updatedPayment,
        balanceRemaining: newBalance,
      };
    });
  }

  /**
   * Processes gateway webhook event with cryptographic verification,
   * amount check, idempotency, and atomic transaction updates.
   */
  static async handleWebhook(rawBody: string, signature: string) {
    // 1. Verify Webhook Signature
    const isValid = paymentGateway.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new Error('Unauthorized webhook: Signature verification failed');
    }

    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new Error('Invalid JSON webhook payload');
    }

    const eventType = (event.event as string) || '';

    // Handle payment captured / order paid webhook events
    if (eventType === 'payment.captured' || eventType === 'order.paid' || eventType === 'payment.authorized') {
      const payloadObj = (event.payload as Record<string, Record<string, Record<string, unknown>>>) || {};
      const paymentEntity = payloadObj.payment?.entity;
      const orderEntity = payloadObj.order?.entity;

      const orderId = (paymentEntity?.order_id as string) || (orderEntity?.id as string) || '';
      const paymentId = (paymentEntity?.id as string) || `pay_${Date.now()}`;

      if (!orderId) {
        return { received: true, ignored: true, reason: 'Missing order_id in webhook payload' };
      }

      return prisma.$transaction(async (tx) => {
        // Find matching pending payment record
        const payment = await tx.payment.findFirst({
          where: { transactionRef: orderId },
          include: { booking: true },
        });

        if (!payment) {
          throw new Error(`Payment order record with reference ${orderId} not found`);
        }

        // Idempotency: If already marked as PAID, acknowledge without re-processing
        if (payment.status === PaymentStatus.PAID) {
          return {
            received: true,
            alreadyProcessed: true,
            paymentId: payment.id,
            bookingRef: payment.booking.bookingRef,
          };
        }

        // Amount verification: Validate webhook amount matches expected advance amount
        if (paymentEntity?.amount !== undefined) {
          const rawAmount = Number(paymentEntity.amount);
          // Gateways like Razorpay send amount in smallest currency unit (paise)
          const parsedAmount = rawAmount > Number(payment.amount) * 10 ? rawAmount / 100 : rawAmount;

          if (parsedAmount !== Number(payment.amount)) {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.FAILED,
                gatewayResponse: {
                  error: 'Amount mismatch',
                  expected: Number(payment.amount),
                  received: parsedAmount,
                  webhookEvent: eventType,
                  receivedAt: new Date().toISOString(),
                },
              },
            });
            throw new Error(
              `Webhook amount mismatch: Expected ₹${Number(payment.amount)}, but received ₹${parsedAmount}`
            );
          }
        }

        // Mark payment as PAID
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            gatewayResponse: {
              webhookEvent: eventType,
              gatewayPaymentId: paymentId,
              orderId,
              verifiedAt: new Date().toISOString(),
              payload: event as Prisma.InputJsonObject,
            } as Prisma.InputJsonObject,
          },
        });


        // Recalculate booking balance
        const totalPaid = await tx.payment.aggregate({
          where: {
            bookingId: payment.bookingId,
            status: PaymentStatus.PAID,
          },
          _sum: { amount: true },
        });

        const totalPaidSum = Number(totalPaid._sum.amount || 0);
        const finalPrice = Number(payment.booking.finalPrice || payment.booking.estimatedPrice);
        const newBalance = Math.max(0, finalPrice - totalPaidSum);

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            balanceAmount: newBalance,
            status: 'CONFIRMED',
          },
        });


        return {
          received: true,
          success: true,
          paymentId: updatedPayment.id,
          bookingRef: payment.booking.bookingRef,
          balanceRemaining: newBalance,
        };
      });
    }

    return { received: true, status: 'acknowledged', eventType };
  }

}
