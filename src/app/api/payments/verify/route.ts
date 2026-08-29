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
    console.error('[VerifyPayment] Error:', error instanceof Error ? error.message : error);

    let customerMessage = 'Payment verification failed';
    if (error instanceof z.ZodError) {
      customerMessage = error.errors[0]?.message || 'Invalid payment verification parameters';
    } else if (error instanceof Error) {
      const msg = error.message;
      if (
        !msg.includes('Prisma') &&
        !msg.includes('connect') &&
        !msg.includes('DATABASE') &&
        !msg.includes('password')
      ) {
        customerMessage = msg;
      }
    }

    return NextResponse.json(
      { success: false, error: customerMessage },
      { status: 400 }
    );
  }
}
