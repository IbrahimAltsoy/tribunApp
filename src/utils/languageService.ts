/**
 * Language Service - Enterprise-level centralized language management
 *
 * This service provides:
 * - Centralized language state management
 * - Automatic header injection for API requests
 * - Language persistence via AsyncStorage
 * - Global language change notifications
 * - Type-safe language operations
 *
 * @module languageService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/app';
import i18n from '../i18n';

// Supported languages
export type SupportedLanguage = 'tr' | 'en' | 'ku';

// Default language
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Language change callback type
type LanguageChangeCallback = (language: SupportedLanguage) => void;

// Private state
let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;
const languageChangeListeners: Set<LanguageChangeCallback> = new Set();

/**
 * Initialize language from storage or device settings
 * Should be called during app startup
 */
const initialize = async (): Promise<SupportedLanguage> => {
  try {
    // First check AsyncStorage for persisted preference
    const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);

    if (storedLanguage && isValidLanguage(storedLanguage)) {
      currentLanguage = storedLanguage as SupportedLanguage;
    } else {
      // Use i18n's detected language (from device)
      const detectedLanguage = i18n.language;
      if (isValidLanguage(detectedLanguage)) {
        currentLanguage = detectedLanguage as SupportedLanguage;
      }
    }

    // Sync i18n with our state
    if (i18n.language !== currentLanguage) {
      await i18n.changeLanguage(currentLanguage);
    }

    return currentLanguage;
  } catch {
    // Fallback to default on error
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Validate if a language code is supported
 */
const isValidLanguage = (language: string | null | undefined): boolean => {
  return language === 'tr' || language === 'en' || language === 'ku';
};

/**
 * Get current language
 */
const getLanguage = (): SupportedLanguage => {
  return currentLanguage;
};

/**
 * Set language and persist to storage
 * Notifies all listeners of the change
 */
const setLanguage = async (language: SupportedLanguage): Promise<void> => {
  if (!isValidLanguage(language)) {
    return;
  }

  const previousLanguage = currentLanguage;
  currentLanguage = language;

  // Persist to AsyncStorage
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch {
    // Silent fail - language still works in memory
  }

  // Update i18n
  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }

  // Notify listeners only if language actually changed
  if (previousLanguage !== language) {
    notifyListeners(language);
  }
};

/**
 * Get HTTP headers for API requests
 * Returns headers with Accept-Language set to current language
 */
const getRequestHeaders = (): Record<string, string> => {
  return {
    'Accept-Language': currentLanguage,
  };
};

/**
 * Get query parameter for language (some APIs prefer query params)
 */
const getLanguageQueryParam = (): string => {
  return `language=${currentLanguage}`;
};

/**
 * Append language to URL as query parameter
 */
const appendLanguageToUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${getLanguageQueryParam()}`;
};

/**
 * Subscribe to language changes
 * Returns unsubscribe function
 */
const onLanguageChange = (callback: LanguageChangeCallback): (() => void) => {
  languageChangeListeners.add(callback);

  // Return unsubscribe function
  return () => {
    languageChangeListeners.delete(callback);
  };
};

/**
 * Notify all listeners of language change
 */
const notifyListeners = (language: SupportedLanguage): void => {
  languageChangeListeners.forEach((callback) => {
    try {
      callback(language);
    } catch {
      // Prevent one listener from breaking others
    }
  });
};

/**
 * Sync with i18n changes (for when language is changed via i18n directly)
 */
const syncWithI18n = (): void => {
  i18n.on('languageChanged', async (lng: string) => {
    if (isValidLanguage(lng) && lng !== currentLanguage) {
      const previousLanguage = currentLanguage;
      currentLanguage = lng as SupportedLanguage;

      // Persist to AsyncStorage
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
      } catch {
        // Silent fail
      }

      // Notify listeners
      if (previousLanguage !== currentLanguage) {
        notifyListeners(currentLanguage);
      }
    }
  });
};

// Auto-sync with i18n on module load
syncWithI18n();

/**
 * Language Service Export
 *
 * Usage:
 * ```typescript
 * import { languageService } from '../utils/languageService';
 *
 * // In API calls
 * const headers = {
 *   'Content-Type': 'application/json',
 *   ...languageService.getRequestHeaders(),
 * };
 *
 * // Subscribe to changes
 * useEffect(() => {
 *   const unsubscribe = languageService.onLanguageChange((lang) => {
 *     // Refetch data with new language
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 */
export const languageService = {
  initialize,
  getLanguage,
  getCurrentLanguage: getLanguage, // Alias for notificationService compatibility
  setLanguage,
  getRequestHeaders,
  getLanguageQueryParam,
  appendLanguageToUrl,
  onLanguageChange,
  isValidLanguage,
};
