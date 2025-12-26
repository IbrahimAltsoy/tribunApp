import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PollDto, VotePollRequest } from '../types/poll';

// Get API URL from environment or use default
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/polls`;

// Language state for API requests
let currentLanguage = 'tr';

/**
 * Get or create a unique session ID for this device
 */
const getSessionId = async (): Promise<string> => {
  try {
    let sessionId = await AsyncStorage.getItem('userSessionId');

    if (!sessionId) {
      // Generate a new UUID v4
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      await AsyncStorage.setItem('userSessionId', sessionId);
      console.log('📱 New session ID created:', sessionId);
    }

    return sessionId;
  } catch (error) {
    console.error('❌ Error managing session ID:', error);
    throw error;
  }
};

/**
 * Set language for poll requests
 */
const setLanguage = (language: string): void => {
  currentLanguage = language;
  console.log('🌐 Poll service language set to:', language);
};

/**
 * Get single active poll (for home screen)
 */
const getActivePoll = async (): Promise<{ success: boolean; data?: PollDto; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/active?language=${currentLanguage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': currentLanguage,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: PollDto}
    const poll: PollDto = json.data || json;

    console.log('✅ Fetched active poll:', poll?.question);

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    console.error('❌ Error fetching active poll:', error);
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
    const response = await fetch(`${API_URL}/active?language=${currentLanguage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': currentLanguage,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: PollDto} for single poll or array
    const polls: PollDto[] = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : (Array.isArray(json) ? json : []));

    console.log('✅ Fetched active polls:', polls.length);

    return {
      success: true,
      data: polls,
    };
  } catch (error) {
    console.error('❌ Error fetching active polls:', error);
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
      },
      body: JSON.stringify(voteRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Backend returns {success: true, data: PollDto}
    const poll: PollDto = json.data || json;

    console.log('✅ Vote submitted successfully');

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    console.error('❌ Error submitting vote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const pollService = {
  getSessionId,
  setLanguage,
  getActivePoll,
  getActivePolls,
  votePoll,
};
