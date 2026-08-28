import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { applyRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  bookingRef: z.string().min(1, 'Booking reference is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  rawResponse: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  // Rate limiting check
  const rateLimitResponse = applyRateLimit(
    request,
    'POST_payment_verify',
    RATE_LIMIT_CONFIGS.PAYMENT_OPERATIONS
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = verifyPaymentSchema.parse(body);

    const result = await PaymentService.verifyPayment(validatedData);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        paymentId: result.payment?.id,
        status: result.payment?.status,
        amount: result.payment?.amount,
        balanceRemaining: result.balanceRemaining,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
