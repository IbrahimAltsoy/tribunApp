/**
 * useBanStatus Hook
 * Handles ban status checking and provides ban-related state/actions
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userSafetyService, BanCheckResult, BanStatus } from '../services/userSafetyService';
import { logger } from '../utils/logger';

const SESSION_ID_KEY = '@tribun_session_id';
const DEVICE_ID_KEY = '@tribun_device_id';

interface UseBanStatusResult {
  isBanned: boolean;
  banInfo: BanStatus | null;
  isLoading: boolean;
  checkBanStatus: () => Promise<boolean>;
  showBanAlert: () => void;
}

export const useBanStatus = (): UseBanStatusResult => {
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [banInfo, setBanInfo] = useState<BanStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkBanStatus = useCallback(async (): Promise<boolean> => {
    try {
      const sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
      const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!sessionId) {
        logger.warn('useBanStatus: No session ID found');
        setIsBanned(false);
        setIsLoading(false);
        return false;
      }

      const result = await userSafetyService.checkBanStatus(sessionId, deviceId || undefined);

      if (result.success && result.data) {
        const banned = result.data.isBanned;
        setIsBanned(banned);

        if (banned) {
          setBanInfo({
            ...result.data,
            checkedAt: new Date().toISOString(),
          });
        } else {
          setBanInfo(null);
        }

        setIsLoading(false);
        return banned;
      }

      // If API fails, check local cache
      const cachedStatus = userSafetyService.getCachedBanStatus();
      if (cachedStatus) {
        setIsBanned(cachedStatus.isBanned);
        setBanInfo(cachedStatus);
      }

      setIsLoading(false);
      return cachedStatus?.isBanned || false;
    } catch (error) {
      logger.error('useBanStatus: Error checking ban status', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const showBanAlert = useCallback(() => {
    if (!banInfo) return;

    let message = banInfo.reason || 'Hesabiniz platform kurallarini ihlal ettigi icin yasaklandi.';

    if (!banInfo.isPermanent && banInfo.expiresAt) {
      const expiresAt = new Date(banInfo.expiresAt);
      const formattedDate = expiresAt.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      message += `\n\nYasak bitis tarihi: ${formattedDate}`;
    } else {
      message += '\n\nBu yasak kalici olarak uygulanmistir.';
    }

    Alert.alert(
      'Hesabiniz Yasaklandi',
      message,
      [{ text: 'Tamam', style: 'default' }],
      { cancelable: true }
    );
  }, [banInfo]);

  // Check ban status on mount
  useEffect(() => {
    // First check local cache for quick response
    const cachedStatus = userSafetyService.getCachedBanStatus();
    if (cachedStatus) {
      setIsBanned(cachedStatus.isBanned);
      setBanInfo(cachedStatus);
    }

    // Then check with server
    checkBanStatus();
  }, [checkBanStatus]);

  return {
    isBanned,
    banInfo,
    isLoading,
    checkBanStatus,
    showBanAlert,
  };
};

/**
 * Helper function to check ban status before an action
 * Use this in action handlers to prevent banned users from performing actions
 */
export const checkBanBeforeAction = async (
  onBanned?: () => void
): Promise<boolean> => {
  const sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!sessionId) {
    return true; // Allow action if no session
  }

  const result = await userSafetyService.checkBanStatus(sessionId, deviceId || undefined);

  if (result.success && result.data?.isBanned) {
    // Show alert
    const banInfo = result.data;
    let message = banInfo.reason || 'Hesabiniz platform kurallarini ihlal ettigi icin yasaklandi.';

    if (!banInfo.isPermanent && banInfo.expiresAt) {
      const expiresAt = new Date(banInfo.expiresAt);
      const formattedDate = expiresAt.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      message += `\n\nYasak bitis tarihi: ${formattedDate}`;
    }

    Alert.alert('Islem Yapilamiyor', message, [{ text: 'Tamam' }]);

    onBanned?.();
    return false;
  }

  return true;
};

/**
 * Handle API error that might be a ban
 * Returns true if it was a ban error and handled
 */
export const handlePossibleBanError = (error: string): boolean => {
  if (userSafetyService.handleBanError(error)) {
    Alert.alert(
      'Islem Yapilamiyor',
      'Hesabiniz yasaklandigi icin bu islemi gerceklestiremezsiniz.',
      [{ text: 'Tamam' }]
    );
    return true;
  }
  return false;
};
