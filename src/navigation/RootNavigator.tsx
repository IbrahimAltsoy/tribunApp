import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, Theme, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import BottomTabs from './BottomTabs';
import OnboardingScreen from '../screens/OnboardingScreen';
import ConsentScreen from '../screens/ConsentScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import { colors } from '../theme/colors';
import { onboardingService } from '../services/onboardingService';
import { consentService } from '../services/consentService';
import { notificationService } from '../services/notificationService';
import { handleNotificationResponse } from '../utils/notificationDeepLink';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

type FlowState = 'loading' | 'onboarding' | 'consent' | 'main' | 'terms' | 'privacy' | 'manageConsent';

// Create navigation ref for deep linking
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [flowState, setFlowState] = useState<FlowState>('loading');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Setup notification response listener for deep linking
  useEffect(() => {
    const subscription = notificationService.addNotificationResponseListener((response) => {
      handleNotificationResponse(response, navigationRef);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await onboardingService.hasCompletedOnboarding();
      const consentPreferences = await consentService.getConsentPreferences();

      if (!hasCompletedOnboarding) {
        setFlowState('onboarding');
      } else if (!consentPreferences || !consentPreferences.termsAccepted || !consentPreferences.privacyAccepted) {
        setFlowState('consent');
      } else {
        setFlowState('main');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, default to showing onboarding
      setFlowState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setFlowState('consent');
  };

  const handleConsentComplete = () => {
    setFlowState('main');
  };

  const handleViewTerms = () => {
    setFlowState('terms');
  };

  const handleViewPrivacy = () => {
    setFlowState('privacy');
  };

  const handleCloseTerms = () => {
    setFlowState('consent');
  };

  const handleClosePrivacy = () => {
    setFlowState('consent');
  };

  if (flowState === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (flowState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (flowState === 'consent') {
    return (
      <ConsentScreen
        onComplete={handleConsentComplete}
        onViewTerms={handleViewTerms}
        onViewPrivacy={handleViewPrivacy}
      />
    );
  }

  if (flowState === 'terms') {
    return (
      <TermsOfServiceScreen
        onClose={handleCloseTerms}
        showAcceptButton={false}
      />
    );
  }

  if (flowState === 'privacy') {
    return (
      <PrivacyPolicyScreen
        onClose={handleClosePrivacy}
        showAcceptButton={false}
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen
          name="Terms"
          component={TermsOfServiceScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.primary,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyPolicyScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.primary,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
