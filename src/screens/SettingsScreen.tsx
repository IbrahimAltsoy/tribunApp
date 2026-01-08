import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { onboardingService } from '../services/onboardingService';
import { consentService } from '../services/consentService';

type Props = {
  onViewTerms: () => void;
  onViewPrivacy: () => void;
  onManageConsent: () => void;
  onManageNotifications: () => void;
  onOpenNotificationTest?: () => void;
};

const SettingsScreen: React.FC<Props> = ({
  onViewTerms,
  onViewPrivacy,
  onManageConsent,
  onManageNotifications,
  onOpenNotificationTest,
}) => {
  const { t } = useTranslation();

  const handleResetOnboarding = () => {
    Alert.alert(
      t('settings.resetOnboarding.title'),
      t('settings.resetOnboarding.message'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.resetOnboarding.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await onboardingService.resetOnboarding();
              await consentService.resetConsents();
              Alert.alert(
                t('success'),
                t('settings.resetOnboarding.success'),
                [
                  {
                    text: t('ok'),
                    onPress: () => {
                      // App will restart and show onboarding
                      if (Platform.OS === 'ios') {
                        // @ts-ignore
                        RNRestart?.Restart?.();
                      } else {
                        // For Android, we can use react-native-restart or just notify
                        Alert.alert(
                          t('settings.resetOnboarding.restartTitle'),
                          t('settings.resetOnboarding.restartMessage')
                        );
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(t('error'), t('settings.resetOnboarding.error'));
            }
          },
        },
      ]
    );
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
          <Ionicons name="settings" size={40} color={colors.primary} />
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.legal.title')}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={onViewTerms}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="document-text" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {t('settings.legal.termsOfService')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.legal.termsDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={onViewPrivacy}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {t('settings.legal.privacyPolicy')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.legal.privacyDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy.title')}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={onManageConsent}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="finger-print" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {t('settings.privacy.manageConsent')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.privacy.consentDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications.sectionTitle')}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={onManageNotifications}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {t('settings.notifications.manage')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.notifications.manageDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.developer.title')}</Text>

          {onOpenNotificationTest && (
            <Pressable
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed,
              ]}
              onPress={onOpenNotificationTest}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  Test Notifications
                </Text>
                <Text style={styles.settingDescription}>
                  Test push notification features
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={handleResetOnboarding}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="refresh" size={22} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.error }]}>
                {t('settings.developer.resetOnboarding')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.developer.resetDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('settings.footer.version', { version: '1.0.0' })}
          </Text>
          <Text style={styles.footerText}>
            {t('settings.footer.copyright')}
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default SettingsScreen;
