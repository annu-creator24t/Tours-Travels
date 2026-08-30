/**
 * Central UPI Payment Configuration
 * Jay Maa Sheetala Tours & Travel
 *
 * Configured with the Paytm UPI QR details for advance trip payments.
 * All payments are verified manually by admin before status transitions to PAID.
 */

export interface UpiConfig {
  upiId: string;
  displayName: string;
  qrCodeImageUrl: string;
  merchantCode?: string;
  instructions: string[];
}

export const upiConfig: UpiConfig = {
  // Official Business UPI VPA address
  upiId: process.env.NEXT_PUBLIC_UPI_ID || '9919379147@ptsbi',

  // Registered Payee Name on UPI QR
  displayName: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'Anmol Tiwari',

  // Real Paytm UPI QR Code Image path
  qrCodeImageUrl: process.env.NEXT_PUBLIC_UPI_QR_IMAGE || '/images/upi-qr.jpg',

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
