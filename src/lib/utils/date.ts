/**
 * Date and Time Utility Functions
 * Supports Asia/Kolkata and local timezone handling, safe date parsing,
 * formatting for HTML datetime-local inputs, and validation for booking forms.
 */

/**
 * Parses a date or date-time string safely into a JavaScript Date object.
 * Handles:
 * - Date instances
 * - HTML5 datetime-local format (YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)
 * - HTML5 date format (YYYY-MM-DD)
 * - DD-MM-YYYY or DD/MM/YYYY (with optional HH:mm or THH:mm)
 * - ISO string timestamps (YYYY-MM-DDTHH:mm:ss.sssZ / +offset)
 */
export function parseDateTime(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const str = String(input).trim();
  if (!str) return null;

  // 1. Check for DD-MM-YYYY or DD/MM/YYYY format (e.g., 08-09-2026, 08/09/2026 14:30, 08-09-2026T14:30)
  const ddmmyyyyMatch = str.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  );
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10);
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const hours = ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0;
    const minutes = ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0;
    const seconds = ddmmyyyyMatch[6] ? parseInt(ddmmyyyyMatch[6], 10) : 0;

    // Validate date components
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  // 2. Check for YYYY-MM-DD or YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm without trailing timezone (local time)
  const yyyymmddMatch = str.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  );
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10);
    const day = parseInt(yyyymmddMatch[3], 10);
    const hours = yyyymmddMatch[4] ? parseInt(yyyymmddMatch[4], 10) : 0;
    const minutes = yyyymmddMatch[5] ? parseInt(yyyymmddMatch[5], 10) : 0;
    const seconds = yyyymmddMatch[6] ? parseInt(yyyymmddMatch[6], 10) : 0;

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  // 3. Fallback to standard Date parsing (e.g. ISO strings with Z or offsets)
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Formats a Date into local `YYYY-MM-DDTHH:mm` format suitable for HTML `<input type="datetime-local" />`.
 * Uses local time components to prevent UTC date shifting.
 */
export function formatToLocalDatetimeInput(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formats a Date into local `YYYY-MM-DD` format suitable for HTML `<input type="date" />`.
 * Uses local time components to prevent UTC date shifting.
 */
export function formatToLocalDateInput(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

export interface TravelDateValidationResult {
  isValid: boolean;
  error?: string;
  parsedDate?: Date;
}

/**
 * Validates travel date & time.
 * Rules:
 * - A date before today is invalid.
 * - Today's date with a past time is invalid (with a small 5-minute buffer for form submission).
 * - Today's date with a future time is valid.
 * - Future dates (e.g., tomorrow, next week) are always valid regardless of the time chosen.
 */
export function validateTravelDateTime(
  value: string | Date | null | undefined,
  currentReferenceTime: Date = new Date(),
  gracePeriodMinutes: number = 5
): TravelDateValidationResult {
  if (!value) {
    return { isValid: false, error: 'Pickup date and time is required' };
  }

  const pickup = parseDateTime(value);
  if (!pickup || isNaN(pickup.getTime())) {
    return { isValid: false, error: 'Invalid pickup date and time format' };
  }

  // Start of today in local calendar
  const todayStart = new Date(
    currentReferenceTime.getFullYear(),
    currentReferenceTime.getMonth(),
    currentReferenceTime.getDate(),
    0,
    0,
    0,
    0
  );

  // Start of pickup day in local calendar
  const pickupDayStart = new Date(
    pickup.getFullYear(),
    pickup.getMonth(),
    pickup.getDate(),
    0,
    0,
    0,
    0
  );

  // 1. Date is before today
  if (pickupDayStart.getTime() < todayStart.getTime()) {
    return {
      isValid: false,
      error: 'Pickup date cannot be in the past',
      parsedDate: pickup,
    };
  }

  // 2. Date is today: check if time is in the past (with grace period)
  const isToday = pickupDayStart.getTime() === todayStart.getTime();
  if (isToday) {
    const graceThreshold =
      currentReferenceTime.getTime() - gracePeriodMinutes * 60 * 1000;
    if (pickup.getTime() < graceThreshold) {
      return {
        isValid: false,
        error: 'For today’s bookings, pickup time cannot be in the past',
        parsedDate: pickup,
      };
    }
  }

  // 3. Date is in the future (tomorrow or later): all times are valid
  return {
    isValid: true,
    parsedDate: pickup,
  };
}

/**
 * Validates round-trip return date and time against pickup date and time.
 */
export function validateReturnDateTime(
  pickupValue: string | Date | null | undefined,
  returnValue: string | Date | null | undefined,
  isRoundTrip: boolean = false
): TravelDateValidationResult {
  if (isRoundTrip && (!returnValue || String(returnValue).trim() === '')) {
    return {
      isValid: false,
      error: 'Please select a return date and time for round trips',
    };
  }

  if (!returnValue || String(returnValue).trim() === '') {
    return { isValid: true };
  }

  const ret = parseDateTime(returnValue);
  if (!ret || isNaN(ret.getTime())) {
    return { isValid: false, error: 'Invalid return date and time format' };
  }

  const pickup = parseDateTime(pickupValue);
  if (pickup && !isNaN(pickup.getTime())) {
    if (ret.getTime() < pickup.getTime()) {
      return {
        isValid: false,
        error: 'Return date and time must be after or equal to pickup date and time',
        parsedDate: ret,
      };
    }
  }

  return {
    isValid: true,
    parsedDate: ret,
  };
}
