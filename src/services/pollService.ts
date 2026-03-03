import type { PollDto, VotePollRequest } from '../types/poll';
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { getAuthHeaders } from './authService';

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/polls");

/**
 * Get single active poll (for home screen)
 */
const getActivePoll = async (): Promise<{ success: boolean; data?: PollDto; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const poll: PollDto = json.data || json;

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
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
    const response = await fetch(`${API_URL}/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const polls: PollDto[] = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : (Array.isArray(json) ? json : []));

    return {
      success: true,
      data: polls,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Submit a vote for a poll option — JWT auth required.
 * Returns 'unauthorized' error if not logged in.
 */
const votePoll = async (
  pollOptionId: string
): Promise<{ success: boolean; data?: PollDto; error?: string }> => {
  try {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders['Authorization']) {
      return { success: false, error: 'unauthorized' };
    }

    const voteRequest: VotePollRequest = { pollOptionId };

    const response = await fetch(`${API_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(voteRequest),
    });

    if (response.status === 401) {
      return { success: false, error: 'unauthorized' };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const poll: PollDto = json.data || json;

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check if the current user has voted for a specific poll option.
 * Returns false without a network call if not logged in.
 */
const hasVoted = async (
  pollOptionId: string
): Promise<{ success: boolean; data?: boolean; error?: string }> => {
  try {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders['Authorization']) {
      return { success: true, data: false };
    }

    const response = await fetch(`${API_URL}/has-voted?pollOptionId=${pollOptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (response.status === 401) {
      return { success: true, data: false };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return { success: true, data: json.data ?? false };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get the voted option ID for a given poll.
 * Returns null without a network call if not logged in.
 */
const getVotedOptionId = async (
  pollId: string
): Promise<{ success: boolean; data?: string | null; error?: string }> => {
  try {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders['Authorization']) {
      return { success: true, data: null };
    }

    const response = await fetch(`${API_URL}/voted-option?pollId=${pollId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (response.status === 401) {
      return { success: true, data: null };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return { success: true, data: json.data ?? null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const pollService = {
  getActivePoll,
  getActivePolls,
  votePoll,
  hasVoted,
  getVotedOptionId,
};
