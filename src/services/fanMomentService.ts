import * as SecureStore from 'expo-secure-store';
import type {
  FanMomentDto,
  LikeToggleResult,
  CreateFanMomentRequest,
  UpdateOwnFanMomentRequest,
} from '../types/fanMoment';

import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { authService } from './authService';

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/fanmoments");
const PROFILE_URL = joinUrl(API_BASE_URL, "/api/profile");

/**
 * Get or create a unique session ID for anonymous users.
 * Used only as fallback when user is not authenticated.
 */
const getSessionId = async (): Promise<string> => {
  try {
    let sessionId = await SecureStore.getItemAsync('userSessionId');

    if (!sessionId) {
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      await SecureStore.setItemAsync('userSessionId', sessionId);
    }

    return sessionId;
  } catch {
    return 'fallback-session-' + Date.now();
  }
};

/**
 * Build headers — includes JWT if available, always includes Content-Type and language
 */
const buildHeaders = async (includeAuth: boolean = true): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const authHeaders = await authService.getAuthHeaders();
    Object.assign(headers, authHeaders);
  }

  return headers;
};

/**
 * Get fan moments with optional pagination and status filter.
 * Sends JWT if available so backend can populate hasLiked and isOwnMoment.
 */
const getFanMoments = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  status?: 'Pending' | 'Approved' | 'Rejected'
): Promise<{ success: boolean; data?: FanMomentDto[]; totalCount?: number; error?: string }> => {
  try {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const headers = await buildHeaders(true);

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    const data: FanMomentDto[] = json.data?.items || json.items || json;
    const totalCount: number = json.data?.totalCount ?? json.totalCount ?? data.length;

    return { success: true, data, totalCount };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * @deprecated Use getFanMoments instead
 */
const getApprovedFanMoments = async (): Promise<{ success: boolean; data?: FanMomentDto[]; error?: string }> => {
  return getFanMoments(1, 100, "Approved");
};

/**
 * Like or unlike a fan moment. Requires JWT authentication.
 * Returns { success: false, error: 'unauthorized' } when not logged in.
 */
const likeMoment = async (id: string): Promise<{ success: boolean; data?: LikeToggleResult; error?: string }> => {
  try {
    const headers = await buildHeaders(true);

    const response = await fetch(`${API_URL}/${id}/like`, {
      method: 'POST',
      headers,
    });

    if (response.status === 401) {
      return { success: false, error: 'unauthorized' };
    }

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.message || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const result: LikeToggleResult = json.data || json;

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Create a new fan moment.
 * Sends JWT if authenticated (backend sets creatorUserId automatically).
 * Falls back to sessionId for anonymous users.
 */
const createFanMoment = async (
  request: Omit<CreateFanMomentRequest, 'sessionId'>
): Promise<{ success: boolean; data?: FanMomentDto; error?: string }> => {
  try {
    const token = await authService.getAccessToken();
    const headers = await buildHeaders(true);

    const body: CreateFanMomentRequest = token
      ? { ...request }
      : { ...request, sessionId: await getSessionId() };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (response.status === 403) {
      return { success: false, error: json.message || json.error || 'banned' };
    }

    if (!response.ok) {
      return { success: false, error: json.message || json.error || `HTTP error! status: ${response.status}` };
    }

    const moment: FanMomentDto = json.data || json;
    return { success: true, data: moment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update own fan moment.
 * Uses JWT auth. Owner verified by backend from JWT sub claim.
 */
const updateOwnFanMoment = async (
  id: string,
  request: UpdateOwnFanMomentRequest
): Promise<{ success: boolean; data?: FanMomentDto; error?: string }> => {
  try {
    const headers = await buildHeaders(true);

    const response = await fetch(`${API_URL}/${id}/update-own`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Bu anı düzenleme yetkiniz yok.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const moment: FanMomentDto = json.data || json;
    return { success: true, data: moment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Delete own fan moment.
 * Uses JWT auth. Owner verified by backend from JWT sub claim.
 */
const deleteOwnFanMoment = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const headers = await buildHeaders(true);

    const response = await fetch(`${API_URL}/${id}/delete-own`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Bu anı silme yetkiniz yok.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get the authenticated user's own fan moments (profile page).
 */
const getMyMoments = async (
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<{ success: boolean; data?: FanMomentDto[]; totalCount?: number; error?: string }> => {
  try {
    const headers = await buildHeaders(true);
    const params = new URLSearchParams({ pageNumber: pageNumber.toString(), pageSize: pageSize.toString() });
    const response = await fetch(`${PROFILE_URL}/moments?${params}`, { method: 'GET', headers });

    if (response.status === 401) return { success: false, error: 'unauthorized' };
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const json = await response.json();
    const data: FanMomentDto[] = json.data?.items || json.items || [];
    const totalCount: number = json.data?.totalCount ?? json.totalCount ?? data.length;
    return { success: true, data, totalCount };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get fan moments liked by the authenticated user (profile page).
 */
const getLikedMoments = async (
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<{ success: boolean; data?: FanMomentDto[]; totalCount?: number; error?: string }> => {
  try {
    const headers = await buildHeaders(true);
    const params = new URLSearchParams({ pageNumber: pageNumber.toString(), pageSize: pageSize.toString() });
    const response = await fetch(`${PROFILE_URL}/moments/liked?${params}`, { method: 'GET', headers });

    if (response.status === 401) return { success: false, error: 'unauthorized' };
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const json = await response.json();
    const data: FanMomentDto[] = json.data?.items || json.items || [];
    const totalCount: number = json.data?.totalCount ?? json.totalCount ?? data.length;
    return { success: true, data, totalCount };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get approved moments created by a specific user (public — no auth required).
 */
const getUserMoments = async (
  creatorUserId: string,
  pageNumber: number = 1,
  pageSize: number = 20,
): Promise<{ success: boolean; data?: FanMomentDto[]; totalCount?: number; error?: string }> => {
  try {
    const params = new URLSearchParams({ pageNumber: pageNumber.toString(), pageSize: pageSize.toString() });
    const response = await fetch(`${PROFILE_URL}/${creatorUserId}/moments?${params}`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    const data: FanMomentDto[] = json.data?.items || json.items || [];
    const totalCount: number = json.data?.totalCount ?? json.totalCount ?? data.length;
    return { success: true, data, totalCount };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get moments liked by a specific user (public — no auth required).
 */
const getUserLikedMoments = async (
  userId: string,
  pageNumber: number = 1,
  pageSize: number = 20,
): Promise<{ success: boolean; data?: FanMomentDto[]; totalCount?: number; error?: string }> => {
  try {
    const params = new URLSearchParams({ pageNumber: pageNumber.toString(), pageSize: pageSize.toString() });
    const response = await fetch(`${PROFILE_URL}/${userId}/moments/liked?${params}`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    const data: FanMomentDto[] = json.data?.items || json.items || [];
    const totalCount: number = json.data?.totalCount ?? json.totalCount ?? data.length;
    return { success: true, data, totalCount };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get public profile for any user by userId (no auth required).
 */
const getUserPublicProfile = async (
  userId: string,
): Promise<{ success: boolean; data?: { id: string; username: string; displayName?: string; avatarUrl?: string; bio?: string; createdAt: string }; error?: string }> => {
  try {
    const response = await fetch(`${PROFILE_URL}/${userId}`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    return { success: true, data: json.data || json };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const fanMomentService = {
  getSessionId,
  getFanMoments,
  getApprovedFanMoments,
  likeMoment,
  createFanMoment,
  updateOwnFanMoment,
  deleteOwnFanMoment,
  getMyMoments,
  getLikedMoments,
  getUserMoments,
  getUserLikedMoments,
  getUserPublicProfile,
};
