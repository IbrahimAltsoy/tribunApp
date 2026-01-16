import * as SecureStore from 'expo-secure-store';
import type {
  FanMomentDto,
  CreateFanMomentRequest,
  UpdateOwnFanMomentRequest,
  DeleteOwnFanMomentRequest
} from '../types/fanMoment';

import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { languageService } from "../utils/languageService";

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/fanmoments");

/**
 * Get or create a unique session ID for this device
 * Uses SecureStore for persistent storage across app restarts
 */
const getSessionId = async (): Promise<string> => {
  try {
    let sessionId = await SecureStore.getItemAsync('userSessionId');

    if (!sessionId) {
      // Generate a new UUID v4
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      await SecureStore.setItemAsync('userSessionId', sessionId);
    }

    return sessionId;
  } catch (error) {
    // Silent error - generate fallback session ID
    return 'fallback-session-' + Date.now();
  }
};

/**
 * Get fan moments with optional pagination and status filter
 */
const getFanMoments = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  status?: 'Pending' | 'Approved' | 'Rejected'
): Promise<{ success: boolean; data?: FanMomentDto[]; error?: string }> => {
  try {
    const sessionId = await getSessionId();

    // Build query parameters
    const params = new URLSearchParams({
      sessionId,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...languageService.getRequestHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns paginated response with items array
    const data: FanMomentDto[] = json.data?.items || json.items || json;

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    // Silent error - app continues working with empty data
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get approved fan moments with ownership information
 * @deprecated Use getFanMoments instead
 */
const getApprovedFanMoments = async (): Promise<{ success: boolean; data?: FanMomentDto[]; error?: string }> => {
  return getFanMoments(1, 100, "Approved");
};

/**
 * Create a new fan moment with session ID for ownership tracking
 */
const createFanMoment = async (
  request: Omit<CreateFanMomentRequest, 'sessionId'>
): Promise<{ success: boolean; data?: FanMomentDto; error?: string }> => {
  try {
    const sessionId = await getSessionId();

    const requestWithSession: CreateFanMomentRequest = {
      ...request,
      sessionId,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...languageService.getRequestHeaders(),
      },
      body: JSON.stringify(requestWithSession),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: FanMomentDto}
    const moment: FanMomentDto = json.data || json;

    return {
      success: true,
      data: moment,
    };
  } catch (error) {
    // Silent error - user-friendly error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update own fan moment (requires ownership verification via session ID)
 */
const updateOwnFanMoment = async (
  id: string,
  request: Omit<UpdateOwnFanMomentRequest, 'sessionId'>
): Promise<{ success: boolean; data?: FanMomentDto; error?: string }> => {
  try {
    const sessionId = await getSessionId();

    const requestWithSession: UpdateOwnFanMomentRequest = {
      ...request,
      sessionId,
    };

    const response = await fetch(`${API_URL}/${id}/update-own`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...languageService.getRequestHeaders(),
      },
      body: JSON.stringify(requestWithSession),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized: You can only update your own moments');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: FanMomentDto}
    const moment: FanMomentDto = json.data || json;

    return {
      success: true,
      data: moment,
    };
  } catch (error) {
    // Silent error - user-friendly error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Delete own fan moment (requires ownership verification via session ID)
 */
const deleteOwnFanMoment = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const sessionId = await getSessionId();

    const requestWithSession: DeleteOwnFanMomentRequest = {
      sessionId,
    };

    const response = await fetch(`${API_URL}/${id}/delete-own`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...languageService.getRequestHeaders(),
      },
      body: JSON.stringify(requestWithSession),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized: You can only delete your own moments');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    // Silent error - user-friendly error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const fanMomentService = {
  getSessionId,
  getFanMoments,
  getApprovedFanMoments,
  createFanMoment,
  updateOwnFanMoment,
  deleteOwnFanMoment,
};
