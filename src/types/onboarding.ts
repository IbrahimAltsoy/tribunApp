/**
 * Onboarding and Consent Management Type Definitions
 */

/**
 * User consent preferences for data processing and tracking
 */
export interface ConsentPreferences {
  /** User has accepted Terms of Service */
  termsAccepted: boolean;
  /** User has accepted Privacy Policy */
  privacyAccepted: boolean;
  /** User has consented to KVKK/GDPR data processing */
  dataProcessingConsent: boolean;
  /** User has consented to marketing communications */
  marketingConsent: boolean;
  /** User has consented to ad tracking (iOS ATT) */
  adTrackingConsent: boolean;
  /** User has consented to analytics */
  analyticsConsent: boolean;
  /** Timestamp when consent was given */
  consentDate: string;
  /** Version of terms/privacy policy accepted */
  termsVersion: string;
  privacyVersion: string;
}

/**
 * Onboarding completion status
 */
export interface OnboardingStatus {
  /** Whether user has completed onboarding */
  completed: boolean;
  /** Timestamp when onboarding was completed */
  completedAt?: string;
  /** Current onboarding step (if not completed) */
  currentStep?: number;
  /** Total number of onboarding steps */
  totalSteps: number;
}

/**
 * Onboarding slide content
 */
export interface OnboardingSlide {
  /** Unique identifier for the slide */
  id: string;
  /** Title of the slide */
  title: string;
  /** Description/subtitle */
  description: string;
  /** Icon name from Ionicons */
  icon: string;
  /** Icon color */
  iconColor?: string;
  /** Background gradient colors */
  gradientColors?: [string, string];
  /** Image source (optional) */
  image?: any;
}

/**
 * App Tracking Transparency (ATT) Status (iOS)
 */
export enum ATTStatus {
  NotDetermined = 'notDetermined',
  Restricted = 'restricted',
  Denied = 'denied',
  Authorized = 'authorized',
}

/**
 * KVKK/GDPR consent categories
 */
export interface ConsentCategory {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description: string;
  /** Whether this consent is required (cannot be disabled) */
  required: boolean;
  /** Current consent status */
  enabled: boolean;
}

/**
 * Legal document metadata
 */
export interface LegalDocument {
  /** Document type */
  type: 'terms' | 'privacy' | 'kvkk';
  /** Current version */
  version: string;
  /** Last updated date */
  lastUpdated: string;
  /** Document content (markdown or HTML) */
  content: string;
  /** URL to web version (optional) */
  url?: string;
}
