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
    this.keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.PAYMENT_GATEWAY_KEY_ID ||
      '';
    this.keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.PAYMENT_GATEWAY_KEY_SECRET ||
      '';
    this.webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET ||
      this.keySecret;
  }

  /**
   * Indicates whether payment credentials have been configured
   */
  isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  /**
   * Detects if Razorpay test mode keys (rzp_test_*) are configured
   */
  isTestMode(): boolean {
    return this.keyId.startsWith('rzp_test_');
  }

  async createOrder(params: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<GatewayOrderResult> {
    if (params.amount <= 0) {
      throw new Error('Order amount must be greater than zero');
    }

    // Safety guard: Alert in logs if test mode keys are active in production
    if (process.env.NODE_ENV === 'production' && this.isTestMode()) {
      console.warn(
        '[PAYMENT SECURITY WARNING] Razorpay test credentials (rzp_test_*) detected in production environment.'
      );
    }

    // Generate safe order ID with timestamp & high-entropy suffix
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      orderId,
      amount: params.amount,
      currency: params.currency || 'INR',
      gatewayName: this.keyId ? 'RAZORPAY' : 'MODULAR_UPI',
      keyId: this.keyId || undefined,
      notes: params.notes,
    };
  }

  /**
   * Cryptographically verifies HMAC-SHA256 signature.
   * Fails safely if secret is not configured or parameters are missing.
   */
  verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!params.orderId || !params.paymentId || !params.signature || !this.keySecret) {
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
   * Cryptographically validates Webhook signature.
   * Fails safely if webhook secret is not configured or payload is missing.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!rawBody || !signature || !this.webhookSecret) return false;

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

