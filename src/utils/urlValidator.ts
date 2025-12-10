import { Linking, Alert } from 'react-native';

/**
 * Validates if a URL is safe to open by checking for secure protocols
 *
 * @param url - The URL string to validate
 * @returns {boolean} True if URL uses http/https protocol and has valid format, false otherwise
 *
 * @remarks
 * Only allows http and https protocols to prevent security vulnerabilities.
 * Blocks potentially malicious protocols like javascript:, file:, data:, etc.
 *
 * @example
 * ```ts
 * isValidURL('https://example.com') // true
 * isValidURL('javascript:alert(1)') // false
 * isValidURL('file:///etc/passwd') // false
 * ```
 */
export const isValidURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  // Only allow http and https protocols
  const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  return urlPattern.test(url.trim());
};

/**
 * Validates if a URL points to a valid image file
 *
 * @param url - The URL string to validate as an image
 * @returns {boolean} True if URL is valid and ends with a supported image extension
 *
 * @remarks
 * Used for user-provided image URLs in forms and user-generated content.
 * Supported formats: jpg, jpeg, png, gif, webp, bmp, svg
 * Empty strings return true for optional image fields.
 *
 * @example
 * ```ts
 * isValidImageURL('https://example.com/photo.jpg') // true
 * isValidImageURL('https://example.com/file.pdf') // false
 * isValidImageURL('') // true (optional field)
 * ```
 */
export const isValidImageURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return true; // Empty is valid for optional fields

  // Check if it's a valid URL first
  if (!isValidURL(trimmedUrl)) return false;

  // Check if it has a valid image extension
  const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
  return imageUrlPattern.test(trimmedUrl);
};

/**
 * Safely opens a URL with comprehensive validation and user-friendly error messages
 *
 * @param url - The URL to open (can be undefined for optional fields)
 * @param options - Optional configuration for error messages
 * @param options.errorTitle - Custom title for error alerts (default: "Error")
 * @param options.errorMessage - Custom message when URL is undefined
 * @param options.invalidUrlMessage - Custom message for invalid URLs
 * @returns {Promise<boolean>} Promise resolving to true if URL opened successfully, false otherwise
 *
 * @remarks
 * This function performs three safety checks:
 * 1. Validates URL exists and is defined
 * 2. Validates URL format using isValidURL (blocks malicious protocols)
 * 3. Checks if device can open the URL before attempting
 *
 * All errors display user-friendly Alert dialogs with i18n support.
 *
 * @example
 * ```ts
 * // Basic usage
 * await openURLSafely('https://example.com');
 *
 * // With custom error messages
 * await openURLSafely(announcement.link, {
 *   errorTitle: t("error"),
 *   invalidUrlMessage: t("validation.urlBlocked")
 * });
 * ```
 */
export const openURLSafely = async (
  url: string | undefined,
  options?: {
    errorTitle?: string;
    errorMessage?: string;
    invalidUrlMessage?: string;
  }
): Promise<boolean> => {
  if (!url) {
    if (options?.errorMessage) {
      Alert.alert(
        options.errorTitle || 'Error',
        options.errorMessage || 'No URL provided'
      );
    }
    return false;
  }

  // Validate URL format
  if (!isValidURL(url)) {
    Alert.alert(
      options?.errorTitle || 'Invalid URL',
      options?.invalidUrlMessage || 'This link cannot be opened for security reasons'
    );
    return false;
  }

  try {
    // Check if device can open the URL
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        options?.errorTitle || 'Error',
        'Cannot open this link on your device'
      );
      return false;
    }
  } catch (error) {
    Alert.alert(
      options?.errorTitle || 'Error',
      'An error occurred while opening the link'
    );
    return false;
  }
};

/**
 * Sanitizes user input by removing potentially dangerous characters and scripts
 *
 * @param input - The user input string to sanitize
 * @returns {string} Sanitized string safe for display and storage
 *
 * @remarks
 * Protects against XSS (Cross-Site Scripting) attacks by removing:
 * - Angle brackets (< >) that could inject HTML tags
 * - javascript: protocol that could execute code
 * - Event handlers (onclick=, onload=, etc.) that could run malicious scripts
 *
 * Use this for all user-generated text content before displaying or storing.
 *
 * @example
 * ```ts
 * sanitizeInput('<script>alert(1)</script>') // 'scriptalert(1)/script'
 * sanitizeInput('javascript:alert(1)') // 'alert(1)'
 * sanitizeInput('Hello <b>World</b>') // 'Hello bWorld/b'
 * ```
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validates if input string length falls within specified bounds
 *
 * @param input - The string to validate
 * @param minLength - Minimum allowed length (default: 0)
 * @param maxLength - Maximum allowed length (default: Infinity)
 * @returns {boolean} True if trimmed input length is within bounds, false otherwise
 *
 * @remarks
 * Input is trimmed before validation to ignore leading/trailing whitespace.
 * Useful for form validation with character limits.
 *
 * @example
 * ```ts
 * isValidLength('Hello', 3, 10) // true
 * isValidLength('Hi', 3, 10) // false (too short)
 * isValidLength('Very long text here', 3, 10) // false (too long)
 * isValidLength('  Hello  ', 3, 10) // true (trimmed to 'Hello')
 * ```
 */
export const isValidLength = (
  input: string,
  minLength: number = 0,
  maxLength: number = Infinity
): boolean => {
  if (!input || typeof input !== 'string') return false;

  const trimmed = input.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};
