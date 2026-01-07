import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { consentService } from '../services/consentService';
import type { ConsentCategory } from '../types/onboarding';

type Props = {
  onComplete: () => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
};

const ConsentScreen: React.FC<Props> = ({
  onComplete,
  onViewTerms,
  onViewPrivacy,
}) => {
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [categories, setCategories] = useState<ConsentCategory[]>(
    consentService.getConsentCategories()
  );

  const handleCategoryToggle = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id && !cat.required
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const handleAccept = async () => {
    if (!termsAccepted || !privacyAccepted) {
      Alert.alert(
        t('consent.error.title'),
        t('consent.error.requiredConsents'),
        [{ text: t('ok') }]
      );
      return;
    }

    try {
      // Save consent preferences
      await consentService.saveConsentPreferences({
        termsAccepted,
        privacyAccepted,
        dataProcessingConsent: true, // Required
        marketingConsent: categories.find((c) => c.id === 'marketing')?.enabled || false,
        analyticsConsent: categories.find((c) => c.id === 'analytics')?.enabled || false,
        adTrackingConsent: false, // Will be asked separately via ATT
      });

      // Request iOS ATT permission if enabled
      if (Platform.OS === 'ios') {
        const adTrackingCategory = categories.find((c) => c.id === 'adTracking');
        if (adTrackingCategory?.enabled) {
          await consentService.requestTrackingPermission();
        }
      }

      onComplete();
    } catch (error) {
      Alert.alert(
        t('error'),
        t('consent.error.saveFailed'),
        [{ text: t('ok') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('consent.title')}</Text>
          <Text style={styles.subtitle}>{t('consent.subtitle')}</Text>
        </View>

        {/* Required Consents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('consent.required')}</Text>

          {/* Terms of Service */}
          <Pressable
            style={styles.consentItem}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={styles.checkbox}>
              {termsAccepted && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                {t('consent.termsAcceptance')}{' '}
                <Text style={styles.link} onPress={onViewTerms}>
                  {t('consent.termsLink')}
                </Text>
              </Text>
            </View>
          </Pressable>

          {/* Privacy Policy */}
          <Pressable
            style={styles.consentItem}
            onPress={() => setPrivacyAccepted(!privacyAccepted)}
          >
            <View style={styles.checkbox}>
              {privacyAccepted && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                {t('consent.privacyAcceptance')}{' '}
                <Text style={styles.link} onPress={onViewPrivacy}>
                  {t('consent.privacyLink')}
                </Text>
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Optional Consents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('consent.optional')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('consent.optionalDescription')}
          </Text>

          {categories
            .filter((cat) => !cat.required)
            .map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{t(category.name)}</Text>
                  <Text style={styles.categoryDescription}>
                    {t(category.description)}
                  </Text>
                </View>
                <Switch
                  value={category.enabled}
                  onValueChange={() => handleCategoryToggle(category.id)}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary,
                  }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.border}
                />
              </View>
            ))}
        </View>

        {/* KVKK Notice */}
        <View style={styles.kvkkNotice}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.kvkkText}>{t('consent.kvkkNotice')}</Text>
        </View>
      </ScrollView>

      {/* Accept Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.acceptButton,
            (!termsAccepted || !privacyAccepted) && styles.acceptButtonDisabled,
            pressed && styles.acceptButtonPressed,
          ]}
          onPress={handleAccept}
          disabled={!termsAccepted || !privacyAccepted}
        >
          <LinearGradient
            colors={
              termsAccepted && privacyAccepted
                ? [colors.primary, colors.accent]
                : [colors.border, colors.border]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.acceptButtonGradient}
          >
            <Text style={styles.acceptButtonText}>{t('consent.accept')}</Text>
            <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.xs,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.text,
    lineHeight: 22,
  },
  link: {
    color: colors.primary,
    fontFamily: typography.semiBold,
    textDecorationLine: 'underline',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  categoryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  categoryName: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  kvkkNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  kvkkText: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassStroke,
  },
  acceptButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  acceptButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
  },
});

export default ConsentScreen;
