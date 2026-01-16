import * as SecureStore from 'expo-secure-store';
import type { PollDto, VotePollRequest } from '../types/poll';
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { languageService } from "../utils/languageService";

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/polls");

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
 * Get single active poll (for home screen)
 */
const getActivePoll = async (): Promise<{ success: boolean; data?: PollDto; error?: string }> => {
  try {
    const currentLanguage = languageService.getLanguage();
    const response = await fetch(`${API_URL}/active?language=${currentLanguage}`, {
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

    // Backend returns {success: true, data: PollDto}
    const poll: PollDto = json.data || json;

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    // Silent error - app continues working
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get all active polls
 */
const getActivePolls = async (): Promise<{ success: boolean; data?: PollDto[]; error?: string }> => {
  try {
    const currentLanguage = languageService.getLanguage();
    const response = await fetch(`${API_URL}/active?language=${currentLanguage}`, {
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

    // Backend returns {success: true, data: PollDto} for single poll or array
    const polls: PollDto[] = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : (Array.isArray(json) ? json : []));

    return {
      success: true,
      data: polls,
    };
  } catch (error) {
    // Silent error - app continues working
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Submit a vote for a poll option
 */
const votePoll = async (
  pollOptionId: string
): Promise<{ success: boolean; data?: PollDto; error?: string }> => {
  try {
    const sessionId = await getSessionId();

    const voteRequest: VotePollRequest = {
      pollOptionId,
      sessionId,
    };

    const response = await fetch(`${API_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...languageService.getRequestHeaders(),
      },
      body: JSON.stringify(voteRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: PollDto}
    const poll: PollDto = json.data || json;

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    // Silent error - user-friendly error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const pollService = {
  getSessionId,
  getActivePoll,
  getActivePolls,
  votePoll,
};
