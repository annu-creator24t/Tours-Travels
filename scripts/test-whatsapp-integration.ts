import {
  generateAdminBookingWhatsAppMessage,
  getAdminBookingWhatsAppUrl,
  ADMIN_WHATSAPP_NUMBER,
} from '../src/lib/utils/whatsapp';

console.log('=== RUNNING WHATSAPP INTEGRATION TESTS ===\n');

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failedCount++;
  }
}

// Test 1: Full payload
const samplePayload = {
  bookingRef: 'TT-2026-8821',
  customerName: 'Rajesh Sharma',
  customerPhone: '+91 98765 43210',
  customerEmail: 'rajesh@example.com',
  pickupLocation: 'Terminal 3, Delhi Airport',
  dropLocation: 'Taj Mahal East Gate, Agra',
  pickupDatetime: '2026-09-08T10:30',
  returnDatetime: '2026-09-10T18:00',
  tripType: 'ROUND_TRIP',
  passengerCount: 4,
  vehicleName: 'Innova Crysta (Toyota)',
  customerNotes: 'Require infant child seat and flight delay monitoring.',
};

const message = generateAdminBookingWhatsAppMessage(samplePayload);
const url = getAdminBookingWhatsAppUrl(samplePayload);

// Assertions on Admin Recipient Number
assert(
  ADMIN_WHATSAPP_NUMBER === '919919379147',
  'ADMIN_WHATSAPP_NUMBER is 919919379147'
);
assert(
  url.startsWith('https://wa.me/919919379147?text='),
  'WhatsApp click-to-chat URL targets Admin number (919919379147)'
);
assert(
  !url.includes('wa.me/9876543210') && !url.includes('wa.me/+919876543210'),
  'Customer mobile number is NOT used as the WhatsApp recipient'
);

// Assertions on Message Content
assert(
  message.includes('🚖 *NEW BOOKING REQUEST*'),
  'Message has correct header "🚖 *NEW BOOKING REQUEST*"'
);
assert(
  message.includes('Name: Rajesh Sharma'),
  'Message contains customer name'
);
assert(
  message.includes('Phone: +91 98765 43210'),
  'Message contains customer phone number'
);
assert(
  message.includes('Email: rajesh@example.com'),
  'Message contains customer email'
);
assert(
  message.includes('Pickup Location: Terminal 3, Delhi Airport'),
  'Message contains pickup location'
);
assert(
  message.includes('Drop Location: Taj Mahal East Gate, Agra'),
  'Message contains drop location'
);
assert(
  message.includes('Travel Date: 8 Sep 2026') || message.includes('Travel Date: 8 Sept 2026'),
  'Message contains formatted travel date'
);
assert(
  message.includes('Travel Time: 10:30 am') || message.includes('Travel Time: 10:30 AM'),
  'Message contains formatted travel time'
);
assert(
  message.includes('🔄 Trip Type: Round Trip'),
  'Message contains human-friendly trip type (Round Trip)'
);
assert(
  message.includes('👥 Number of Passengers: 4'),
  'Message contains number of passengers'
);
assert(
  message.includes('🚗 Preferred Vehicle: Innova Crysta (Toyota)'),
  'Message contains selected vehicle'
);
assert(
  message.includes('Require infant child seat and flight delay monitoring.'),
  'Message contains special requests'
);
assert(
  message.includes('*This is a booking request and is NOT automatically confirmed.*'),
  'Message contains unconfirmed booking disclaimer'
);
assert(
  message.includes('📞 +91 98765 43210'),
  'Action required section contains customer contact number for admin to call/message'
);

// Test 2: Fallback for optional fields (no email, no notes, default vehicle)
const minimalPayload = {
  customerName: 'Pooja Verma',
  customerPhone: '9876543211',
  customerEmail: '',
  pickupLocation: 'Connaught Place, New Delhi',
  dropLocation: 'Haridwar Ghat',
  pickupDatetime: '2026-09-08T06:00',
  tripType: 'ONE_WAY',
  passengerCount: 2,
  customerNotes: '',
};

const minMessage = generateAdminBookingWhatsAppMessage(minimalPayload);
assert(
  minMessage.includes('Email: Not Provided'),
  'Optional email fallback displays "Not Provided"'
);
assert(
  minMessage.includes('No special requests.'),
  'Optional notes fallback displays "No special requests."'
);
assert(
  minMessage.includes('Preferred Vehicle: Let Admin Recommend Best Fleet'),
  'Unselected vehicle fallback displays "Let Admin Recommend Best Fleet"'
);

console.log('\n--- Generated Sample WhatsApp Message ---');
console.log(message);
console.log('-----------------------------------------\n');
console.log('--- Generated WhatsApp URL ---');
console.log(url);
console.log('------------------------------\n');

console.log(`\n========================================`);
console.log(`WHATSAPP TEST SUMMARY: ${passedCount} passed, ${failedCount} failed`);
console.log(`========================================\n`);

if (failedCount > 0) {
  process.exit(1);
}
