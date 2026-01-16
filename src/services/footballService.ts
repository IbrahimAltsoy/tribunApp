import type {
  StandingTableDto,
  TeamScheduleResponse,
  LiveScoreDto,
  ClipContentDto,
  TopScorerResponseDto
} from '../types/football';

import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { languageService } from "../utils/languageService";

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/football");

/**
 * Get standings table for a season
 */
const getStandingsTable = async (
  seasonId?: number
): Promise<{ success: boolean; data?: StandingTableDto[]; error?: string }> => {
  try {
    const url = seasonId
      ? `${API_URL}/standings-table/${seasonId}`
      : `${API_URL}/standings-table`;

    const response = await fetch(url, {
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

    return {
      success: true,
      data: json.data,
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
 * Get team schedule (last 5 matches and upcoming 5 matches)
 */
const getTeamSchedule = async (
  teamId: number
): Promise<{ success: boolean; data?: TeamScheduleResponse; error?: string }> => {
  try {
    const url = `${API_URL}/schedules/${teamId}`;

    const response = await fetch(url, {
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

    return {
      success: true,
      data: json.data,
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
 * Get live scores for in-play matches
 */
const getLiveScores = async (): Promise<{ success: boolean; data?: LiveScoreDto[]; error?: string }> => {
  try {
    const url = `${API_URL}/livescores/inplay`;

    const response = await fetch(url, {
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

    return {
      success: true,
      data: json.data,
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
 * Get published clip contents (videos/highlights)
 */
const getClipContents = async (): Promise<{
  success: boolean;
  data?: ClipContentDto[];
  error?: string;
}> => {
  try {
    const url = `${API_BASE_URL}/api/clipcontents/published`;

    const response = await fetch(url, {
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

    return {
      success: true,
      data: json.data,
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
 * Get top scorers for a season
 */
const getTopScorers = async (
  seasonId: number
): Promise<{ success: boolean; data?: TopScorerResponseDto; error?: string }> => {
  try {
    const url = `${API_URL}/topscorers/seasons/${seasonId}`;

    const response = await fetch(url, {
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

    return {
      success: true,
      data: json.data,
    };
  } catch (error) {
    // Silent error - app continues working
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const footballService = {
  getStandingsTable,
  getTeamSchedule,
  getLiveScores,
  getClipContents,
  getTopScorers,
};
