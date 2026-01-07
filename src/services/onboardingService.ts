import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingStatus, OnboardingSlide } from '../types/onboarding';
import { logger } from '../utils/logger';

const ONBOARDING_KEY = '@tribunapp:onboarding_status';
const ONBOARDING_VERSION = '1.0.0';

/**
 * Onboarding Service
 * Manages onboarding flow completion status
 */
class OnboardingService {
  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const status = await this.getOnboardingStatus();
      return status.completed;
    } catch (error) {
      logger.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Get current onboarding status
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Default status
      return {
        completed: false,
        totalSteps: 4,
        currentStep: 0,
      };
    } catch (error) {
      logger.error('Error getting onboarding status:', error);
      return {
        completed: false,
        totalSteps: 4,
        currentStep: 0,
      };
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      const status: OnboardingStatus = {
        completed: true,
        completedAt: new Date().toISOString(),
        totalSteps: 4,
      };

      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(status));
      logger.log('Onboarding completed');
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      logger.log('Onboarding reset');
    } catch (error) {
      logger.error('Error resetting onboarding:', error);
      throw error;
    }
  }

  /**
   * Update current onboarding step
   */
  async updateCurrentStep(step: number): Promise<void> {
    try {
      const status = await this.getOnboardingStatus();
      status.currentStep = step;
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(status));
    } catch (error) {
      logger.error('Error updating onboarding step:', error);
    }
  }

  /**
   * Get onboarding slides content
   */
  getOnboardingSlides(): OnboardingSlide[] {
    return [
      {
        id: 'welcome',
        title: 'onboarding.welcome.title',
        description: 'onboarding.welcome.description',
        icon: 'football',
        iconColor: '#00BF47',
        gradientColors: ['#0A0F0A', '#1A2F1A'],
      },
      {
        id: 'features',
        title: 'onboarding.features.title',
        description: 'onboarding.features.description',
        icon: 'apps',
        iconColor: '#00BF47',
        gradientColors: ['#0A0F0A', '#1A2F1A'],
      },
      {
        id: 'community',
        title: 'onboarding.community.title',
        description: 'onboarding.community.description',
        icon: 'people',
        iconColor: '#00BF47',
        gradientColors: ['#0A0F0A', '#1A2F1A'],
      },
      {
        id: 'privacy',
        title: 'onboarding.privacy.title',
        description: 'onboarding.privacy.description',
        icon: 'shield-checkmark',
        iconColor: '#00BF47',
        gradientColors: ['#0A0F0A', '#1A2F1A'],
      },
    ];
  }
}

export const onboardingService = new OnboardingService();
