/**
 * User Safety Service
 * Handles blocking, reporting, and EULA functionality
 */

import { getApiBaseUrl, joinUrl } from '../utils/apiBaseUrl';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BLOCKED_SESSIONS: '@tribun_blocked_sessions',
  EULA_ACCEPTED: '@tribun_eula_accepted',
  EULA_VERSION: '@tribun_eula_version',
};

// Types
export interface BlockedSessionDto {
  id: string;
  blockerSessionId: string;
  blockedSessionId: string;
  context: string;
  reason?: string;
  createdAt: string;
}

export interface ContentReportDto {
  id: string;
  contentType: string;
  contentId: string;
  reporterSessionId: string;
  creatorSessionId?: string;
  category: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface EulaStatusDto {
  hasAccepted: boolean;
  acceptedVersion?: string;
  acceptedAt?: string;
  currentVersion: string;
  needsAcceptance: boolean;
}

export interface EulaAcceptanceDto {
  id: string;
  sessionId: string;
  eulaVersion: string;
  acceptedAt: string;
}

export type ReportCategory =
  | 'Inappropriate'
  | 'Spam'
  | 'Harassment'
  | 'HateSpeech'
  | 'Violence'
  | 'Other';

export type ContentType = 'FanMoment' | 'ChatMessage';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

class UserSafetyService {
  private baseUrl: string;
  private blockedSessionsCache: Set<string> = new Set();

  constructor() {
    this.baseUrl = getApiBaseUrl();
    this.loadBlockedSessionsFromCache();
  }

  private buildUrl(path: string): string {
    return joinUrl(this.baseUrl, path);
  }

  // ============ BLOCKING ============

  /**
   * Block a user by their session ID
   */
  async blockUser(
    sessionId: string,
    blockedSessionId: string,
    context: ContentType = 'ChatMessage',
    reason?: string
  ): Promise<ApiResponse<BlockedSessionDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/block'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          blockedSessionId,
          context,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to block user: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Update local cache
        this.blockedSessionsCache.add(blockedSessionId);
        await this.saveBlockedSessionsToCache();
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to block user', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(
    sessionId: string,
    blockedSessionId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/block'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          blockedSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unblock user: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local cache
        this.blockedSessionsCache.delete(blockedSessionId);
        await this.saveBlockedSessionsToCache();
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to unblock user', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of blocked session IDs for filtering
   */
  async getBlockedSessionIds(sessionId: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(
        this.buildUrl(`/api/UserSafety/blocked/ids?sessionId=${sessionId}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get blocked sessions: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Update local cache
        this.blockedSessionsCache = new Set(result.data);
        await this.saveBlockedSessionsToCache();
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to get blocked sessions', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if a session is blocked (uses local cache for performance)
   */
  isSessionBlocked(sessionId: string): boolean {
    return this.blockedSessionsCache.has(sessionId);
  }

  /**
   * Load blocked sessions from local cache
   */
  private async loadBlockedSessionsFromCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_SESSIONS);
      if (cached) {
        const ids = JSON.parse(cached) as string[];
        this.blockedSessionsCache = new Set(ids);
      }
    } catch (error) {
      logger.error('UserSafety: Failed to load blocked sessions cache', error);
    }
  }

  /**
   * Save blocked sessions to local cache
   */
  private async saveBlockedSessionsToCache(): Promise<void> {
    try {
      const ids = Array.from(this.blockedSessionsCache);
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_SESSIONS, JSON.stringify(ids));
    } catch (error) {
      logger.error('UserSafety: Failed to save blocked sessions cache', error);
    }
  }

  // ============ REPORTING ============

  /**
   * Report content
   */
  async reportContent(
    reporterSessionId: string,
    contentType: ContentType,
    contentId: string,
    category: ReportCategory,
    description?: string
  ): Promise<ApiResponse<ContentReportDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/report'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          reporterSessionId,
          contentType,
          contentId,
          category,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to report content: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to report content', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============ EULA ============

  /**
   * Get EULA status for a session
   */
  async getEulaStatus(sessionId: string): Promise<ApiResponse<EulaStatusDto>> {
    try {
      const response = await fetch(
        this.buildUrl(`/api/UserSafety/eula/status?sessionId=${sessionId}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get EULA status: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to get EULA status', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Accept EULA
   */
  async acceptEula(
    sessionId: string,
    eulaVersion: string,
    deviceInfo?: string,
    appVersion?: string
  ): Promise<ApiResponse<EulaAcceptanceDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/eula/accept'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          eulaVersion,
          deviceInfo,
          appVersion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to accept EULA: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Save locally for offline access
        await AsyncStorage.setItem(STORAGE_KEYS.EULA_ACCEPTED, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.EULA_VERSION, eulaVersion);
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to accept EULA', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if EULA needs to be shown (local check for quick response)
   */
  async needsEulaAcceptance(sessionId: string): Promise<boolean> {
    try {
      // First check local cache
      const accepted = await AsyncStorage.getItem(STORAGE_KEYS.EULA_ACCEPTED);
      const version = await AsyncStorage.getItem(STORAGE_KEYS.EULA_VERSION);

      // If locally accepted current version, skip API call
      if (accepted === 'true' && version === '1.0') {
        return false;
      }

      // Otherwise check with API
      const response = await this.getEulaStatus(sessionId);
      if (response.success && response.data) {
        return response.data.needsAcceptance;
      }

      // If API fails, show EULA to be safe
      return true;
    } catch (error) {
      logger.error('UserSafety: Error checking EULA status', error);
      return true;
    }
  }

  /**
   * Refresh blocked sessions from server
   */
  async refreshBlockedSessions(sessionId: string): Promise<void> {
    await this.getBlockedSessionIds(sessionId);
  }
}

// Export singleton instance
export const userSafetyService = new UserSafetyService();
