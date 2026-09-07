import {
  parseDateTime,
  formatToLocalDatetimeInput,
  formatToLocalDateInput,
  validateTravelDateTime,
  validateReturnDateTime,
} from '../src/lib/utils/date';
import { createBookingSchema } from '../src/lib/validators/booking.schema';

console.log('=== RUNNING TRAVEL DATE VALIDATION TESTS ===\n');

// Set fixed reference time for testing: 7 September 2026, 21:08:12 IST (local time)
const referenceTime = new Date(2026, 8, 7, 21, 8, 12); // Month is 0-indexed (8 = September)
console.log(`Current Mock Reference Time: ${referenceTime.toString()}`);

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

// 1. Test past dates (before 7 September 2026)
const pastDate1 = validateTravelDateTime('2026-09-06T10:00', referenceTime);
assert(!pastDate1.isValid, 'Date before today (2026-09-06T10:00) is Invalid', pastDate1.error);

const pastDate2 = validateTravelDateTime('06-09-2026 15:00', referenceTime);
assert(!pastDate2.isValid, 'Date before today in DD-MM-YYYY (06-09-2026 15:00) is Invalid', pastDate2.error);

const pastDate3 = validateTravelDateTime('2026-08-15T09:00', referenceTime);
assert(!pastDate3.isValid, 'Date in past month (2026-08-15T09:00) is Invalid', pastDate3.error);

// 2. Test today (7 September 2026) with past time vs future time
const todayPastTime = validateTravelDateTime('2026-09-07T14:00', referenceTime);
assert(!todayPastTime.isValid, "Today's date with past time (2026-09-07T14:00) is Invalid", todayPastTime.error);

const todayFutureTime = validateTravelDateTime('2026-09-07T22:30', referenceTime);
assert(todayFutureTime.isValid, "Today's date with future time (2026-09-07T22:30) is Valid", todayFutureTime.error);

// 3. Test tomorrow (8 September 2026) - all times must be valid!
const tomorrowEarly = validateTravelDateTime('2026-09-08T06:00', referenceTime);
assert(tomorrowEarly.isValid, 'Tomorrow early morning (2026-09-08T06:00) is Valid', tomorrowEarly.error);

const tomorrowMorning = validateTravelDateTime('2026-09-08T10:00', referenceTime);
assert(tomorrowMorning.isValid, 'Tomorrow morning (2026-09-08T10:00) is Valid', tomorrowMorning.error);

const tomorrowNight = validateTravelDateTime('2026-09-08T23:59', referenceTime);
assert(tomorrowNight.isValid, 'Tomorrow night (2026-09-08T23:59) is Valid', tomorrowNight.error);

const tomorrowDDMMYYYY = validateTravelDateTime('08-09-2026 09:30', referenceTime);
assert(tomorrowDDMMYYYY.isValid, 'Tomorrow in DD-MM-YYYY (08-09-2026 09:30) is Valid', tomorrowDDMMYYYY.error);

// 4. Test later future dates
const futureDate1 = validateTravelDateTime('2026-09-15T14:00', referenceTime);
assert(futureDate1.isValid, 'Future date (2026-09-15T14:00) is Valid', futureDate1.error);

const futureDate2 = validateTravelDateTime('2026-12-25T08:00', referenceTime);
assert(futureDate2.isValid, 'Far future date (2026-12-25T08:00) is Valid', futureDate2.error);

// 5. Test parsing robustness
const parsedDDMMYYYY = parseDateTime('08-09-2026 11:45');
assert(
  parsedDDMMYYYY !== null &&
    parsedDDMMYYYY.getDate() === 8 &&
    parsedDDMMYYYY.getMonth() === 8 && // September (0-indexed 8)
    parsedDDMMYYYY.getFullYear() === 2026 &&
    parsedDDMMYYYY.getHours() === 11 &&
    parsedDDMMYYYY.getMinutes() === 45,
  'parseDateTime correctly parses DD-MM-YYYY format without swapping month/day'
);

const parsedSlash = parseDateTime('08/09/2026 14:00');
assert(
  parsedSlash !== null &&
    parsedSlash.getDate() === 8 &&
    parsedSlash.getMonth() === 8 &&
    parsedSlash.getFullYear() === 2026,
  'parseDateTime correctly parses DD/MM/YYYY format'
);

// 6. Test formatToLocalDatetimeInput
const sampleDate = new Date(2026, 8, 7, 21, 8);
const formatted = formatToLocalDatetimeInput(sampleDate);
assert(formatted === '2026-09-07T21:08', `formatToLocalDatetimeInput outputs "2026-09-07T21:08" (got: ${formatted})`);

// 7. Test formatToLocalDateInput
const formattedDate = formatToLocalDateInput(sampleDate);
assert(formattedDate === '2026-09-07', `formatToLocalDateInput outputs "2026-09-07" (got: ${formattedDate})`);

// 8. Test Round Trip return date validation
const validRoundTrip = validateReturnDateTime('2026-09-08T10:00', '2026-09-10T18:00', true);
assert(validRoundTrip.isValid, 'Round trip with return after pickup is Valid', validRoundTrip.error);

const invalidRoundTrip = validateReturnDateTime('2026-09-08T10:00', '2026-09-07T18:00', true);
assert(!invalidRoundTrip.isValid, 'Round trip with return before pickup is Invalid', invalidRoundTrip.error);

const missingReturn = validateReturnDateTime('2026-09-08T10:00', '', true);
assert(!missingReturn.isValid, 'Round trip with missing return date is Invalid', missingReturn.error);

// 9. Test Zod createBookingSchema
const validBookingPayload = {
  customerName: 'Rajesh Sharma',
  customerPhone: '+919876543210',
  pickupLocation: 'Delhi Airport Terminal 3',
  dropLocation: 'Agra Cantt',
  pickupDatetime: '2026-09-08T10:00',
  tripType: 'ONE_WAY' as const,
  passengerCount: 3,
};
const zodResult1 = createBookingSchema.safeParse(validBookingPayload);
assert(zodResult1.success, 'Zod schema accepts future booking on 8 September 2026', zodResult1.error?.message);

const pastBookingPayload = {
  ...validBookingPayload,
  pickupDatetime: '2026-09-06T10:00',
};
const zodResult2 = createBookingSchema.safeParse(pastBookingPayload);
assert(!zodResult2.success, 'Zod schema rejects past booking on 6 September 2026');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passedCount} passed, ${failedCount} failed`);
console.log(`========================================\n`);

if (failedCount > 0) {
  process.exit(1);
}
