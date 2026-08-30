import prisma from '@/lib/db';
import { PaymentStatus, PaymentType, Prisma } from '@prisma/client';
import { paymentGateway } from './payment-gateway.provider';
import { EmailService } from './email.service';

export interface VerifyPaymentInput {
  bookingRef: string;
  orderId: string;
  paymentId: string;
  signature: string;
  rawResponse?: Record<string, unknown>;
}

export interface SubmitUtrInput {
  bookingRef: string;
  utr: string;
  customerNotes?: string;
}

export class PaymentService {
  /**
   * Submits a customer-provided UPI UTR / Transaction Reference for a confirmed booking.
   * - Validates booking existence and confirmed status.
   * - Validates advance amount is set and not already paid.
   * - Enforces non-empty, alphanumeric, standard length UTR.
   * - Prevents duplicate UTR submissions across all bookings.
   * - Creates or updates the payment record in PENDING status.
   * - NEVER marks payment as PAID automatically.
   */
  static async submitUtrPayment(input: SubmitUtrInput) {
    const { bookingRef, utr, customerNotes } = input;

    // 1. Sanitize & validate UTR format
    const sanitizedUtr = utr ? utr.trim().toUpperCase() : '';
    if (!sanitizedUtr) {
      throw new Error('Please provide a valid UTR / Transaction Reference number.');
    }

    if (sanitizedUtr.length < 6 || sanitizedUtr.length > 35) {
      throw new Error('UTR / Transaction ID must be between 6 and 35 characters.');
    }

    // Standard alphanumeric and hyphen/slash check
    if (!/^[A-Z0-9\-_]+$/i.test(sanitizedUtr)) {
      throw new Error('UTR / Transaction ID must contain only alphanumeric characters, dashes, or underscores.');
    }

    // 2. Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: bookingRef.trim() },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking #${bookingRef} not found.`);
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error(
        'Payment submission is only available for confirmed bookings. Please await admin confirmation.'
      );
    }

    const advanceAmount = Number(booking.advanceAmount || 0);
    if (advanceAmount <= 0) {
      throw new Error(
        'No advance payment quote has been set by the coordinator for this booking.'
      );
    }

    // 3. Check if advance payment is already PAID
    const existingPaid = booking.payments.find(
      (p) => p.paymentType === PaymentType.ADVANCE && p.status === PaymentStatus.PAID
    );
    if (existingPaid) {
      throw new Error('Advance payment for this booking has already been verified and marked as PAID.');
    }

    // 4. Duplicate UTR check: Ensure this UTR is not already used in any OTHER payment record
    const existingUtrPayment = await prisma.payment.findFirst({
      where: {
        transactionRef: sanitizedUtr,
        status: { in: [PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
      },
      include: { booking: true },
    });

    if (existingUtrPayment && existingUtrPayment.bookingId !== booking.id) {
      throw new Error(
        `This UTR reference (${sanitizedUtr}) has already been registered for another booking. Please verify your transaction receipt.`
      );
    }

    // 5. Atomic Upsert of pending payment record
    const existingPendingPayment = booking.payments.find(
      (p) => p.paymentType === PaymentType.ADVANCE && p.status === PaymentStatus.PENDING
    );

    let paymentRecord;
    const metadata: Prisma.InputJsonObject = {
      utr: sanitizedUtr,
      submittedAt: new Date().toISOString(),
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerNotes: customerNotes?.trim() || null,
      submissionType: 'MANUAL_UPI_UTR',
    };

    if (existingPendingPayment) {
      paymentRecord = await prisma.payment.update({
        where: { id: existingPendingPayment.id },
        data: {
          transactionRef: sanitizedUtr,
          amount: advanceAmount,
          status: PaymentStatus.PENDING,
          gatewayName: 'MANUAL_UPI',
          gatewayResponse: metadata,
        },
      });
    } else {
      paymentRecord = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          transactionRef: sanitizedUtr,
          amount: advanceAmount,
          paymentType: PaymentType.ADVANCE,
          status: PaymentStatus.PENDING,
          gatewayName: 'MANUAL_UPI',
          gatewayResponse: metadata,
        },
      });
    }

    return {
      success: true,
      message: 'Payment proof submitted successfully. Your transaction will be verified by our operations team.',
      payment: {
        id: paymentRecord.id,
        bookingRef: booking.bookingRef,
        transactionRef: paymentRecord.transactionRef,
        amount: Number(paymentRecord.amount),
        status: paymentRecord.status,
        createdAt: paymentRecord.createdAt,
      },
    };
  }

  /**
   * Admin: Verifies a submitted manual UPI payment and marks it as PAID.
   * - Performs atomic database transaction.
   * - Recalculates booking balanceAmount.
   * - Dispatches payment success email.
   */
  static async verifyPaymentByAdmin(paymentId: string, adminId?: string, adminNotes?: string) {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              vehicle: true,
              driver: true,
              payments: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment record not found.');
      }

      if (payment.status === PaymentStatus.PAID) {
        return {
          success: true,
          message: 'Payment is already marked as PAID.',
          payment,
          booking: payment.booking,
          newlyVerified: false,
        };
      }

      if (payment.booking.status === 'CANCELLED' || payment.booking.status === 'REJECTED') {
        throw new Error(`Cannot verify payment for a ${payment.booking.status.toLowerCase()} booking.`);
      }

      const existingResponse =
        (payment.gatewayResponse as Record<string, unknown>) || {};

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          gatewayResponse: {
            ...existingResponse,
            verifiedByAdminId: adminId || 'ADMIN',
            verifiedAt: new Date().toISOString(),
            adminVerificationNotes: adminNotes || null,
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

      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          balanceAmount: newBalance,
          status: 'CONFIRMED',
        },
        include: {
          vehicle: true,
          driver: true,
          payments: true,
        },
      });

      return {
        success: true,
        message: 'Payment verified and marked as PAID successfully.',
        payment: updatedPayment,
        booking: updatedBooking,
        balanceRemaining: newBalance,
        newlyVerified: true,
      };
    });

    // Dispatch non-blocking email notification if newly verified
    if (result.newlyVerified && result.booking) {
      EmailService.sendPaymentSuccess({
        bookingRef: result.booking.bookingRef,
        customerName: result.booking.customerName,
        customerEmail: result.booking.customerEmail,
        customerPhone: result.booking.customerPhone,
        vehicleName: result.booking.vehicle?.name,
        vehicleType: result.booking.vehicle?.vehicleType,
        pickupLocation: result.booking.pickupLocation,
        dropLocation: result.booking.dropLocation,
        pickupDatetime: result.booking.pickupDatetime,
        returnDatetime: result.booking.returnDatetime,
        status: 'CONFIRMED',
        finalPrice: result.booking.finalPrice || result.booking.estimatedPrice,
        advanceAmount: result.payment.amount,
        balanceAmount: result.balanceRemaining,
        isAdvancePaid: true,
        paymentRef: result.payment.transactionRef || result.payment.id,
      }).catch((err) => {
        console.error('[PaymentService] Failed to dispatch payment success email:', err);
      });
    }

    return result;
  }

  /**
   * Admin: Rejects an invalid or unverified submitted payment.
   * - Marks payment status as FAILED.
   * - Stores rejection reason in gatewayResponse.
   * - Booking remains CONFIRMED so customer can submit a corrected UTR.
   */
  static async rejectPaymentByAdmin(paymentId: string, reason?: string, adminId?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new Error('Payment record not found.');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new Error('Cannot reject a payment that has already been verified as PAID.');
    }

    const existingResponse =
      (payment.gatewayResponse as Record<string, unknown>) || {};

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: {
          ...existingResponse,
          rejectedByAdminId: adminId || 'ADMIN',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason || 'Payment proof could not be verified in bank records.',
        } as Prisma.InputJsonObject,
      },
    });

    return {
      success: true,
      message: 'Payment rejected. Customer can now submit a corrected payment reference.',
      payment: updatedPayment,
    };
  }

  /**
   * Generates an advance payment order placeholder for a confirmed booking.
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

    if (booking.status !== 'CONFIRMED') {
      throw new Error(
        'Advance payment is only available for confirmed bookings. Please wait for admin approval.'
      );
    }

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

    const existingPaid = booking.payments.find(
      (p) => p.paymentType === PaymentType.ADVANCE && p.status === PaymentStatus.PAID
    );

    if (existingPaid) {
      throw new Error('Advance payment for this booking has already been completed.');
    }

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
   */
  static async verifyPayment(input: VerifyPaymentInput) {
    const { bookingRef, orderId, paymentId, signature, rawResponse } = input;

    const isValid = paymentGateway.verifySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      await prisma.payment.updateMany({
        where: { transactionRef: orderId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
      throw new Error('Payment verification failed: Invalid signature');
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { bookingRef },
        include: { payments: true, vehicle: true },
      });

      if (!booking) {
        throw new Error('Booking not found during verification');
      }

      if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
        throw new Error(`Cannot complete payment: Booking has been ${booking.status.toLowerCase()}.`);
      }

      const payment = await tx.payment.findFirst({
        where: {
          bookingId: booking.id,
          transactionRef: orderId,
        },
      });

      if (!payment) {
        throw new Error('Payment order record not found');
      }

      const expectedAdvance = Number(booking.advanceAmount || 0);
      if (expectedAdvance <= 0 || Number(payment.amount) !== expectedAdvance) {
        throw new Error('Payment record amount mismatch with booking advance quote.');
      }

      if (payment.status === PaymentStatus.PAID) {
        return { success: true, message: 'Payment already processed', payment, booking, newlyVerified: false };
      }

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
        booking,
        newlyVerified: true,
      };
    });

    if (result.newlyVerified && result.booking) {
      EmailService.sendPaymentSuccess({
        bookingRef: result.booking.bookingRef,
        customerName: result.booking.customerName,
        customerEmail: result.booking.customerEmail,
        customerPhone: result.booking.customerPhone,
        vehicleName: result.booking.vehicle?.name,
        vehicleType: result.booking.vehicle?.vehicleType,
        pickupLocation: result.booking.pickupLocation,
        dropLocation: result.booking.dropLocation,
        pickupDatetime: result.booking.pickupDatetime,
        returnDatetime: result.booking.returnDatetime,
        status: 'CONFIRMED',
        finalPrice: result.booking.finalPrice || result.booking.estimatedPrice,
        advanceAmount: result.payment.amount,
        balanceAmount: result.balanceRemaining,
        isAdvancePaid: true,
        paymentRef: paymentId,
      }).catch((err) => {
        console.error('[PaymentService] Failed to dispatch payment success email:', err);
      });
    }

    return {
      success: result.success,
      message: result.message,
      payment: result.payment,
      balanceRemaining: result.balanceRemaining,
    };
  }

  /**
   * Processes gateway webhook event with cryptographic verification.
   */
  static async handleWebhook(rawBody: string, signature: string) {
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

    if (eventType === 'payment.captured' || eventType === 'order.paid' || eventType === 'payment.authorized') {
      const payloadObj = (event.payload as Record<string, Record<string, Record<string, unknown>>>) || {};
      const paymentEntity = payloadObj.payment?.entity;
      const orderEntity = payloadObj.order?.entity;

      const orderId = (paymentEntity?.order_id as string) || (orderEntity?.id as string) || '';
      const paymentId = (paymentEntity?.id as string) || `pay_${Date.now()}`;

      if (!orderId) {
        return { received: true, ignored: true, reason: 'Missing order_id in webhook payload' };
      }

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { transactionRef: orderId },
          include: { booking: { include: { vehicle: true } } },
        });

        if (!payment) {
          throw new Error(`Payment order record with reference ${orderId} not found`);
        }

        if (payment.status === PaymentStatus.PAID) {
          return {
            received: true,
            alreadyProcessed: true,
            paymentId: payment.id,
            bookingRef: payment.booking.bookingRef,
          };
        }

        if (paymentEntity?.amount !== undefined) {
          const rawAmount = Number(paymentEntity.amount);
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
          booking: payment.booking,
          amount: updatedPayment.amount,
          newlyVerified: true,
        };
      });

      if (result.newlyVerified && result.booking) {
        EmailService.sendPaymentSuccess({
          bookingRef: result.booking.bookingRef,
          customerName: result.booking.customerName,
          customerEmail: result.booking.customerEmail,
          customerPhone: result.booking.customerPhone,
          vehicleName: result.booking.vehicle?.name,
          vehicleType: result.booking.vehicle?.vehicleType,
          pickupLocation: result.booking.pickupLocation,
          dropLocation: result.booking.dropLocation,
          pickupDatetime: result.booking.pickupDatetime,
          returnDatetime: result.booking.returnDatetime,
          status: 'CONFIRMED',
          finalPrice: result.booking.finalPrice || result.booking.estimatedPrice,
          advanceAmount: result.amount,
          balanceAmount: result.balanceRemaining,
          isAdvancePaid: true,
          paymentRef: paymentId,
        }).catch((err) => {
          console.error('[PaymentService] Failed to dispatch webhook payment success email:', err);
        });
      }

      return result;
    }

    if (eventType === 'payment.failed') {
      const payloadObj = (event.payload as Record<string, Record<string, Record<string, unknown>>>) || {};
      const paymentEntity = payloadObj.payment?.entity;
      const orderId = (paymentEntity?.order_id as string) || '';

      if (orderId) {
        await prisma.payment.updateMany({
          where: { transactionRef: orderId, status: PaymentStatus.PENDING },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: {
              webhookEvent: eventType,
              gatewayPaymentId: (paymentEntity?.id as string) || undefined,
              errorDescription: (paymentEntity?.error_description as string) || 'Payment failed at gateway',
              receivedAt: new Date().toISOString(),
            },
          },
        });
      }

      return { received: true, status: 'failed_recorded', orderId };
    }

    return { received: true, status: 'acknowledged', eventType };
  }
}
