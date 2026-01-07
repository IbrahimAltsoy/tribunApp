/**
 * Environment Configuration
 * Centralized access to environment variables with type safety and validation
 */

import { logger } from '../utils/logger';

/**
 * Get environment variable with fallback and validation
 */
function getEnv(key: string, fallback: string = ''): string {
  const value = process.env[key];

  if (!value && !fallback) {
    logger.warn(`Environment variable ${key} is not set`);
  }

  return value || fallback;
}

/**
 * Get boolean environment variable
 */
function getEnvBoolean(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];

  if (!value) return fallback;

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment Configuration Object
 */
export const ENV = {
  // Environment
  ENV: getEnv('EXPO_PUBLIC_ENV', 'development') as Environment,
  IS_DEV: __DEV__,
  IS_PRODUCTION: getEnv('EXPO_PUBLIC_ENV') === 'production',

  // API Configuration
  API_URL: getEnv('EXPO_PUBLIC_API_URL', 'https://api.amedspor.com/api'),

  // SignalR Hub URLs
  CHAT_HUB_URL: getEnv('EXPO_PUBLIC_CHAT_HUB_URL', 'https://api.amedspor.com/chathub'),
  POLL_HUB_URL: getEnv('EXPO_PUBLIC_POLL_HUB_URL', 'https://api.amedspor.com/pollhub'),
  GOAL_HUB_URL: getEnv('EXPO_PUBLIC_GOAL_HUB_URL', 'https://api.amedspor.com/goalhub'),

  // Media Upload
  MEDIA_UPLOAD_URL: getEnv('EXPO_PUBLIC_MEDIA_UPLOAD_URL', 'https://api.amedspor.com/api/media/upload'),

  // Error Tracking
  SENTRY_DSN: getEnv('EXPO_PUBLIC_SENTRY_DSN'),

  // Analytics
  GOOGLE_ANALYTICS_ID: getEnv('EXPO_PUBLIC_GOOGLE_ANALYTICS_ID'),
  FIREBASE_PROJECT_ID: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),

  // Ad Unit IDs
  ADMOB: {
    APP_ID: getEnv('EXPO_PUBLIC_ADMOB_APP_ID'),
    INTERSTITIAL_ID: getEnv('EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID'),
    REWARDED_ID: getEnv('EXPO_PUBLIC_ADMOB_REWARDED_ID'),
    NATIVE_ID: getEnv('EXPO_PUBLIC_ADMOB_NATIVE_ID'),
  },

  // Feature Flags
  FEATURES: {
    CHAT: getEnvBoolean('EXPO_PUBLIC_ENABLE_CHAT', true),
    POLLS: getEnvBoolean('EXPO_PUBLIC_ENABLE_POLLS', true),
    ADS: getEnvBoolean('EXPO_PUBLIC_ENABLE_ADS', false),
    ANALYTICS: getEnvBoolean('EXPO_PUBLIC_ENABLE_ANALYTICS', false),
  },

  // Debug Mode
  DEBUG: getEnvBoolean('EXPO_PUBLIC_DEBUG', __DEV__),
  VERBOSE_LOGGING: getEnvBoolean('EXPO_PUBLIC_VERBOSE_LOGGING', false),
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment(): boolean {
  const requiredVars = [
    'EXPO_PUBLIC_API_URL',
  ];

  let isValid = true;

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      logger.error(`Missing required environment variable: ${varName}`);
      isValid = false;
    }
  }

  if (!isValid && ENV.IS_PRODUCTION) {
    throw new Error('Missing required environment variables for production build');
  }

  return isValid;
}

// Log environment on startup (development only)
if (__DEV__) {
  logger.info('Environment loaded:', {
    ENV: ENV.ENV,
    API_URL: ENV.API_URL,
    FEATURES: ENV.FEATURES,
  });
}
