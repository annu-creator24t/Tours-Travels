/**
 * Central UPI Payment Configuration
 * Jay Maa Sheetala Tours & Travel
 *
 * Provides configurable placeholder parameters for manual UPI payment flow.
 * No real payment gateway credentials or live UPI keys are stored in source code.
 */

export interface UpiConfig {
  upiId: string;
  displayName: string;
  qrCodeImageUrl: string;
  merchantCode?: string;
  instructions: string[];
}

export const upiConfig: UpiConfig = {
  // Placeholder UPI VPA address
  upiId: process.env.NEXT_PUBLIC_UPI_ID || 'UPI_ID_PLACEHOLDER',

  // Registered Business Display Name
  displayName:
    process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ||
    'Jay Maa Sheetala Tours & Travel',

  // Placeholder QR Code Image path
  qrCodeImageUrl:
    process.env.NEXT_PUBLIC_UPI_QR_IMAGE || '/images/upi-qr-placeholder.png',

  // Optional Merchant Category Code
  merchantCode: process.env.NEXT_PUBLIC_UPI_MCC || '4722',

  instructions: [
    'Scan the QR code or use the UPI ID above in any UPI app (GPay, PhonePe, Paytm, BHIM, etc.).',
    'Enter the exact Advance Amount specified for your confirmed booking.',
    'Note down the 12-digit UTR (Unique Transaction Reference) / Transaction ID from your payment receipt.',
    'Enter your UTR number below and click "Submit Payment Proof".',
    'Our operations team will verify the payment and confirm your vehicle reservation.',
  ],
};

export default upiConfig;
