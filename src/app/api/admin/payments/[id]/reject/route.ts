import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { getCurrentAdminSession } from '@/lib/auth';
import { z } from 'zod';

const rejectAdminPaymentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    let reason: string | undefined = undefined;
    try {
      const body = await request.json();
      const parsed = rejectAdminPaymentSchema.parse(body);
      reason = parsed.reason;
    } catch {
      // Body is optional
    }

    const result = await PaymentService.rejectPaymentByAdmin(
      params.id,
      reason,
      session.id
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        paymentId: result.payment.id,
        status: result.payment.status,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to reject payment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
