import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { getCurrentAdminSession } from '@/lib/auth';
import { z } from 'zod';

const verifyAdminPaymentSchema = z.object({
  adminNotes: z.string().max(500).optional(),
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

    let adminNotes: string | undefined = undefined;
    try {
      const body = await request.json();
      const parsed = verifyAdminPaymentSchema.parse(body);
      adminNotes = parsed.adminNotes;
    } catch {
      // Body is optional
    }

    const result = await PaymentService.verifyPaymentByAdmin(
      params.id,
      session.id,
      adminNotes
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        paymentId: result.payment.id,
        status: result.payment.status,
        amount: result.payment.amount,
        balanceRemaining: result.balanceRemaining,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to verify payment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
