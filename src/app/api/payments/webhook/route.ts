import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transactionRef = body.transactionRef || body.payload?.payment?.entity?.notes?.transactionRef;
    if (!transactionRef) {
      return NextResponse.json(
        { success: false, error: 'Transaction reference missing' },
        { status: 400 }
      );
    }

    const updatedPayment = await PaymentService.markPaymentPaid(transactionRef, body);

    return NextResponse.json({
      success: true,
      message: 'Payment captured and reconciled successfully',
      data: {
        transactionRef: updatedPayment.transactionRef,
        status: updatedPayment.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
