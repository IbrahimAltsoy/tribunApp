import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { notificationService, type NotificationPreferences } from '../services/notificationService';
import { NotificationDto, NotificationType } from '../types/notification';
import { logger } from '../utils/logger';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type NotificationListProps = {
  onClose: () => void;
  onNotificationPress?: (notification: NotificationDto) => void;
};

type TabType = 'notifications' | 'settings';

const NotificationList: React.FC<NotificationListProps> = ({
  onClose,
  onNotificationPress,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    chatRooms: true,
    liveMatches: true,
    matchGoals: true,
    news: true,
    announcements: true,
    polls: true,
  });

  // Load notifications
  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      logger.log('📥 NotificationList: Loading notifications...');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await notificationService.getNotifications({
        page: 1,
        pageSize: 50,
      });

      logger.log('📥 NotificationList: Response received:', response);

      if (response.success && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount || 0);

        // Update badge count
        await notificationService.setBadgeCount(response.unreadCount || 0);
      }
    } catch (error) {
      logger.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      logger.error('Failed to load preferences:', error);
    }
  }, []);

  useEffect(() => {
    logger.log('🔔 NotificationList: Component mounted, loading data...');
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  // Handle notification press
  const handleNotificationPress = async (notification: NotificationDto) => {
    // Mark as read if unread
    if (!notification.isRead) {
      const success = await notificationService.markAsRead(notification.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await notificationService.setBadgeCount(Math.max(0, unreadCount - 1));
      }
    }

    // Call parent handler
    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const count = await notificationService.markAllAsRead();
      if (count > 0) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        await notificationService.setBadgeCount(0);
      }
    } catch (error) {
      logger.error('Failed to mark all as read:', error);
    }
  };

  // Handle preference toggle
  const handlePreferenceToggle = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    // If disabling all notifications, show confirmation
    if (key === 'enabled' && !value) {
      Alert.alert(
        t('settings.notifications.disableTitle') || 'Disable Notifications?',
        t('settings.notifications.disableMessage') || 'All notifications will be disabled.',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('settings.notifications.disableConfirm') || 'Disable',
            style: 'destructive',
            onPress: async () => {
              const newPrefs = { ...preferences, enabled: value };
              setPreferences(newPrefs);
              await notificationService.savePreferences(newPrefs);
            },
          },
        ]
      );
      return;
    }

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    await notificationService.savePreferences(newPrefs);
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.NewsPublished:
        return 'newspaper';
      case NotificationType.AnnouncementApproved:
        return 'megaphone';
      case NotificationType.PollCreated:
        return 'bar-chart';
      case NotificationType.System:
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  // Get color for notification type
  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.NewsPublished:
        return colors.primary;
      case NotificationType.AnnouncementApproved:
        return colors.accent;
      case NotificationType.PollCreated:
        return '#3B82F6';
      case NotificationType.System:
        return '#8B5CF6';
      default:
        return colors.textSecondary;
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}${t('notifications.minutesAgo') || 'm'}`;
    if (diffHours < 24) return `${diffHours}${t('notifications.hoursAgo') || 'h'}`;
    if (diffDays < 7) return `${diffDays}${t('notifications.daysAgo') || 'd'}`;

    return date.toLocaleDateString();
  };

  // Render notification item
  const renderNotification = ({ item }: { item: NotificationDto }) => (
    <Pressable
      style={({ pressed }) => [
        styles.notificationItem,
        !item.isRead && styles.notificationItemUnread,
        pressed && styles.notificationItemPressed,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getNotificationColor(item.type)}20` },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.type) as any}
          size={22}
          color={getNotificationColor(item.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              !item.isRead && styles.notificationTitleUnread,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>

        <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
      </View>
    </Pressable>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>{t('notifications.noNotifications') || 'No notifications'}</Text>
      <Text style={styles.emptySubtitle}>
        {t('notifications.noNotificationsSubtitle') || 'You\'re all caught up!'}
      </Text>
    </View>
  );

  // Settings content
  const renderSettings = () => (
    <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
      {/* Enable All Switch */}
      <View style={styles.settingSection}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {t('settings.notifications.enableAll') || 'Enable All Notifications'}
              </Text>
              <Text style={styles.settingDescription}>
                {preferences.enabled
                  ? t('settings.notifications.enabledDescription') || 'Notifications are enabled'
                  : t('settings.notifications.disabledDescription') || 'Notifications are disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.enabled}
            onValueChange={(value) => handlePreferenceToggle('enabled', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Category Title */}
      <Text style={styles.categoryTitle}>
        {t('settings.notifications.categories') || 'Notification Categories'}
      </Text>

      {/* Individual Categories */}
      <View style={styles.settingSection}>
        {/* News */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="newspaper" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, !preferences.enabled && styles.settingDisabled]}>
                {t('settings.notifications.news') || 'News'}
              </Text>
              <Text style={[styles.settingDescription, !preferences.enabled && styles.settingDisabled]}>
                {t('settings.notifications.newsDescription') || 'Get notified when new articles are published'}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.news}
            onValueChange={(value) => handlePreferenceToggle('news', value)}
            disabled={!preferences.enabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* Announcements */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.accent}15` }]}>
              <Ionicons name="megaphone" size={20} color={colors.accent} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, !preferences.enabled && styles.settingDisabled]}>
                {t('settings.notifications.announcements') || 'Announcements'}
              </Text>
              <Text style={[styles.settingDescription, !preferences.enabled && styles.settingDisabled]}>
                {t('settings.notifications.announcementsDescription') ||
                  'Get notified when your announcement is approved'}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.announcements}
            onValueChange={(value) => handlePreferenceToggle('announcements', value)}
            disabled={!preferences.enabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* Polls */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="bar-chart" size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, !preferences.enabled && styles.settingDisabled]}>
                {t('settings.notifications.polls') || 'Polls'}
              </Text>
              <Text style={[styles.settingDescription, !preferences.enabled && styles.settingDisabled]}>
                {t('settings.notifications.pollsDescription') || 'Get notified when new polls are created'}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.polls}
            onValueChange={(value) => handlePreferenceToggle('polls', value)}
            disabled={!preferences.enabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Legal Footer */}
      <View style={styles.legalFooter}>
        <View style={styles.divider} />
        <Text style={styles.legalTitle}>
          {t('settings.legal.title') || 'Legal'}
        </Text>
        <View style={styles.legalLinks}>
          <Pressable
            style={({ pressed }) => [
              styles.legalLink,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              onClose();
              navigation.navigate('Terms');
            }}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.legalLinkText}>
              {t('settings.legal.termsOfService') || 'Terms of Service'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.legalLink,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              onClose();
              navigation.navigate('Privacy');
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={styles.legalLinkText}>
              {t('settings.legal.privacyPolicy') || 'Privacy Policy'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
        <Text style={styles.legalFooterText}>
          {t('settings.footer.copyright') || '© 2026 Amedspor Tribün. All rights reserved.'}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <Ionicons
              name={activeTab === 'notifications' ? 'notifications' : 'settings'}
              size={22}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {activeTab === 'notifications'
                ? t('notifications.title') || 'Notifications'
                : t('settings.title') || 'Settings'}
            </Text>
            {activeTab === 'notifications' && unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadCount} {t('notifications.unread') || 'unread'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          {activeTab === 'notifications' && unreadCount > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.markAllButton,
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.6 },
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <Ionicons
            name="notifications"
            size={20}
            color={activeTab === 'notifications' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'notifications' && styles.tabTextActive,
            ]}
          >
            {t('notifications.title') || 'Notifications'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings"
            size={20}
            color={activeTab === 'settings' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            {t('settings.title') || 'Settings'}
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'notifications' ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadNotifications(true)}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        renderSettings()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  markAllButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  listContentEmpty: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
  notificationItemUnread: {
    backgroundColor: `${colors.primary}08`,
    borderColor: `${colors.primary}30`,
  },
  notificationItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  notificationTitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    flex: 1,
  },
  notificationTitleUnread: {
    fontFamily: typography.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationBody: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.textTertiary,
    marginTop: spacing.xs / 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  tabActive: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: colors.white,
  },
  // Settings
  settingsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingSection: {
    gap: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  settingDisabled: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  categoryTitle: {
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  // Legal Footer
  legalFooter: {
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  legalTitle: {
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  legalLinks: {
    gap: spacing.xs,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legalLinkText: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  legalFooterText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});

export default NotificationList;
