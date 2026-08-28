import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { z } from 'zod';

const createAdvanceOrderSchema = z.object({
  bookingRef: z.string().min(1, 'Booking reference is required'),
});

export async function POST(request: Request) {
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
    const message =
      error instanceof Error ? error.message : 'Failed to create payment order';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
