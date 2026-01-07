import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Tracking from 'expo-tracking-transparency';
import { ConsentPreferences, ATTStatus, ConsentCategory } from '../types/onboarding';
import { logger } from '../utils/logger';

const CONSENT_KEY = '@tribunapp:consent_preferences';
const TERMS_VERSION = '1.0.0';
const PRIVACY_VERSION = '1.0.0';

/**
 * Consent Management Service
 * Handles KVKK/GDPR compliance and user consent preferences
 */
class ConsentService {
  /**
   * Get user consent preferences
   */
  async getConsentPreferences(): Promise<ConsentPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(CONSENT_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error('Error getting consent preferences:', error);
      return null;
    }
  }

  /**
   * Save user consent preferences
   */
  async saveConsentPreferences(preferences: Partial<ConsentPreferences>): Promise<void> {
    try {
      const existing = await this.getConsentPreferences();
      const updated: ConsentPreferences = {
        termsAccepted: false,
        privacyAccepted: false,
        dataProcessingConsent: false,
        marketingConsent: false,
        adTrackingConsent: false,
        analyticsConsent: false,
        consentDate: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
        privacyVersion: PRIVACY_VERSION,
        ...existing,
        ...preferences,
      };

      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
      logger.log('Consent preferences saved');
    } catch (error) {
      logger.error('Error saving consent preferences:', error);
      throw error;
    }
  }

  /**
   * Check if user has accepted required consents (Terms + Privacy)
   */
  async hasAcceptedRequiredConsents(): Promise<boolean> {
    const preferences = await this.getConsentPreferences();
    if (!preferences) return false;

    return preferences.termsAccepted && preferences.privacyAccepted;
  }

  /**
   * Request iOS App Tracking Transparency (ATT) permission
   */
  async requestTrackingPermission(): Promise<ATTStatus> {
    if (Platform.OS !== 'ios') {
      // Android doesn't need ATT
      return ATTStatus.NotDetermined;
    }

    try {
      const { status } = await Tracking.requestTrackingPermissionsAsync();

      const attStatus = this.mapTrackingStatus(status);

      // Save the result
      await this.saveConsentPreferences({
        adTrackingConsent: attStatus === ATTStatus.Authorized,
      });

      logger.log('ATT permission result:', attStatus);
      return attStatus;
    } catch (error) {
      logger.error('Error requesting tracking permission:', error);
      return ATTStatus.NotDetermined;
    }
  }

  /**
   * Get current tracking permission status
   */
  async getTrackingPermissionStatus(): Promise<ATTStatus> {
    if (Platform.OS !== 'ios') {
      return ATTStatus.NotDetermined;
    }

    try {
      const { status } = await Tracking.getTrackingPermissionsAsync();
      return this.mapTrackingStatus(status);
    } catch (error) {
      logger.error('Error getting tracking permission:', error);
      return ATTStatus.NotDetermined;
    }
  }

  /**
   * Map expo-tracking-transparency status to ATTStatus
   */
  private mapTrackingStatus(status: string): ATTStatus {
    switch (status) {
      case 'granted':
        return ATTStatus.Authorized;
      case 'denied':
        return ATTStatus.Denied;
      case 'restricted':
        return ATTStatus.Restricted;
      default:
        return ATTStatus.NotDetermined;
    }
  }

  /**
   * Get consent categories for KVKK/GDPR
   */
  getConsentCategories(): ConsentCategory[] {
    return [
      {
        id: 'required',
        name: 'consent.categories.required.name',
        description: 'consent.categories.required.description',
        required: true,
        enabled: true,
      },
      {
        id: 'analytics',
        name: 'consent.categories.analytics.name',
        description: 'consent.categories.analytics.description',
        required: false,
        enabled: false,
      },
      {
        id: 'marketing',
        name: 'consent.categories.marketing.name',
        description: 'consent.categories.marketing.description',
        required: false,
        enabled: false,
      },
      {
        id: 'adTracking',
        name: 'consent.categories.adTracking.name',
        description: 'consent.categories.adTracking.description',
        required: false,
        enabled: false,
      },
    ];
  }

  /**
   * Check if consent needs to be updated (version change)
   */
  async needsConsentUpdate(): Promise<boolean> {
    const preferences = await this.getConsentPreferences();
    if (!preferences) return true;

    // Check if terms/privacy version has changed
    const termsUpdated = preferences.termsVersion !== TERMS_VERSION;
    const privacyUpdated = preferences.privacyVersion !== PRIVACY_VERSION;

    return termsUpdated || privacyUpdated;
  }

  /**
   * Reset all consents (for testing or GDPR right to be forgotten)
   */
  async resetConsents(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONSENT_KEY);
      logger.log('All consents reset');
    } catch (error) {
      logger.error('Error resetting consents:', error);
      throw error;
    }
  }
}

export const consentService = new ConsentService();
