/**
 * Deep Linking for Notifications
 * Handles navigation when user taps on a notification
 */

import { NotificationType, type NotificationData } from '../services/notificationService';
import { logger } from './logger';

/**
 * Navigation action for deep linking
 */
export type NavigationAction = {
  screen: string;
  params?: Record<string, any>;
};

/**
 * Get navigation action from notification data
 */
export const getNavigationAction = (data: NotificationData): NavigationAction | null => {
  try {
    switch (data.type) {
      case NotificationType.CHAT_ROOM_OPENED:
        return {
          screen: 'Marş', // Navigate to Marş tab
          params: {
            // If you have a specific chat screen, add it here
            // screen: 'Chat',
            // chatRoomId: data.id,
          },
        };

      case NotificationType.LIVE_MATCH:
      case NotificationType.MATCH_GOAL:
      case NotificationType.MATCH_FINISHED:
        return {
          screen: 'Maç', // Navigate to Maç (Fixture) tab
          params: {
            matchId: data.id,
          },
        };

      case NotificationType.NEWS_PUBLISHED:
        return {
          screen: 'Haber', // Navigate to Haber (News) tab
          params: {
            newsId: data.id,
          },
        };

      case NotificationType.ANNOUNCEMENT_APPROVED:
        return {
          screen: 'Marş', // Navigate to Marş tab
          params: {
            // If you have announcements screen, add it here
          },
        };

      case NotificationType.POLL_CREATED:
        return {
          screen: 'Marş', // Navigate to Marş tab
          params: {
            // If you have polls screen, add it here
          },
        };

      case NotificationType.GENERAL:
      default:
        return {
          screen: 'Ana Sayfa', // Navigate to Home tab
        };
    }
  } catch (error) {
    logger.error('Failed to get navigation action:', error);
    return null;
  }
};

/**
 * Handle notification response (when user taps notification)
 */
export const handleNotificationResponse = (
  response: any,
  navigationRef: any
): void => {
  try {
    const data = response?.notification?.request?.content?.data as NotificationData | undefined;

    if (!data) {
      logger.warn('No notification data found');
      return;
    }

    const action = getNavigationAction(data);

    if (!action) {
      logger.warn('No navigation action for notification type:', data.type);
      return;
    }

    // Wait for navigation to be ready
    setTimeout(() => {
      if (navigationRef?.current?.isReady()) {
        logger.log('Navigating to:', action.screen, action.params);
        navigationRef.current?.navigate(action.screen, action.params);
      } else {
        logger.warn('Navigation not ready');
      }
    }, 100);
  } catch (error) {
    logger.error('Failed to handle notification response:', error);
  }
};
