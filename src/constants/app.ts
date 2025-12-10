/**
 * Application-wide constants
 * Centralized configuration for magic numbers and strings
 */

/**
 * Content display limits
 */
export const CONTENT_LIMITS = {
  FEATURED_NEWS_COUNT: 5,
  VISIBLE_MOMENTS_COUNT: 5,
  MARS_MOMENTS_COUNT: 6,
  RECENT_FIXTURES_COUNT: 3,
  ANNOUNCEMENTS_PREVIEW_COUNT: 3,
} as const;

/**
 * Form validation limits
 */
export const VALIDATION_LIMITS = {
  // Fan moment sharing
  MOMENT_CAPTION_MAX: 500,
  MOMENT_CAPTION_MIN: 3,
  MOMENT_CITY_MAX: 100,
  MOMENT_CITY_MIN: 2,

  // Announcements
  ANNOUNCEMENT_TITLE_MAX: 200,
  ANNOUNCEMENT_TITLE_MIN: 5,
  ANNOUNCEMENT_CITY_MAX: 100,
  ANNOUNCEMENT_LOCATION_MAX: 200,
  ANNOUNCEMENT_CONTACT_MAX: 100,
  ANNOUNCEMENT_NOTE_MAX: 1000,

  // Chat
  CHAT_MESSAGE_MAX: 1000,
  CHAT_MESSAGE_MIN: 1,
  CHAT_NICKNAME_MAX: 30,
  CHAT_NICKNAME_MIN: 2,

  // Poll
  POLL_OPTION_TEXT_MAX: 100,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  SHIMMER: 2000,
  PULSE: 1500,
  FADE_IN: 300,
  SLIDE_IN: 400,
  BOUNCE: 500,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATION = {
  NEWS: 5 * 60 * 1000, // 5 minutes
  FIXTURES: 2 * 60 * 1000, // 2 minutes
  STANDINGS: 10 * 60 * 1000, // 10 minutes
  PLAYERS: 60 * 60 * 1000, // 1 hour
  KITS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed',
  TIMEOUT_ERROR: 'Request timed out',
  SERVER_ERROR: 'Server error occurred',
  VALIDATION_ERROR: 'Please check your input',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

/**
 * Regular expressions for validation
 */
export const VALIDATION_PATTERNS = {
  // Date format: "15 Aralık, 19:00" or "15 December, 19:00"
  DATE_TIME: /^\d{1,2}\s\w+,?\s\d{2}:\d{2}$/,

  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone (Turkish format)
  PHONE_TR: /^(\+90|0)?5\d{9}$/,

  // URL
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

  // Image URL
  IMAGE_URL: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i,
} as const;

/**
 * Storage keys for AsyncStorage
 */
export const STORAGE_KEYS = {
  LANGUAGE: '@amedspor:language',
  USER_NICKNAME: '@amedspor:nickname',
  THEME_MODE: '@amedspor:theme',
  ONBOARDING_COMPLETE: '@amedspor:onboarding',
  LAST_SYNC: '@amedspor:lastSync',
} as const;

/**
 * External links
 */
export const EXTERNAL_LINKS = {
  STORE: 'https://amedstore.com',
  OFFICIAL_WEBSITE: 'https://amedspor.com',
  TWITTER: 'https://twitter.com/amedspor',
  INSTAGRAM: 'https://instagram.com/amedspor',
  YOUTUBE: 'https://youtube.com/@amedspor',
  FACEBOOK: 'https://facebook.com/amedspor',
} as const;

/**
 * App metadata
 */
export const APP_METADATA = {
  NAME: 'Amedspor Tribün',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  BUNDLE_ID: 'com.amedspor.tribun',
} as const;
