/**
 * API Service Layer
 * Centralized API communication with error handling, retries, and type safety
 * Currently uses mock data, but ready for backend integration
 */

import { API_CONFIG, ERROR_MESSAGES } from '../constants/app';
import { logger } from '../utils/logger';
import {
  NewsItem,
  FixtureItem,
  FanMoment,
  Poll,
  Announcement,
  Player,
  KitItem,
  StandingRow,
} from '../data/mockData';

// Import mock data for fallback
import {
  newsData,
  fixtureData,
  fanMoments,
  polls,
  announcements,
  players,
  kits,
  standings,
} from '../data/mockData';

/**
 * API Response wrapper
 */
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

/**
 * API Error class for better error handling
 */
class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * API Service Class
 */
class ApiService {
  private baseUrl: string;
  private timeout: number;
  private useMockData: boolean;

  constructor() {
    // Use environment variable or fallback to mock data
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
    this.timeout = API_CONFIG.TIMEOUT;
    this.useMockData = !this.baseUrl; // Use mock data if no API URL configured
  }

  /**
   * Generic fetch wrapper with timeout and error handling
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    if (this.useMockData) {
      logger.warn('API: Using mock data (no API URL configured)');
      throw new Error('Mock data mode - use specific methods');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `API Error: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.error('API: Request timeout');
          return {
            success: false,
            error: ERROR_MESSAGES.TIMEOUT_ERROR,
          };
        }

        logger.error('API: Fetch error', error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Simulate network delay for mock data (realistic UX)
   */
  private async simulateDelay(ms: number = 300): Promise<void> {
    if (__DEV__) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  // ========== NEWS ==========

  /**
   * Get all news articles
   */
  async getNews(): Promise<ApiResponse<NewsItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: newsData };
    }
    return this.fetch<NewsItem[]>('/news');
  }

  /**
   * Get news by ID
   */
  async getNewsById(id: string): Promise<ApiResponse<NewsItem>> {
    if (this.useMockData) {
      await this.simulateDelay();
      const news = newsData.find((n) => n.id === id);
      if (!news) {
        return { success: false, error: 'News not found' };
      }
      return { success: true, data: news };
    }
    return this.fetch<NewsItem>(`/news/${id}`);
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category: string): Promise<ApiResponse<NewsItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      const filtered = newsData.filter((n) => n.category === category);
      return { success: true, data: filtered };
    }
    return this.fetch<NewsItem[]>(`/news?category=${category}`);
  }

  // ========== FIXTURES ==========

  /**
   * Get all fixtures
   */
  async getFixtures(): Promise<ApiResponse<FixtureItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: fixtureData };
    }
    return this.fetch<FixtureItem[]>('/fixtures');
  }

  /**
   * Get standings
   */
  async getStandings(): Promise<ApiResponse<StandingRow[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: standings };
    }
    return this.fetch<StandingRow[]>('/standings');
  }

  // ========== FAN MOMENTS ==========

  /**
   * Get all fan moments
   */
  async getFanMoments(): Promise<ApiResponse<FanMoment[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: fanMoments };
    }
    return this.fetch<FanMoment[]>('/fan-moments');
  }

  /**
   * Submit a new fan moment
   */
  async submitFanMoment(
    moment: Omit<FanMoment, 'id' | 'timestamp'>
  ): Promise<ApiResponse<FanMoment>> {
    if (this.useMockData) {
      await this.simulateDelay(500);
      const newMoment: FanMoment = {
        id: `moment-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...moment,
      };
      return { success: true, data: newMoment };
    }

    return this.fetch<FanMoment>('/fan-moments', {
      method: 'POST',
      body: JSON.stringify(moment),
    });
  }

  // ========== POLLS ==========

  /**
   * Get active polls
   */
  async getPolls(): Promise<ApiResponse<Poll[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: polls };
    }
    return this.fetch<Poll[]>('/polls');
  }

  /**
   * Submit poll vote
   */
  async votePoll(pollId: string, optionId: string): Promise<ApiResponse<Poll>> {
    if (this.useMockData) {
      await this.simulateDelay(300);
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) {
        return { success: false, error: 'Poll not found' };
      }
      return { success: true, data: poll };
    }

    return this.fetch<Poll>(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  }

  // ========== ANNOUNCEMENTS ==========

  /**
   * Get all announcements
   */
  async getAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: announcements };
    }
    return this.fetch<Announcement[]>('/announcements');
  }

  /**
   * Submit new announcement
   */
  async submitAnnouncement(
    announcement: Omit<Announcement, 'id'>
  ): Promise<ApiResponse<Announcement>> {
    if (this.useMockData) {
      await this.simulateDelay(500);
      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        ...announcement,
        status: 'pending',
      };
      return { success: true, data: newAnnouncement };
    }

    return this.fetch<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  }

  // ========== PLAYERS ==========

  /**
   * Get all players
   */
  async getPlayers(): Promise<ApiResponse<Player[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: players };
    }
    return this.fetch<Player[]>('/players');
  }

  // ========== KITS ==========

  /**
   * Get all kits
   */
  async getKits(): Promise<ApiResponse<KitItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: kits };
    }
    return this.fetch<KitItem[]>('/kits');
  }
}

// Export singleton instance
export const api = new ApiService();

// Export types
export type { ApiResponse, ApiError };
