import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { notificationService, type NotificationPreferences } from '../services/notificationService';
import { logger } from '../utils/logger';

type Props = {
  onClose?: () => void;
};

const NotificationPreferences: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    chatRooms: true,
    liveMatches: true,
    matchGoals: true,
    news: true,
    announcements: true,
    polls: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      logger.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    // If disabling master switch, warn user
    if (key === 'enabled' && preferences.enabled) {
      Alert.alert(
        t('settings.notifications.disableTitle'),
        t('settings.notifications.disableMessage'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('settings.notifications.disableConfirm'),
            style: 'destructive',
            onPress: async () => {
              const newPrefs = { ...preferences, [key]: !preferences[key] };
              setPreferences(newPrefs);
              await notificationService.savePreferences(newPrefs);
            },
          },
        ]
      );
      return;
    }

    // If enabling master switch, request permissions
    if (key === 'enabled' && !preferences.enabled) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          t('settings.notifications.permissionDeniedTitle'),
          t('settings.notifications.permissionDeniedMessage')
        );
        return;
      }
    }

    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    await notificationService.savePreferences(newPrefs);
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification(
        {
          type: 'general' as any,
          title: t('settings.notifications.testTitle'),
          body: t('settings.notifications.testBody'),
        },
        2 // 2 seconds delay
      );

      Alert.alert(
        t('success'),
        t('settings.notifications.testScheduled')
      );
    } catch (error) {
      Alert.alert(t('error'), t('settings.notifications.testFailed'));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="notifications" size={40} color={colors.primary} />
        <Text style={styles.headerTitle}>{t('settings.notifications.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('settings.notifications.subtitle')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Switch */}
        <View style={styles.section}>
          <View style={styles.masterSwitchCard}>
            <View style={styles.masterSwitchContent}>
              <View style={styles.masterSwitchIcon}>
                <Ionicons
                  name={preferences.enabled ? 'notifications' : 'notifications-off'}
                  size={24}
                  color={preferences.enabled ? colors.primary : colors.textTertiary}
                />
              </View>
              <View style={styles.masterSwitchText}>
                <Text style={styles.masterSwitchTitle}>
                  {t('settings.notifications.enableAll')}
                </Text>
                <Text style={styles.masterSwitchSubtitle}>
                  {preferences.enabled
                    ? t('settings.notifications.enabledDescription')
                    : t('settings.notifications.disabledDescription')}
                </Text>
              </View>
              <Switch
                value={preferences.enabled}
                onValueChange={() => handleToggle('enabled')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* Individual Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.notifications.categories')}
          </Text>

          {/* Chat Rooms */}
          <PreferenceItem
            icon="chatbubbles"
            title={t('settings.notifications.chatRooms')}
            description={t('settings.notifications.chatRoomsDescription')}
            value={preferences.chatRooms}
            onToggle={() => handleToggle('chatRooms')}
            disabled={!preferences.enabled}
          />

          {/* Live Matches */}
          <PreferenceItem
            icon="football"
            title={t('settings.notifications.liveMatches')}
            description={t('settings.notifications.liveMatchesDescription')}
            value={preferences.liveMatches}
            onToggle={() => handleToggle('liveMatches')}
            disabled={!preferences.enabled}
          />

          {/* Match Goals */}
          <PreferenceItem
            icon="trophy"
            title={t('settings.notifications.matchGoals')}
            description={t('settings.notifications.matchGoalsDescription')}
            value={preferences.matchGoals}
            onToggle={() => handleToggle('matchGoals')}
            disabled={!preferences.enabled}
          />

          {/* News */}
          <PreferenceItem
            icon="newspaper"
            title={t('settings.notifications.news')}
            description={t('settings.notifications.newsDescription')}
            value={preferences.news}
            onToggle={() => handleToggle('news')}
            disabled={!preferences.enabled}
          />

          {/* Announcements */}
          <PreferenceItem
            icon="megaphone"
            title={t('settings.notifications.announcements')}
            description={t('settings.notifications.announcementsDescription')}
            value={preferences.announcements}
            onToggle={() => handleToggle('announcements')}
            disabled={!preferences.enabled}
          />

          {/* Polls */}
          <PreferenceItem
            icon="bar-chart"
            title={t('settings.notifications.polls')}
            description={t('settings.notifications.pollsDescription')}
            value={preferences.polls}
            onToggle={() => handleToggle('polls')}
            disabled={!preferences.enabled}
          />
        </View>

        {/* Test Notification */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.testButton,
              pressed && styles.testButtonPressed,
            ]}
            onPress={handleTestNotification}
            disabled={!preferences.enabled}
          >
            <Ionicons name="flask" size={20} color={colors.white} />
            <Text style={styles.testButtonText}>
              {t('settings.notifications.testButton')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Close Button */}
      {onClose && (
        <Pressable
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>{t('actions.close')}</Text>
        </Pressable>
      )}
    </View>
  );
};

type PreferenceItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

const PreferenceItem: React.FC<PreferenceItemProps> = ({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled = false,
}) => {
  return (
    <View style={[styles.preferenceItem, disabled && styles.preferenceItemDisabled]}>
      <View style={styles.preferenceIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={disabled ? colors.textTertiary : colors.primary}
        />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={[styles.preferenceTitle, disabled && styles.preferenceTextDisabled]}>
          {title}
        </Text>
        <Text
          style={[styles.preferenceDescription, disabled && styles.preferenceTextDisabled]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
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
  masterSwitchCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  masterSwitchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterSwitchIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  masterSwitchText: {
    flex: 1,
  },
  masterSwitchTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  masterSwitchSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  preferenceItemDisabled: {
    opacity: 0.5,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  preferenceDescription: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  preferenceTextDisabled: {
    color: colors.textTertiary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  testButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  testButtonText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  closeButton: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.glassStroke,
    padding: spacing.lg,
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
});

export default NotificationPreferences;
