import { z } from 'zod';

/**
 * Environment Variable Schema & Production Hardening Validator
 * Jay Maa Sheetala Tours & Travel
 */

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Payment Gateway
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_GATEWAY_KEY_ID: z.string().optional(),
  PAYMENT_GATEWAY_KEY_SECRET: z.string().optional(),
  PAYMENT_GATEWAY_WEBHOOK_SECRET: z.string().optional(),

  // Email Notifications
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Admin Defaults for Seeding
  ADMIN_DEFAULT_EMAIL: z.string().email().optional(),
  ADMIN_DEFAULT_PASSWORD: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

const DEV_FALLBACK_SECRET = 'dev-super-secure-jwt-secret-key-tours-and-travels-2026';

/**
 * Validates runtime environment configuration and returns detailed diagnosis
 */
export function validateEnvironment(): {
  isValid: boolean;
  isProduction: boolean;
  warnings: string[];
  errors: string[];
} {
  const isProduction = process.env.NODE_ENV === 'production';
  const warnings: string[] = [];
  const errors: string[] = [];

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      errors.push(`[ENV CONFIG] ${issue.path.join('.')}: ${issue.message}`);
    });
  }

  // Production-specific strict security audits
  if (isProduction) {
    const authSecret = process.env.NEXTAUTH_SECRET;
    if (!authSecret) {
      errors.push(
        '[SECURITY] NEXTAUTH_SECRET is missing in production. Generate a strong 64-char random key.'
      );
    } else if (authSecret === DEV_FALLBACK_SECRET) {
      errors.push(
        '[SECURITY] NEXTAUTH_SECRET is using the insecure development default key in production.'
      );
    } else if (authSecret.length < 32) {
      warnings.push(
        '[SECURITY] NEXTAUTH_SECRET should ideally be at least 32 characters long for production security.'
      );
    }

    const razorpayKey = process.env.RAZORPAY_KEY_ID || process.env.PAYMENT_GATEWAY_KEY_ID;
    if (razorpayKey && razorpayKey.startsWith('rzp_test_')) {
      warnings.push(
        '[SECURITY] Razorpay is configured with test credentials (rzp_test_*) in production mode.'
      );
    }

    if (!process.env.DATABASE_URL) {
      errors.push('[CONFIG] DATABASE_URL is not configured in production.');
    }
  }

  return {
    isValid: errors.length === 0,
    isProduction,
    warnings,
    errors,
  };
}

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
