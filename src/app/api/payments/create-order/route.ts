import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { applyRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { z } from 'zod';

const createAdvanceOrderSchema = z.object({
  bookingRef: z.string().min(1, 'Booking reference is required'),
});

export async function POST(request: Request) {
  // Rate limiting check
  const rateLimitResponse = applyRateLimit(
    request,
    'POST_payment_create_order',
    RATE_LIMIT_CONFIGS.PAYMENT_OPERATIONS
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { bookingRef } = createAdvanceOrderSchema.parse(body);

    const orderData = await PaymentService.createAdvanceOrder(bookingRef);

    return NextResponse.json({
      success: true,
      message: 'Advance payment order created successfully',
      data: orderData,
    });
  } catch (error: unknown) {
    console.error('[CreatePaymentOrder] Error:', error instanceof Error ? error.message : error);

    let customerMessage = 'Failed to create payment order';
    if (error instanceof z.ZodError) {
      customerMessage = error.errors[0]?.message || 'Invalid booking reference';
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
