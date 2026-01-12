/**
 * Comprehensive Push Notification Service
 * Handles push notifications, token management, deep linking, and notification preferences
 */

import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";

// Lazy load notifications to avoid Expo Go errors
let Notifications: typeof import('expo-notifications') | null = null;
const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const NOTIFICATION_API_BASE_URL = getApiBaseUrl("http://localhost:5118");

/**
 * Notification types that can be sent
 */
export enum NotificationType {
  CHAT_ROOM_OPENED = 'chat_room_opened',
  LIVE_MATCH = 'live_match',
  MATCH_GOAL = 'match_goal',
  MATCH_FINISHED = 'match_finished',
  NEWS_PUBLISHED = 'news_published',
  ANNOUNCEMENT_APPROVED = 'announcement_approved',
  POLL_CREATED = 'poll_created',
  GENERAL = 'general',
}

/**
 * Notification data payload
 */
export type NotificationData = {
  type: NotificationType;
  id?: string; // Entity ID (chatRoomId, matchId, newsId, etc.)
  notificationId?: string; // Notification history ID for mark-as-read functionality
  title: string;
  body: string;
  [key: string]: any; // Additional custom data
};

/**
 * User notification preferences
 */
export type NotificationPreferences = {
  enabled: boolean;
  chatRooms: boolean;
  liveMatches: boolean;
  matchGoals: boolean;
  news: boolean;
  announcements: boolean;
  polls: boolean;
};

/**
 * Default notification preferences
 */
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  chatRooms: true,
  liveMatches: true,
  matchGoals: true,
  news: true,
  announcements: true,
  polls: true,
};

/**
 * Initialize notifications module
 */
const initNotifications = async (): Promise<boolean> => {
  if (Notifications) return true;

  // Skip notifications in Expo Go Android (development mode)
  if (__DEV__ && Platform.OS === 'android') {
    logger.log('Notifications disabled in Expo Go Android');
    return false;
  }

  try {
    Notifications = await import('expo-notifications');

    // Configure notification behavior
    if (Platform.OS !== 'web') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Setup Android notification channels
      if (Platform.OS === 'android') {
        await setupAndroidChannels();
      }
    }

    return true;
  } catch (error) {
    logger.error('Failed to initialize notifications:', error);
    return false;
  }
};

/**
 * Setup Android notification channels
 */
const setupAndroidChannels = async (): Promise<void> => {
  if (!Notifications) return;

  const channels = [
    {
      id: 'chat',
      name: 'Chat Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      description: 'Notifications for chat room openings and messages',
    },
    {
      id: 'matches',
      name: 'Match Notifications',
      importance: Notifications.AndroidImportance.MAX,
      description: 'Live match updates and goal notifications',
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    },
    {
      id: 'news',
      name: 'News Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Latest news and announcements',
    },
    {
      id: 'general',
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Other notifications',
    },
  ];

  for (const channel of channels) {
    try {
      await Notifications.setNotificationChannelAsync(channel.id, channel);
    } catch (error) {
      logger.error(`Failed to create channel ${channel.id}:`, error);
    }
  }
};

/**
 * Get Android channel ID based on notification type
 */
const getAndroidChannelId = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.CHAT_ROOM_OPENED:
      return 'chat';
    case NotificationType.LIVE_MATCH:
    case NotificationType.MATCH_GOAL:
    case NotificationType.MATCH_FINISHED:
      return 'matches';
    case NotificationType.NEWS_PUBLISHED:
    case NotificationType.ANNOUNCEMENT_APPROVED:
      return 'news';
    default:
      return 'general';
  }
};

/**
 * Request notification permissions
 */
const requestPermissions = async (): Promise<boolean> => {
  try {
    const initialized = await initNotifications();
    if (!initialized || !Notifications) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    logger.error('Failed to request notification permissions:', error);
    return false;
  }
};

/**
 * Get Expo Push Token
 * This token should be sent to your backend to enable push notifications
 */
const getExpoPushToken = async (): Promise<string | null> => {
  try {
    // Notifications only work on physical devices
    if (!Device.isDevice) {
      return null;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    const initialized = await initNotifications();
    if (!initialized || !Notifications) return null;

    // Get the Expo push token
    // Note: Requires EAS project setup. For development, local notifications work without this.
    let projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

    // Fallback to expo-constants if env var not set
    if (!projectId) {
      try {
        projectId = Constants.expoConfig?.extra?.eas?.projectId;
      } catch (error) {
        logger.error('Failed to load expo-constants:', error);
      }
    }

    if (!projectId) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    // Save token to AsyncStorage for later retrieval
    await AsyncStorage.setItem('expo_push_token', tokenData.data);

    return tokenData.data;
  } catch (error) {
    logger.error('Failed to get push token:', error);
    return null;
  }
};

/**
 * Register push token with backend
 */
const registerPushToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(joinUrl(API_BASE_URL, "/api/notifications/register"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        deviceId: Device.osInternalBuildId || 'unknown',
        deviceName: Device.deviceName || 'unknown',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Failed to register token:', response.status, errorText);
      throw new Error(`Failed to register token: ${response.status}`);
    }

    await response.json();
    return true;
  } catch (error) {
    logger.error('Failed to register push token:', error);
    return false;
  }
};

/**
 * Initialize push notifications
 * Call this on app startup after user login/authentication
 */
const initialize = async (): Promise<void> => {
  try {
    const token = await getExpoPushToken();
    if (token) {
      await registerPushToken(token);
    }
  } catch (error) {
    logger.error('Failed to initialize push notifications:', error);
  }
};

/**
 * Schedule a local notification
 */
const scheduleLocalNotification = async (
  data: NotificationData,
  delaySeconds: number = 0
): Promise<void> => {
  try {
    const initialized = await initNotifications();
    if (!initialized || !Notifications) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Check user preferences
    const preferences = await getPreferences();
    if (!preferences.enabled) return;

    // Check if this notification type is enabled
    if (!isNotificationTypeEnabled(data.type, preferences)) {
      logger.log(`Notification type ${data.type} is disabled by user`);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: data,
        sound: true,
        priority: 'high',
        ...(Platform.OS === 'android' && {
          channelId: getAndroidChannelId(data.type),
        }),
      },
      trigger:
        delaySeconds > 0
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: delaySeconds,
              repeats: false,
            }
          : null,
    });

    logger.log('Local notification scheduled:', data.type);
  } catch (error) {
    logger.error('Failed to schedule local notification:', error);
  }
};

/**
 * Check if a notification type is enabled in user preferences
 */
const isNotificationTypeEnabled = (
  type: NotificationType,
  preferences: NotificationPreferences
): boolean => {
  if (!preferences.enabled) return false;

  switch (type) {
    case NotificationType.CHAT_ROOM_OPENED:
      return preferences.chatRooms;
    case NotificationType.LIVE_MATCH:
    case NotificationType.MATCH_FINISHED:
      return preferences.liveMatches;
    case NotificationType.MATCH_GOAL:
      return preferences.matchGoals;
    case NotificationType.NEWS_PUBLISHED:
      return preferences.news;
    case NotificationType.ANNOUNCEMENT_APPROVED:
      return preferences.announcements;
    case NotificationType.POLL_CREATED:
      return preferences.polls;
    default:
      return true;
  }
};

/**
 * Add notification received listener
 */
const addNotificationReceivedListener = (
  callback: (notification: any) => void
): (() => void) | null => {
  if (!Notifications) return null;

  try {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  } catch (error) {
    logger.error('Failed to add notification received listener:', error);
    return null;
  }
};

/**
 * Add notification tapped/clicked listener
 */
const addNotificationResponseListener = (
  callback: (response: any) => void
): (() => void) | null => {
  if (!Notifications) return null;

  try {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  } catch (error) {
    logger.error('Failed to add notification response listener:', error);
    return null;
  }
};

/**
 * Get user notification preferences from storage
 */
const getPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const stored = await AsyncStorage.getItem('notification_preferences');

    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }

    return DEFAULT_PREFERENCES;
  } catch (error) {
    logger.error('Failed to get notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Save user notification preferences
 */
const savePreferences = async (preferences: NotificationPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));

    // Sync with backend
    await syncPreferencesWithBackend(preferences);
  } catch (error) {
    logger.error('Failed to save notification preferences:', error);
  }
};

/**
 * Sync preferences with backend
 */
const syncPreferencesWithBackend = async (
  preferences: NotificationPreferences
): Promise<void> => {
  try {
    await fetch(joinUrl(API_BASE_URL, "/api/notifications/preferences"), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
  } catch (error) {
    logger.error('Failed to sync preferences with backend:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
const cancelAllNotifications = async (): Promise<void> => {
  try {
    const initialized = await initNotifications();
    if (!initialized || !Notifications) return;

    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.log('All notifications cancelled');
  } catch (error) {
    logger.error('Failed to cancel notifications:', error);
  }
};

/**
 * Get badge count
 */
const getBadgeCount = async (): Promise<number> => {
  try {
    const initialized = await initNotifications();
    if (!initialized || !Notifications) return 0;

    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    return 0;
  }
};

/**
 * Set badge count
 */
const setBadgeCount = async (count: number): Promise<void> => {
  try {
    const initialized = await initNotifications();
    if (!initialized || !Notifications) return;

    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    logger.error('Failed to set badge count:', error);
  }
};

/**
 * Get notifications from backend
 */
const getNotifications = async (options?: {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<any> => {
  try {
    const pushToken = await getStoredPushToken();

    if (!pushToken) {
      return { success: false, data: [], totalCount: 0, unreadCount: 0 };
    }

    const params = new URLSearchParams({
      deviceId: pushToken,
      unreadOnly: options?.unreadOnly ? 'true' : 'false',
      page: (options?.page || 1).toString(),
      pageSize: (options?.pageSize || 20).toString(),
    });

    const fullUrl = `${joinUrl(NOTIFICATION_API_BASE_URL, "/api/notifications")}?${params}`;
    const response = await fetch(fullUrl);
    const result = await response.json();

    return result;
  } catch (error) {
    logger.error('Failed to get notifications:', error);
    return { success: false, data: [], totalCount: 0, unreadCount: 0 };
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      joinUrl(NOTIFICATION_API_BASE_URL, `/api/notifications/${notificationId}/mark-as-read`),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    logger.error('Failed to mark notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (): Promise<number> => {
  try {
    const pushToken = await getStoredPushToken();

    if (!pushToken) {
      return 0;
    }

    const response = await fetch(
      `${joinUrl(NOTIFICATION_API_BASE_URL, "/api/notifications/mark-all-as-read")}?deviceId=${pushToken}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    return result.data || 0;
  } catch (error) {
    logger.error('Failed to mark all as read:', error);
    return 0;
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await fetch(joinUrl(NOTIFICATION_API_BASE_URL, `/api/notifications/${notificationId}`), {
      method: 'DELETE',
    });

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    logger.error('Failed to delete notification:', error);
    return false;
  }
};

/**
 * Get stored push token from AsyncStorage
 */
const getStoredPushToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('expo_push_token');
  } catch (error) {
    logger.error('Failed to get stored push token:', error);
    return null;
  }
};

export const notificationService = {
  // Initialization
  initialize,
  requestPermissions,
  getExpoPushToken,
  registerPushToken,

  // Local notifications
  scheduleLocalNotification,

  // Listeners
  addNotificationReceivedListener,
  addNotificationResponseListener,

  // Preferences
  getPreferences,
  savePreferences,

  // API calls
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,

  // Utilities
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
};

export { DEFAULT_PREFERENCES };
