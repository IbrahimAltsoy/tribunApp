/**
 * Notification Test Screen
 * For testing push notification functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { notificationService, NotificationType } from '../services/notificationService';
import { logger } from '../utils/logger';

const NotificationTestScreen: React.FC = () => {
  const { t } = useTranslation();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDeviceInfo();
    initializeNotifications();
  }, []);

  const loadDeviceInfo = () => {
    setDeviceInfo({
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      platform: Platform.OS,
      isDevice: Device.isDevice,
    });
  };

  const initializeNotifications = async () => {
    try {
      setLoading(true);
      const token = await notificationService.getExpoPushToken();
      setPushToken(token);
      logger.log('Push token obtained:', token);
    } catch (error) {
      logger.error('Failed to get push token:', error);
      Alert.alert('Error', 'Failed to get push token');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    Alert.alert(
      'Permissions',
      granted ? 'Notification permissions granted' : 'Notification permissions denied'
    );
  };

  const handleRegisterToken = async () => {
    if (!pushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      setLoading(true);
      const success = await notificationService.registerPushToken(pushToken);
      Alert.alert(
        'Register Token',
        success ? 'Token registered successfully' : 'Failed to register token'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register token');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleLocalNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification(
        {
          type: NotificationType.GENERAL,
          title: testTitle,
          body: testBody,
        },
        2 // 2 seconds delay
      );
      Alert.alert('Success', 'Local notification scheduled for 2 seconds from now');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const handleGetPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      Alert.alert('Preferences', JSON.stringify(prefs, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to get preferences');
    }
  };

  const handleTestChatNotification = async () => {
    await notificationService.scheduleLocalNotification(
      {
        type: NotificationType.CHAT_ROOM_OPENED,
        id: 'test-chat-123',
        title: '💬 Yeni Sohbet Odası',
        body: 'Test Sohbet Odası açıldı! Katıl ve konuş.',
      },
      2
    );
    Alert.alert('Success', 'Chat notification scheduled');
  };

  const handleTestMatchNotification = async () => {
    await notificationService.scheduleLocalNotification(
      {
        type: NotificationType.MATCH_GOAL,
        id: 'test-match-456',
        title: '⚽ GOOOOL!',
        body: 'Test Player (45\')',
      },
      2
    );
    Alert.alert('Success', 'Match notification scheduled');
  };

  const handleGetBadgeCount = async () => {
    const count = await notificationService.getBadgeCount();
    Alert.alert('Badge Count', `Current badge count: ${count}`);
  };

  const handleSetBadgeCount = async () => {
    await notificationService.setBadgeCount(5);
    Alert.alert('Success', 'Badge count set to 5');
  };

  const handleClearBadge = async () => {
    await notificationService.setBadgeCount(0);
    Alert.alert('Success', 'Badge cleared');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="notifications" size={40} color={colors.primary} />
        <Text style={styles.headerTitle}>Notification Test</Text>
        <Text style={styles.headerSubtitle}>Test push notification features</Text>
      </View>

      {/* Device Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.card}>
          <InfoRow label="Brand" value={deviceInfo.brand || 'N/A'} />
          <InfoRow label="Model" value={deviceInfo.modelName || 'N/A'} />
          <InfoRow label="OS" value={`${deviceInfo.osName} ${deviceInfo.osVersion}` || 'N/A'} />
          <InfoRow label="Platform" value={deviceInfo.platform || 'N/A'} />
          <InfoRow
            label="Is Physical Device"
            value={deviceInfo.isDevice ? 'Yes' : 'No (Simulator)'}
          />
        </View>
      </View>

      {/* Push Token */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Token</Text>
        <View style={styles.card}>
          <Text style={styles.tokenText} numberOfLines={2}>
            {pushToken || 'No token available'}
          </Text>
        </View>
      </View>

      {/* Custom Notification Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Notification</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Notification Title"
            placeholderTextColor={colors.textTertiary}
            value={testTitle}
            onChangeText={setTestTitle}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Notification Body"
            placeholderTextColor={colors.textTertiary}
            value={testBody}
            onChangeText={setTestBody}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tests</Text>

        <TestButton
          icon="key"
          label="Request Permissions"
          onPress={handleRequestPermissions}
          disabled={loading}
        />

        <TestButton
          icon="refresh"
          label="Get Push Token"
          onPress={initializeNotifications}
          disabled={loading}
        />

        <TestButton
          icon="cloud-upload"
          label="Register Token with Backend"
          onPress={handleRegisterToken}
          disabled={loading || !pushToken}
        />

        <TestButton
          icon="notifications"
          label="Schedule Custom Local Notification"
          onPress={handleScheduleLocalNotification}
          disabled={loading}
        />

        <TestButton
          icon="chatbubbles"
          label="Test Chat Notification"
          onPress={handleTestChatNotification}
          disabled={loading}
        />

        <TestButton
          icon="football"
          label="Test Match Goal Notification"
          onPress={handleTestMatchNotification}
          disabled={loading}
        />

        <TestButton
          icon="settings"
          label="Get Preferences"
          onPress={handleGetPreferences}
          disabled={loading}
        />

        <TestButton
          icon="notifications-circle"
          label="Get Badge Count"
          onPress={handleGetBadgeCount}
          disabled={loading}
        />

        <TestButton
          icon="add-circle"
          label="Set Badge Count (5)"
          onPress={handleSetBadgeCount}
          disabled={loading}
        />

        <TestButton
          icon="close-circle"
          label="Clear Badge"
          onPress={handleClearBadge}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

type InfoRowProps = {
  label: string;
  value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

type TestButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const TestButton: React.FC<TestButtonProps> = ({ icon, label, onPress, disabled = false }) => (
  <Pressable
    style={({ pressed }) => [
      styles.testButton,
      pressed && styles.testButtonPressed,
      disabled && styles.testButtonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Ionicons name={icon} size={20} color={disabled ? colors.textTertiary : colors.primary} />
    <Text style={[styles.testButtonText, disabled && styles.testButtonTextDisabled]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassStroke,
  },
  infoLabel: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.white,
    flex: 1,
    textAlign: 'right',
  },
  tokenText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.mono,
    color: colors.primary,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    marginBottom: spacing.md,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    gap: spacing.sm,
  },
  testButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
    flex: 1,
  },
  testButtonTextDisabled: {
    color: colors.textTertiary,
  },
});

export default NotificationTestScreen;
