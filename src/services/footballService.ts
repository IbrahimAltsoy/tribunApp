import type { StandingTableDto, TeamScheduleResponse, LiveScoreDto } from '../types/football';

// Get API URL from environment or use default
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/football`;

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
    console.error('❌ Error fetching standings table:', error);
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
    console.error('❌ Error fetching team schedule:', error);
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
    console.error('❌ Error fetching live scores:', error);
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
};
