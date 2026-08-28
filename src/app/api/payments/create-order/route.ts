import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { PaymentType } from '@prisma/client';
import { z } from 'zod';

const createOrderSchema = z.object({
  bookingRef: z.string().min(1, 'Booking reference is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentType: z.enum(['ADVANCE', 'BALANCE', 'FULL', 'REFUND']).default('ADVANCE'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const paymentRecord = await PaymentService.createPaymentRecord({
      bookingRef: validatedData.bookingRef,
      amount: validatedData.amount,
      paymentType: validatedData.paymentType as PaymentType,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment order initiated',
      data: {
        transactionRef: paymentRecord.transactionRef,
        amount: paymentRecord.amount,
        gatewayName: paymentRecord.gatewayName,
        status: paymentRecord.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payment order';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
