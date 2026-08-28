import { NextResponse } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitOptions {
  maxRequests: number; // Maximum number of allowed requests in the window
  windowMs: number;    // Sliding window duration in milliseconds
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Milliseconds timestamp when window resets
  retryAfterSeconds: number;
}

// In-memory store for tracking IP/endpoint request timestamps
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale IP records every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupStaleRecords(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  rateLimitStore.forEach((record, key) => {
    // Keep only timestamps within the last 1 hour
    const recentTimestamps = record.timestamps.filter(
      (ts) => now - ts < 60 * 60 * 1000
    );
    if (recentTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = recentTimestamps;
    }
  });
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return '127.0.0.1';
}

/**
 * Sliding window in-memory rate limiter algorithm
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  cleanupStaleRecords(now);

  const windowStart = now - options.windowMs;
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps to only those within the active sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const currentCount = record.timestamps.length;
  const resetTime =
    record.timestamps.length > 0
      ? record.timestamps[0] + options.windowMs
      : now + options.windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

  if (currentCount >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      resetTime,
      retryAfterSeconds,
    };
  }

  // Record this request timestamp
  record.timestamps.push(now);

  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.timestamps.length,
    resetTime,
    retryAfterSeconds: 0,
  };
}

/**
 * Helper to apply rate limiting to an API route handler.
 * Returns a 429 Response if rate limit is exceeded, or null if permitted.
 */
export function applyRateLimit(
  request: Request,
  endpointKey: string,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(request);
  const identifier = `${endpointKey}:${ip}`;

  const result = checkRateLimit(identifier, options);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
        retryAfter: result.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSeconds),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}

// Preset rate limit configurations (configurable via environment variables)
export const RATE_LIMIT_CONFIGS = {
  // Booking creation: default 10 requests per 10 minutes per IP
  BOOKING_CREATE: {
    maxRequests: parseInt(process.env.RATE_LIMIT_BOOKING_MAX || '10', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_BOOKING_WINDOW_MS || '600000', 10), // 10 mins
  },
  // Review submission: default 5 reviews per 10 minutes per IP
  REVIEW_SUBMIT: {
    maxRequests: parseInt(process.env.RATE_LIMIT_REVIEW_MAX || '5', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_REVIEW_WINDOW_MS || '600000', 10), // 10 mins
  },
  // Cancellation verification: default 10 attempts per 10 minutes per IP
  BOOKING_CANCEL: {
    maxRequests: parseInt(process.env.RATE_LIMIT_CANCEL_MAX || '10', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_CANCEL_WINDOW_MS || '600000', 10), // 10 mins
  },
};
