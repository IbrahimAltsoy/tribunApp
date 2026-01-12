/**
 * Deep Linking for Notifications
 * Handles navigation when user taps on a notification
 */

import { NotificationType, type NotificationData } from "../services/notificationService";
import { notificationService } from "../services/notificationService";
import { logger } from "./logger";

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
export const getNavigationAction = (
  data: NotificationData
): NavigationAction | null => {
  try {
    switch (data.type) {
      case NotificationType.CHAT_ROOM_OPENED:
        return {
          screen: "MainTabs",
          params: {
            screen: "Mars",
          },
        };

      case NotificationType.LIVE_MATCH:
      case NotificationType.MATCH_GOAL:
      case NotificationType.MATCH_FINISHED:
        return {
          screen: "MainTabs",
          params: {
            screen: "Fixture",
            params: {
              matchId: data.id,
            },
          },
        };

      case NotificationType.NEWS_PUBLISHED:
        return {
          screen: "MainTabs",
          params: {
            screen: "Feed",
            params: {
              newsId: data.id,
            },
          },
        };

      case NotificationType.ANNOUNCEMENT_APPROVED:
      case NotificationType.POLL_CREATED:
        return {
          screen: "MainTabs",
          params: {
            screen: "Mars",
          },
        };

      case NotificationType.GENERAL:
      default:
        return {
          screen: "MainTabs",
          params: {
            screen: "Home",
          },
        };
    }
  } catch (error) {
    logger.error("Failed to get navigation action:", error);
    return null;
  }
};

/**
 * Handle notification response (when user taps notification)
 */
export const handleNotificationResponse = async (
  response: any,
  navigationRef: any
): Promise<void> => {
  try {
    const data = response?.notification?.request?.content?.data as
      | NotificationData
      | undefined;

    if (!data) {
      logger.warn("No notification data found");
      return;
    }

    // Mark notification as read when user taps it
    if (data.notificationId) {
      logger.log("Marking notification as read:", data.notificationId);
      await notificationService.markAsRead(data.notificationId);
    }

    const action = getNavigationAction(data);

    if (!action) {
      logger.warn("No navigation action for notification type:", data.type);
      return;
    }

    // Wait for navigation to be ready
    setTimeout(() => {
      if (navigationRef?.current?.isReady()) {
        logger.log("Navigating to:", action.screen, action.params);
        navigationRef.current?.navigate(action.screen, action.params);
      } else {
        logger.warn("Navigation not ready");
      }
    }, 100);
  } catch (error) {
    logger.error("Failed to handle notification response:", error);
  }
};
