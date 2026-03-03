/**
 * User Safety Service
 * Handles blocking, reporting, and EULA functionality
 * Refactored: userId-based via JWT auth (sessionId removed from user-facing methods)
 */

import { getApiBaseUrl, joinUrl } from '../utils/apiBaseUrl';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthHeaders } from './authService';

const STORAGE_KEYS = {
  BLOCKED_USERS: '@tribun_blocked_users',
  EULA_ACCEPTED: '@tribun_eula_accepted',
  EULA_VERSION: '@tribun_eula_version',
  BAN_STATUS: '@tribun_ban_status',
};

// Types
export interface BlockedSessionDto {
  id: string;
  blockerUserId?: string;
  blockedUserId?: string;
  context: string;
  reason?: string;
  createdAt: string;
}

export interface ContentReportDto {
  id: string;
  contentType: string;
  contentId: string;
  reporterUserId?: string;
  creatorUserId?: string;
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
  userId?: string;
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

// Ban check types
export interface BanCheckResult {
  isBanned: boolean;
  reason?: string;
  expiresAt?: string;
  category?: string;
  isPermanent?: boolean;
}

export interface BanStatus {
  isBanned: boolean;
  reason?: string;
  expiresAt?: string;
  category?: string;
  isPermanent?: boolean;
  checkedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

class UserSafetyService {
  private baseUrl: string;
  private blockedUserIdsCache: Set<string> = new Set();
  private banStatusCache: BanStatus | null = null;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    this.loadBlockedUsersFromCache();
    this.loadBanStatusFromCache();
  }

  private buildUrl(path: string): string {
    return joinUrl(this.baseUrl, path);
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const authHeaders = await getAuthHeaders();
    return { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders };
  }

  // ============ BLOCKING ============

  /**
   * Block a user by their userId. Blocker identified via JWT.
   */
  async blockUser(
    blockedUserId: string,
    context: ContentType = 'FanMoment',
    reason?: string
  ): Promise<ApiResponse<BlockedSessionDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/block'), {
        method: 'POST',
        headers: await this.buildHeaders(),
        body: JSON.stringify({ blockedUserId, context, reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to block user: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        this.blockedUserIdsCache.add(blockedUserId.toLowerCase());
        await this.saveBlockedUsersToCache();
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to block user', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Unblock a user by their userId. Blocker identified via JWT.
   */
  async unblockUser(blockedUserId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/block'), {
        method: 'DELETE',
        headers: await this.buildHeaders(),
        body: JSON.stringify({ blockedUserId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unblock user: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        this.blockedUserIdsCache.delete(blockedUserId.toLowerCase());
        await this.saveBlockedUsersToCache();
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to unblock user', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get list of blocked user IDs. Blocker identified via JWT.
   */
  async getBlockedUserIds(): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/blocked/userids'), {
        method: 'GET',
        headers: await this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get blocked user ids: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        this.blockedUserIdsCache = new Set(result.data.map((id: string) => id.toLowerCase()));
        await this.saveBlockedUsersToCache();
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to get blocked user ids', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if an authenticated user is blocked by userId (local cache)
   */
  isUserBlocked(userId: string): boolean {
    return this.blockedUserIdsCache.has(userId.toLowerCase());
  }

  /**
   * Unified block check — works for authenticated (userId) senders
   */
  isBlocked(sessionId?: string, userId?: string): boolean {
    if (userId && this.blockedUserIdsCache.has(userId.toLowerCase())) return true;
    return false;
  }

  /**
   * Refresh blocked user IDs from server
   */
  async refreshBlockedSessions(): Promise<void> {
    await this.getBlockedUserIds();
  }

  private async loadBlockedUsersFromCache(): Promise<void> {
    try {
      const cachedUsers = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      if (cachedUsers) {
        const ids = JSON.parse(cachedUsers) as string[];
        this.blockedUserIdsCache = new Set(ids.map(id => id.toLowerCase()));
      }
    } catch (error) {
      logger.error('UserSafety: Failed to load blocked users cache', error);
    }
  }

  private async saveBlockedUsersToCache(): Promise<void> {
    try {
      const ids = Array.from(this.blockedUserIdsCache);
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(ids));
    } catch (error) {
      logger.error('UserSafety: Failed to save blocked users cache', error);
    }
  }

  // ============ REPORTING ============

  /**
   * Report content. Reporter identified via JWT.
   * creatorUserId is optional — backend auto-resolves from content if not provided.
   */
  async reportContent(
    contentType: ContentType,
    contentId: string,
    category: ReportCategory,
    description?: string,
    creatorUserId?: string
  ): Promise<ApiResponse<ContentReportDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/report'), {
        method: 'POST',
        headers: await this.buildHeaders(),
        body: JSON.stringify({
          contentType,
          contentId,
          category,
          description,
          creatorUserId,
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
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============ EULA ============

  async getEulaStatus(): Promise<ApiResponse<EulaStatusDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/eula/status'), {
        method: 'GET',
        headers: await this.buildHeaders(),
      });

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
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async acceptEula(
    eulaVersion: string,
    deviceInfo?: string,
    appVersion?: string
  ): Promise<ApiResponse<EulaAcceptanceDto>> {
    try {
      const response = await fetch(this.buildUrl('/api/UserSafety/eula/accept'), {
        method: 'POST',
        headers: await this.buildHeaders(),
        body: JSON.stringify({ eulaVersion, deviceInfo, appVersion }),
      });

      if (!response.ok) {
        throw new Error(`Failed to accept EULA: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.EULA_ACCEPTED, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.EULA_VERSION, eulaVersion);
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to accept EULA', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async needsEulaAcceptance(): Promise<boolean> {
    try {
      const accepted = await AsyncStorage.getItem(STORAGE_KEYS.EULA_ACCEPTED);
      const version = await AsyncStorage.getItem(STORAGE_KEYS.EULA_VERSION);
      if (accepted === 'true' && version === '1.0') return false;
      const response = await this.getEulaStatus();
      if (response.success && response.data) return response.data.needsAcceptance;
      return true;
    } catch (error) {
      logger.error('UserSafety: Error checking EULA status', error);
      return true;
    }
  }

  // ============ PLATFORM BAN ============

  /**
   * Check if user is banned. Uses JWT if available, sessionId as fallback for anonymous.
   */
  async checkBanStatus(
    sessionId?: string,
    deviceId?: string
  ): Promise<ApiResponse<BanCheckResult>> {
    try {
      let url = this.buildUrl('/api/Ban/check');
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (deviceId) params.append('deviceId', deviceId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: await this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to check ban status: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const banStatus: BanStatus = { ...result.data, checkedAt: new Date().toISOString() };
        this.banStatusCache = banStatus;
        await this.saveBanStatusToCache(banStatus);
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('UserSafety: Failed to check ban status', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getCachedBanStatus(): BanStatus | null {
    return this.banStatusCache;
  }

  isBanned(): boolean {
    if (!this.banStatusCache) return false;
    if (!this.banStatusCache.isPermanent && this.banStatusCache.expiresAt) {
      if (new Date(this.banStatusCache.expiresAt) < new Date()) {
        this.banStatusCache = null;
        this.clearBanStatusCache();
        return false;
      }
    }
    return this.banStatusCache.isBanned;
  }

  getBanReason(): string | undefined {
    return this.banStatusCache?.reason;
  }

  private async loadBanStatusFromCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.BAN_STATUS);
      if (cached) {
        const banStatus = JSON.parse(cached) as BanStatus;
        if (!banStatus.isPermanent && banStatus.expiresAt) {
          if (new Date(banStatus.expiresAt) < new Date()) {
            await this.clearBanStatusCache();
            return;
          }
        }
        this.banStatusCache = banStatus;
      }
    } catch (error) {
      logger.error('UserSafety: Failed to load ban status cache', error);
    }
  }

  private async saveBanStatusToCache(banStatus: BanStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BAN_STATUS, JSON.stringify(banStatus));
    } catch (error) {
      logger.error('UserSafety: Failed to save ban status cache', error);
    }
  }

  private async clearBanStatusCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.BAN_STATUS);
      this.banStatusCache = null;
    } catch (error) {
      logger.error('UserSafety: Failed to clear ban status cache', error);
    }
  }

  handleBanError(error: string): boolean {
    const banKeywords = ['banned', 'yasakli', 'yasaklı', 'ban', 'engellendi'];
    return banKeywords.some(keyword => error.toLowerCase().includes(keyword));
  }
}

export const userSafetyService = new UserSafetyService();
