import nodemailer from 'nodemailer';

export type BookingEmailEvent =
  | 'CONFIRMATION'
  | 'PAYMENT_SUCCESS'
  | 'CANCELLATION'
  | 'COMPLETION';

export interface BookingEmailPayload {
  bookingRef: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  vehicleName?: string | null;
  vehicleType?: string | null;
  pickupLocation: string;
  dropLocation: string;
  pickupDatetime: Date | string;
  returnDatetime?: Date | string | null;
  status: string;
  finalPrice?: number | string | unknown;
  advanceAmount?: number | string | null | unknown;
  balanceAmount?: number | string | null | unknown;
  isAdvancePaid?: boolean;
  paymentRef?: string | null;
  cancellationReason?: string | null;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  mocked?: boolean;
  error?: string;
  recipient?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Checks if standard SMTP credentials are provided in environment variables
   */
  static isConfigured(): boolean {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    return Boolean(host && user && pass);
  }

  /**
   * Initializes or retrieves the singleton Nodemailer transporter
   */
  private static getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    if (!this.isConfigured()) {
      return null;
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      return this.transporter;
    } catch (err: unknown) {
      console.error(
        '[EmailService] Failed to initialize SMTP transporter:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      return null;
    }
  }

  /**
   * Formats a date/time string in Indian locale format
   */
  private static formatDateTime(dt: Date | string): string {
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return String(dt);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return String(dt);
    }
  }

  /**
   * Generates email subject line based on event and booking reference
   */
  private static getSubject(event: BookingEmailEvent, bookingRef: string): string {
    switch (event) {
      case 'CONFIRMATION':
        return `Booking Confirmed: #${bookingRef} — Jay Maa Sheetala Tours & Travel`;
      case 'PAYMENT_SUCCESS':
        return `Payment Receipt: Advance Verified for Booking #${bookingRef} — Jay Maa Sheetala Tours & Travel`;
      case 'CANCELLATION':
        return `Booking Cancelled: #${bookingRef} — Jay Maa Sheetala Tours & Travel`;
      case 'COMPLETION':
        return `Trip Completed: #${bookingRef} — Thank You from Jay Maa Sheetala Tours & Travel`;
      default:
        return `Booking Update: #${bookingRef} — Jay Maa Sheetala Tours & Travel`;
    }
  }

  /**
   * Generates plaintext version of the email for accessibility & non-HTML clients
   */
  private static generatePlainText(
    event: BookingEmailEvent,
    payload: BookingEmailPayload
  ): string {
    const company = 'Jay Maa Sheetala Tours & Travel';
    const formattedPickup = this.formatDateTime(payload.pickupDatetime);
    const formattedReturn = payload.returnDatetime
      ? this.formatDateTime(payload.returnDatetime)
      : 'N/A (One-way)';
    const vehicle = payload.vehicleName
      ? `${payload.vehicleName}${payload.vehicleType ? ` (${payload.vehicleType})` : ''}`
      : 'Standard Fleet Vehicle';

    const finalAmount = Number(payload.finalPrice || 0);
    const advancePaid = payload.isAdvancePaid
      ? Number(payload.advanceAmount || 0)
      : 0;
    const remainingBalance = Number(
      payload.balanceAmount !== undefined && payload.balanceAmount !== null
        ? payload.balanceAmount
        : Math.max(0, finalAmount - advancePaid)
    );

    const paymentStatus = payload.isAdvancePaid
      ? `PAID (Advance of ₹${advancePaid} received)`
      : payload.advanceAmount && Number(payload.advanceAmount) > 0
      ? `PENDING (Advance of ₹${payload.advanceAmount} due)`
      : 'PENDING';

    let eventHeader = '';
    if (event === 'CONFIRMATION') {
      eventHeader = 'Your booking has been officially CONFIRMED by our operations coordinator.';
    } else if (event === 'PAYMENT_SUCCESS') {
      eventHeader = 'Your advance payment has been successfully VERIFIED and credited.';
    } else if (event === 'CANCELLATION') {
      eventHeader = 'Your booking has been CANCELLED. Any allocated fleet and driver have been released.';
    } else if (event === 'COMPLETION') {
      eventHeader = 'Your trip has been marked as COMPLETED. Thank you for traveling with us!';
    }

    return `
============================================================
${company}
============================================================

Dear ${payload.customerName},

${eventHeader}

--- BOOKING DETAILS ---
Booking Reference: #${payload.bookingRef}
Customer Name: ${payload.customerName}
${payload.customerPhone ? `Contact Phone: ${payload.customerPhone}\n` : ''}Allocated Vehicle: ${vehicle}
Pickup Location: ${payload.pickupLocation}
Destination / Drop: ${payload.dropLocation}
Travel Date & Time: ${formattedPickup}
${payload.returnDatetime ? `Return Schedule: ${formattedReturn}\n` : ''}Booking Status: ${payload.status}

--- FINANCIAL SUMMARY ---
Total Amount / Quote: ₹${finalAmount}
Advance Paid: ₹${advancePaid}
Remaining Balance: ₹${remainingBalance}
Payment Status: ${paymentStatus}
${payload.paymentRef ? `Transaction Reference: ${payload.paymentRef}\n` : ''}${
      payload.cancellationReason
        ? `\nCancellation Reason: ${payload.cancellationReason}\n`
        : ''
    }
If you have any questions or need assistance, feel free to contact us.

Warm regards,
Jay Maa Sheetala Tours & Travel
Varanasi & Outstation Chauffeur Services
============================================================
`.trim();
  }

  /**
   * Generates clean, responsive HTML email template
   */
  private static generateHtml(
    event: BookingEmailEvent,
    payload: BookingEmailPayload
  ): string {
    const formattedPickup = this.formatDateTime(payload.pickupDatetime);
    const formattedReturn = payload.returnDatetime
      ? this.formatDateTime(payload.returnDatetime)
      : null;
    const vehicle = payload.vehicleName
      ? `${payload.vehicleName}${payload.vehicleType ? ` (${payload.vehicleType})` : ''}`
      : 'Standard Fleet Vehicle';

    const finalAmount = Number(payload.finalPrice || 0);
    const advancePaid = payload.isAdvancePaid
      ? Number(payload.advanceAmount || 0)
      : 0;
    const remainingBalance = Number(
      payload.balanceAmount !== undefined && payload.balanceAmount !== null
        ? payload.balanceAmount
        : Math.max(0, finalAmount - advancePaid)
    );

    let eventColor = '#2563eb'; // blue
    let eventTitle = 'Booking Status Update';
    let eventSubtext = 'Your reservation details have been updated.';
    let statusBadgeColor = '#dbeafe';
    let statusTextColor = '#1e40af';

    if (event === 'CONFIRMATION') {
      eventColor = '#059669'; // emerald
      eventTitle = 'Booking Confirmed';
      eventSubtext = 'Your booking has been reviewed and confirmed by our operations team.';
      statusBadgeColor = '#d1fae5';
      statusTextColor = '#065f46';
    } else if (event === 'PAYMENT_SUCCESS') {
      eventColor = '#0d9488'; // teal
      eventTitle = 'Advance Payment Verified';
      eventSubtext = 'Your advance deposit has been verified. Your trip schedule is secured!';
      statusBadgeColor = '#ccfbf1';
      statusTextColor = '#115e59';
    } else if (event === 'CANCELLATION') {
      eventColor = '#e11d48'; // rose
      eventTitle = 'Booking Cancelled';
      eventSubtext = 'This booking inquiry has been cancelled and fleet allocation released.';
      statusBadgeColor = '#ffe4e6';
      statusTextColor = '#9f1239';
    } else if (event === 'COMPLETION') {
      eventColor = '#4f46e5'; // indigo
      eventTitle = 'Trip Completed';
      eventSubtext = 'Your journey has concluded. Thank you for choosing Jay Maa Sheetala Tours & Travel!';
      statusBadgeColor = '#e0e7ff';
      statusTextColor = '#3730a3';
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingUrl = `${appUrl}/booking/${encodeURIComponent(payload.bookingRef)}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${this.getSubject(event, payload.bookingRef)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .hero { background: ${eventColor}; padding: 24px; color: #ffffff; text-align: center; }
    .hero h2 { margin: 0 0 6px 0; font-size: 18px; font-weight: 700; }
    .hero p { margin: 0; font-size: 13px; opacity: 0.95; line-height: 1.5; }
    .content { padding: 24px; }
    .ref-badge { display: inline-block; background: #f1f5f9; color: #0f172a; font-weight: 800; font-size: 14px; padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 16px; font-family: monospace; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .data-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .data-label { color: #64748b; }
    .data-val { font-weight: 600; color: #0f172a; text-align: right; }
    .status-pill { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; background: ${statusBadgeColor}; color: ${statusTextColor}; }
    .total-box { background: #0f172a; color: #ffffff; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px; }
    .total-big { font-size: 18px; font-weight: 800; color: #38bdf8; }
    .btn { display: block; text-align: center; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jay Maa Sheetala Tours & Travel</h1>
      <p>Premium Fleet & Outstation Travel Services</p>
    </div>

    <div class="hero">
      <h2>${eventTitle}</h2>
      <p>${eventSubtext}</p>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="ref-badge">Booking Ref: #${payload.bookingRef}</span>
      </div>

      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        Hello <strong>${payload.customerName}</strong>,
      </p>

      <div class="card">
        <div class="card-title">Trip Schedule & Route</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Vehicle:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #0f172a;">${vehicle}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Pickup:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #0f172a;">${payload.pickupLocation}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Destination:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #0f172a;">${payload.dropLocation}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Pickup Date/Time:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #0f172a;">${formattedPickup}</td>
          </tr>
          ${
            formattedReturn
              ? `<tr>
            <td style="padding: 4px 0; color: #64748b;">Return Schedule:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #0f172a;">${formattedReturn}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Booking Status:</td>
            <td style="padding: 4px 0; text-align: right;">
              <span class="status-pill">${payload.status}</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="total-box">
        <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 10px;">
          Financial Summary
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e2e8f0;">
          <tr>
            <td style="padding: 4px 0;">Total Amount Quote:</td>
            <td style="padding: 4px 0; font-weight: 700; text-align: right; color: #ffffff;">₹${finalAmount}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Advance Paid:</td>
            <td style="padding: 4px 0; font-weight: 700; text-align: right; color: ${payload.isAdvancePaid ? '#4ade80' : '#e2e8f0'};">
              ₹${advancePaid}${payload.isAdvancePaid ? ' (PAID)' : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; border-top: 1px solid #334155;">Remaining Balance on Trip:</td>
            <td style="padding: 6px 0; border-top: 1px solid #334155; text-align: right;" class="total-big">
              ₹${remainingBalance}
            </td>
          </tr>
        </table>
        ${
          payload.paymentRef
            ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 8px; font-family: monospace;">Ref: ${payload.paymentRef}</div>`
            : ''
        }
      </div>

      ${
        payload.cancellationReason
          ? `<div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #9f1239;">
          <strong>Cancellation Reason:</strong> ${payload.cancellationReason}
        </div>`
          : ''
      }

      <a href="${trackingUrl}" class="btn">View Booking Details Online</a>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>Jay Maa Sheetala Tours & Travel</strong></p>
      <p style="margin: 0 0 8px 0;">Specialized Outstation, Airport & Pilgrimage Chauffeur Services</p>
      <p style="margin: 0;">This is an automated transaction update. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`.trim();
  }

  /**
   * Modular dispatcher: Sends email safely without throwing exceptions or interrupting operations.
   */
  static async sendBookingEmail(
    event: BookingEmailEvent,
    payload: BookingEmailPayload
  ): Promise<EmailSendResult> {
    const recipient = payload.customerEmail?.trim();

    // If customer has not provided an email address, log and exit safely
    if (!recipient) {
      console.log(
        `[EmailService] Notice: Booking #${payload.bookingRef} has no customer email address. Skipping email notification.`
      );
      return {
        success: true,
        mocked: true,
        recipient: 'none',
        messageId: 'skipped_no_email',
      };
    }

    const subject = this.getSubject(event, payload.bookingRef);
    const text = this.generatePlainText(event, payload);
    const html = this.generateHtml(event, payload);
    const from =
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      '"Jay Maa Sheetala Tours & Travel" <no-reply@jaymaasheetalatours.com>';

    // If SMTP is not configured, log email delivery in development/test safely
    if (!this.isConfigured()) {
      console.log(
        `[EmailService] [MOCK SEND] Event: ${event} | To: ${recipient} | Subject: "${subject}" | Ref: #${payload.bookingRef}`
      );
      return {
        success: true,
        mocked: true,
        recipient,
        messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      console.warn(
        `[EmailService] Transporter unavailable. Mocking send to ${recipient} for event ${event}.`
      );
      return {
        success: true,
        mocked: true,
        recipient,
        messageId: `fallback_mock_${Date.now()}`,
      };
    }

    try {
      const info = await transporter.sendMail({
        from,
        to: recipient,
        subject,
        text,
        html,
      });

      console.log(
        `[EmailService] Successfully sent ${event} email to ${recipient} (Message ID: ${info.messageId})`
      );

      return {
        success: true,
        messageId: info.messageId,
        recipient,
      };
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown email delivery error';
      // Log failure safely without exposing passwords or breaking business logic
      console.error(
        `[EmailService] Error delivering ${event} email to ${recipient} for booking #${payload.bookingRef}:`,
        errorMsg
      );

      return {
        success: false,
        error: errorMsg,
        recipient,
      };
    }
  }

  /**
   * Helper: Dispatch booking confirmation email
   */
  static async sendBookingConfirmation(payload: BookingEmailPayload) {
    return this.sendBookingEmail('CONFIRMATION', payload);
  }

  /**
   * Helper: Dispatch advance payment success email
   */
  static async sendPaymentSuccess(payload: BookingEmailPayload) {
    return this.sendBookingEmail('PAYMENT_SUCCESS', payload);
  }

  /**
   * Helper: Dispatch booking cancellation email
   */
  static async sendBookingCancellation(payload: BookingEmailPayload) {
    return this.sendBookingEmail('CANCELLATION', payload);
  }

  /**
   * Helper: Dispatch booking completion email
   */
  static async sendBookingCompletion(payload: BookingEmailPayload) {
    return this.sendBookingEmail('COMPLETION', payload);
  }
}
