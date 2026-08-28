import crypto from 'crypto';

export interface GatewayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  gatewayName: string;
  keyId?: string;
  notes?: Record<string, string>;
}

export interface IPaymentGatewayProvider {
  createOrder(params: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<GatewayOrderResult>;

  verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean;

  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

/**
 * Modular Provider: Secure HMAC-SHA256 Standard & Razorpay Compatible Provider
 */
export class ModularPaymentProvider implements IPaymentGatewayProvider {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_public_key';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'dev_payment_gateway_secret_2026';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;
  }

  async createOrder(params: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<GatewayOrderResult> {
    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      orderId,
      amount: params.amount,
      currency: params.currency || 'INR',
      gatewayName: process.env.RAZORPAY_KEY_ID ? 'RAZORPAY' : 'MODULAR_UPI',
      keyId: this.keyId,
      notes: params.notes,
    };
  }

  /**
   * Cryptographically verifies HMAC-SHA256 signature
   */
  verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!params.orderId || !params.paymentId || !params.signature) {
      return false;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf8'),
        Buffer.from(params.signature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Cryptographically validates Webhook signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!rawBody || !signature) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(signature, 'utf8')
      );
    } catch {
      return false;
    }
  }
}

export const paymentGateway = new ModularPaymentProvider();
