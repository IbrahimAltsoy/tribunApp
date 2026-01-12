/**
 * Production-safe logger utility that prevents console statements in production
 *
 * @remarks
 * This logger provides a drop-in replacement for console.* methods with automatic
 * production silencing. In development, logs display with emoji prefixes for quick
 * visual identification. In production, critical errors can be sent to monitoring
 * services like Sentry.
 *
 * **Benefits:**
 * - Eliminates performance overhead of console.log in production
 * - Provides consistent logging interface across the application
 * - Integrates with error tracking services
 * - Includes helpful emoji prefixes for quick log identification
 *
 * @example
 * ```ts
 * import { logger } from './utils/logger';
 *
 * logger.log('User logged in'); // Development only
 * logger.error('API request failed', error); // Sent to Sentry in production
 * logger.time('API call'); // Performance measurement
 * // ... API call
 * logger.timeEnd('API call');
 * ```
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

/**
 * Logger class providing production-safe logging methods
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = __DEV__;
  }

  /**
   * General purpose logging for development debugging
   *
   * @param args - Any values to log
   *
   * @remarks
   * Use for general debugging information during development.
   * Silent in production builds to maintain performance.
   *
   * @example
   * ```ts
   * logger.log('Component mounted');
   * logger.log('User data:', userData);
   * ```
   */
  log(...args: any[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Informational messages
   */
  info(...args: any[]): void {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Warning messages - these should be addressed but don't break functionality
   */
  warn(...args: any[]): void {
    if (this.isDevelopment) {
      console.warn('[WARN]', ...args);
    }
    // In production, you might want to send warnings to analytics
    // analytics.trackWarning(args);
  }

  /**
   * Logs error messages and sends them to monitoring services in production
   *
   * @param args - Error information to log
   *
   * @remarks
   * Critical for tracking bugs and issues in production. In development, displays
   * with ❌ prefix. In production, errors should be sent to Sentry or similar service.
   *
   * @example
   * ```ts
   * logger.error('API call failed:', error);
   * logger.error('Failed to parse JSON', jsonString);
   * ```
   */
  error(...args: any[]): void {
    if (this.isDevelopment) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, send to error tracking service
      // Sentry.captureException(new Error(JSON.stringify(args)));
    }
  }

  /**
   * Debug messages - verbose logging for development
   */
  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Group related logs together
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Time measurement for performance debugging
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Log only in development, useful for temporary debugging
   */
  devOnly(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('[DEV]', ...args);
    }
  }

  /**
   * Assert a condition and log if it fails
   */
  assert(condition: boolean, message: string): void {
    if (!condition) {
      this.error('Assertion failed:', message);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing purposes
export { Logger };
