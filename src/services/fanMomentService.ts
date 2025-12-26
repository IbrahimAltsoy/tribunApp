import * as SecureStore from 'expo-secure-store';
import type {
  FanMomentDto,
  CreateFanMomentRequest,
  UpdateOwnFanMomentRequest,
  DeleteOwnFanMomentRequest
} from '../types/fanMoment';

// Get API URL from environment or use default
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/fanmoments`;

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
      console.log('📱 ⚠️ NEW SESSION ID CREATED (this should only happen ONCE!):', sessionId);
      console.log('📱 ℹ️ Using SecureStore for persistent storage');
    } else {
      console.log('📱 ✅ Existing session ID loaded from SecureStore:', sessionId);
    }

    return sessionId;
  } catch (error) {
    console.error('❌ Error managing session ID:', error);
    throw error;
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
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns paginated response with items array
    const data: FanMomentDto[] = json.data?.items || json.items || json;

    console.log('✅ Fetched fan moments with ownership flags:', data.length);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ Error fetching fan moments:', error);
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
      },
      body: JSON.stringify(requestWithSession),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: FanMomentDto}
    const moment: FanMomentDto = json.data || json;

    console.log('✅ Fan moment created successfully with session ID');

    return {
      success: true,
      data: moment,
    };
  } catch (error) {
    console.error('❌ Error creating fan moment:', error);
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

    console.log('✅ Fan moment updated successfully');

    return {
      success: true,
      data: moment,
    };
  } catch (error) {
    console.error('❌ Error updating fan moment:', error);
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
      },
      body: JSON.stringify(requestWithSession),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized: You can only delete your own moments');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Fan moment deleted successfully');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error deleting fan moment:', error);
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
