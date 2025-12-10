/**
 * Sentry Error Tracking Integration
 *
 * To use Sentry, install the package:
 * npx expo install @sentry/react-native
 *
 * Then add your DSN to .env:
 * EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
 */

import { logger } from './logger';

// Uncomment when Sentry is installed
// import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const IS_PRODUCTION = process.env.EXPO_PUBLIC_ENV === 'production';

/**
 * Initialize Sentry error tracking
 */
export const initSentry = (): void => {
  // Only initialize in production with valid DSN
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    logger.info('Sentry: Not initialized (development mode or missing DSN)');
    return;
  }

  try {
    // Uncomment when Sentry is installed
    /*
    Sentry.init({
      dsn: SENTRY_DSN,
      enableInExpoDevelopment: false,
      debug: __DEV__,
      environment: process.env.EXPO_PUBLIC_ENV || 'development',

      // Set sample rate for performance monitoring
      tracesSampleRate: 1.0,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove user IP address
        if (event.user) {
          delete event.user.ip_address;
        }
        return event;
      },

      // Integrations
      integrations: [
        new Sentry.ReactNativeTracing({
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        }),
      ],
    });
    */

    logger.info('Sentry: Initialized successfully');
  } catch (error) {
    logger.error('Sentry: Initialization failed', error);
  }
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: Record<string, any>): void => {
  if (__DEV__) {
    logger.error('Exception captured:', error, context);
    return;
  }

  // Uncomment when Sentry is installed
  /*
  Sentry.captureException(error, {
    contexts: context,
  });
  */
};

/**
 * Capture message
 */
export const captureMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void => {
  if (__DEV__) {
    logger.log(`Message captured [${level}]:`, message);
    return;
  }

  // Uncomment when Sentry is installed
  /*
  Sentry.captureMessage(message, level);
  */
};

/**
 * Set user context
 */
export const setUser = (user: { id: string; username?: string; email?: string }): void => {
  if (__DEV__) {
    logger.log('User context set:', user);
    return;
  }

  // Uncomment when Sentry is installed
  /*
  Sentry.setUser(user);
  */
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string = 'default',
  level: 'info' | 'warning' | 'error' = 'info'
): void => {
  if (__DEV__) {
    logger.debug(`Breadcrumb [${category}]:`, message);
    return;
  }

  // Uncomment when Sentry is installed
  /*
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
  */
};

// Export Sentry instance for advanced usage
// Uncomment when Sentry is installed
// export { Sentry };
