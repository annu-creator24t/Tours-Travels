/**
 * WhatsApp message generation and URL helpers for Jay Maa Sheetala Tours & Travel
 * Primary Admin WhatsApp: 919919379147 (+91 99193 79147)
 */

import { parseDateTime } from './date';

export const ADMIN_WHATSAPP_NUMBER = '919919379147';

export interface BookingWhatsAppPayload {
  bookingRef?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  pickupLocation: string;
  dropLocation: string;
  pickupDatetime: string | Date;
  returnDatetime?: string | Date | null;
  tripType: string;
  passengerCount: number;
  vehicleName?: string | null;
  customerNotes?: string | null;
}

/**
 * Maps raw trip type enum values to human-friendly strings
 */
export function formatTripTypeLabel(tripType: string): string {
  switch (tripType) {
    case 'ROUND_TRIP':
      return 'Round Trip';
    case 'LOCAL_RENTAL':
      return 'Local City Tour';
    case 'ONE_WAY':
    default:
      return 'One Way Drop';
  }
}

/**
 * Formats a Date/string to standard Indian date (e.g. "8 Sep 2026")
 */
function formatTravelDate(dateInput: string | Date): string {
  const date = parseDateTime(dateInput) || new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a Date/string to standard 12-hour time (e.g. "10:30 AM")
 */
function formatTravelTime(dateInput: string | Date): string {
  const date = parseDateTime(dateInput) || new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Generates the standardized WhatsApp notification message for the ADMIN (+91 9919379147).
 */
export function generateAdminBookingWhatsAppMessage(
  data: BookingWhatsAppPayload
): string {
  const tripTypeLabel = formatTripTypeLabel(data.tripType);
  const travelDate = formatTravelDate(data.pickupDatetime);
  const travelTime = formatTravelTime(data.pickupDatetime);
  const emailText = data.customerEmail?.trim() || 'Not Provided';
  const notesText = data.customerNotes?.trim() || 'No special requests.';
  const vehicleText = data.vehicleName?.trim() || 'Let Admin Recommend Best Fleet';

  let returnScheduleBlock = '';
  if (data.tripType === 'ROUND_TRIP' && data.returnDatetime) {
    const returnDate = formatTravelDate(data.returnDatetime);
    const returnTime = formatTravelTime(data.returnDatetime);
    returnScheduleBlock = `\n🔄 Return Schedule: ${returnDate} at ${returnTime}`;
  }

  const bookingRefLine = data.bookingRef ? `\n🔖 Ref: *${data.bookingRef}*` : '';

  return `🚖 *NEW BOOKING REQUEST*${bookingRefLine}

Hello Admin! 👋

A new customer has submitted a booking request through the *Jay Maa Sheetala Tours & Travel* website.

━━━━━━━━━━━━━━━━━━

👤 *CUSTOMER DETAILS*

Name: ${data.customerName.trim()}
Phone: ${data.customerPhone.trim()}
Email: ${emailText}

━━━━━━━━━━━━━━━━━━

📍 *TRIP DETAILS*

Pickup Location: ${data.pickupLocation.trim()}
Drop Location: ${data.dropLocation.trim()}

📅 Travel Date: ${travelDate}
🕐 Travel Time: ${travelTime}${returnScheduleBlock}

🔄 Trip Type: ${tripTypeLabel}

👥 Number of Passengers: ${data.passengerCount}

🚗 Preferred Vehicle: ${vehicleText}

━━━━━━━━━━━━━━━━━━

📝 *SPECIAL REQUESTS / NOTES*

${notesText}

━━━━━━━━━━━━━━━━━━

⚠️ *ACTION REQUIRED*

Please contact the customer directly on:

📞 ${data.customerPhone.trim()}

to confirm:

• Vehicle availability
• Fare/pricing
• Pickup and drop details
• Travel schedule

*This is a booking request and is NOT automatically confirmed.*

🌐 Request submitted through the website
*Jay Maa Sheetala Tours & Travel*`;
}

/**
 * Returns the click-to-chat URL for the admin WhatsApp recipient (919919379147).
 */
export function getAdminBookingWhatsAppUrl(
  data: BookingWhatsAppPayload
): string {
  const message = generateAdminBookingWhatsAppMessage(data);
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}
