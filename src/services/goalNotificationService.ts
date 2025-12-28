import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Lazy load notifications to avoid Expo Go errors on import
let Notifications: typeof import('expo-notifications') | null = null;

/**
 * Initialize notifications module
 */
const initNotifications = async () => {
  if (Notifications) return;

  try {
    Notifications = await import('expo-notifications');

    // Configure notification behavior (only for standalone builds, not Expo Go)
    if (Platform.OS !== 'web') {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      } catch (error) {
        // Ignore error in Expo Go
      }
    }
  } catch (error) {
    console.log('Notifications not available in this environment');
  }
};

/**
 * Sound instance for goal notification
 */
let goalSound: Audio.Sound | null = null;

/**
 * Initialize audio and notifications
 */
const initializeAudio = async (): Promise<void> => {
  try {
    // Set audio mode to allow sound to play even when device is in silent mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    // Silent error - audio may not work but app continues
  }

  // Setup Android notification channel
  if (Platform.OS === 'android') {
    try {
      await initNotifications();
      if (Notifications) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Goal Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }
    } catch (error) {
      // Silent error - channel creation failed but notifications may still work
    }
  }
};

/**
 * Load goal sound
 */
const loadGoalSound = async (): Promise<void> => {
  try {
    if (goalSound) {
      await goalSound.unloadAsync();
    }

    // Try to load goal.mp3 from assets/sounds/
    // If file doesn't exist, this will fail gracefully
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/goal.mp3'),
        { shouldPlay: false }
      );
      goalSound = sound;
    } catch {
      // Goal sound file not found - use system beep as fallback
      // You can add a goal.mp3 file to assets/sounds/ directory
      goalSound = null;
    }
  } catch (error) {
    // Silent error - sound won't play but other notifications still work
    goalSound = null;
  }
};

/**
 * Play goal sound effect
 */
const playGoalSound = async (): Promise<void> => {
  try {
    if (!goalSound) {
      await loadGoalSound();
    }

    if (goalSound) {
      await goalSound.replayAsync();
    }
  } catch (error) {
    // Silent error - app continues without sound
  }
};

/**
 * Trigger haptic feedback for goal
 */
const triggerHapticFeedback = async (): Promise<void> => {
  try {
    // Heavy impact for goal celebration
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Additional vibrations for celebration effect
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 100);

    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 200);
  } catch (error) {
    // Silent error - haptics not available on this device
  }
};

/**
 * Request notification permissions
 */
const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    await initNotifications();
    if (!Notifications) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    // Silent error - notifications won't work
    return false;
  }
};

/**
 * Show local push notification for goal
 */
const showGoalNotification = async (
  teamName: string,
  playerName: string,
  minute: number
): Promise<void> => {
  try {
    await initNotifications();
    if (!Notifications) {
      console.log('Notifications not available');
      return;
    }

    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Use presentNotificationAsync for Expo Go compatibility
    // This works in both Expo Go and standalone builds
    await Notifications.presentNotificationAsync({
      title: '⚽ GOL!',
      body: `${teamName} - ${playerName} (${minute}')`,
      data: { type: 'goal', teamName, playerName, minute },
      ...(Platform.OS === 'android' && {
        android: {
          channelId: 'default',
          priority: 'high',
          sound: true,
        },
      }),
      ...(Platform.OS === 'ios' && {
        ios: {
          sound: true,
        },
      }),
    });
  } catch (error) {
    console.log('Notification error:', error);
    // Silent error - notification won't show but app continues
  }
};

/**
 * Trigger all goal celebration effects
 */
const celebrateGoal = async (
  teamName: string,
  playerName: string,
  minute: number
): Promise<void> => {
  // Run all effects in parallel
  await Promise.all([
    playGoalSound(),
    triggerHapticFeedback(),
    showGoalNotification(teamName, playerName, minute),
  ]);
};

/**
 * Cleanup audio resources
 */
const cleanup = async (): Promise<void> => {
  try {
    if (goalSound) {
      await goalSound.unloadAsync();
      goalSound = null;
    }
  } catch (error) {
    // Silent error
  }
};

// Initialize audio on module load
initializeAudio();

export const goalNotificationService = {
  celebrateGoal,
  playGoalSound,
  triggerHapticFeedback,
  showGoalNotification,
  cleanup,
};
