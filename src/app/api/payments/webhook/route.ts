import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-razorpay-signature') ||
      request.headers.get('x-payment-signature') ||
      '';

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing webhook signature header' },
        { status: 401 }
      );
    }

    const result = await PaymentService.handleWebhook(rawBody, signature);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to process webhook';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
