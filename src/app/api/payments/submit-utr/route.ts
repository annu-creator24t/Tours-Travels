import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { applyRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { z } from 'zod';

const submitUtrSchema = z.object({
  bookingRef: z.string().min(1, 'Booking reference is required'),
  utr: z
    .string()
    .min(6, 'UTR / Transaction reference must be at least 6 characters')
    .max(35, 'UTR / Transaction reference cannot exceed 35 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'UTR / Transaction reference must contain only letters, numbers, hyphens, or underscores'),
  customerNotes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  // Rate limiting check
  const rateLimitResponse = applyRateLimit(
    request,
    'POST_payment_submit_utr',
    RATE_LIMIT_CONFIGS.PAYMENT_OPERATIONS
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = submitUtrSchema.parse(body);

    const result = await PaymentService.submitUtrPayment({
      bookingRef: validatedData.bookingRef,
      utr: validatedData.utr,
      customerNotes: validatedData.customerNotes,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.payment,
    });
  } catch (error: unknown) {
    console.error('[SubmitUTR] Error:', error instanceof Error ? error.message : error);

    let customerMessage = 'Failed to submit payment reference';
    if (error instanceof z.ZodError) {
      customerMessage = error.errors[0]?.message || 'Invalid payment submission parameters';
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
