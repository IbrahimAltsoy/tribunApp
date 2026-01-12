/**
 * API Service Layer
 * Centralized API communication with error handling, retries, and type safety
 * Fully integrated with backend API
 */

import { API_CONFIG, ERROR_MESSAGES } from '../constants/app';
import { logger } from '../utils/logger';
import { getApiBaseUrl, joinUrl } from '../utils/apiBaseUrl';
import { ImageSourcePropType } from 'react-native';

/* ================= TYPE DEFINITIONS ================= */

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  category?: {
    id: string;
    slug: string;
    name: string;
  };
  authorName?: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  locale: string;
  createdAt: string;
};

export type FixtureItem = {
  id: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  isHome: boolean;
  status?: "upcoming" | "live" | "finished";
  score?: string;
};

export type FanMoment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  imageUrl?: string;
  caption: string;
  location?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
};

export type Poll = {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    voteCount: number;
  }>;
  totalVotes: number;
  endsAt: string;
  userVote?: string;
  isActive: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  city: string;
  location: string;
  date: string;
  contact: string;
  note?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
};

export type Player = {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  age?: number;
  birthDate?: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  marketValue?: string;
  imageUrl?: string;
  teamType: 'Mens' | 'Womens';
  isActive: boolean;
  instagramUrl?: string;
  twitterUrl?: string;
};

export type KitItem = {
  id: string;
  name: string;
  season: string;
  type: 'Home' | 'Away' | 'Third' | 'Special';
  imageUrl?: string;
  description?: string;
};

export type StandingRow = {
  pos: number;
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  positionChange?: number;
  logo?: string;
  form?: string[];
};

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
    this.baseUrl = getApiBaseUrl();
    this.timeout = API_CONFIG.TIMEOUT;
    this.useMockData = !this.baseUrl; // Use mock data if no API URL configured
  }

  private buildUrl(path: string): string {
    return joinUrl(this.baseUrl, path);
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
      const response = await fetch(this.buildUrl(endpoint), {
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
   * Get all news articles (paginated)
   */
  async getNews(pageNumber: number = 1, pageSize: number = 10, isPublished: boolean = true): Promise<ApiResponse<NewsItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: newsData };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/news?pageNumber=${pageNumber}&pageSize=${pageSize}&isPublished=${isPublished}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'tr',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }

      const result = await response.json();

      // Backend returns { success: true, data: { items: [...], totalPages: N, ... } }
      if (result.success && result.data?.items) {
        return { success: true, data: result.data.items };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch news', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get latest news (limited count)
   */
  async getLatestNews(count: number = 5): Promise<ApiResponse<NewsItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: newsData.slice(0, count) };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/news/latest?count=${count}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'tr',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch latest news: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch latest news', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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

    try {
      const response = await fetch(this.buildUrl(`/api/news/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'tr',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch news by id', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get news by category slug
   */
  async getNewsByCategory(categorySlug: string, pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<NewsItem[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      const filtered = newsData.filter((n) => n.category?.slug === categorySlug);
      return { success: true, data: filtered };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/news/category/${categorySlug}?pageNumber=${pageNumber}&pageSize=${pageSize}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'tr',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news by category: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data?.items) {
        return { success: true, data: result.data.items };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch news by category', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
   * Get all fan moments (paginated, only approved ones by default)
   */
  async getFanMoments(
    pageNumber: number = 1,
    pageSize: number = 10,
    status: string = 'Approved',
    sessionId?: string
  ): Promise<ApiResponse<FanMoment[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: fanMoments };
    }

    try {
      let url = this.buildUrl(`/api/fanmoments?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (status) {
        url += `&status=${status}`;
      }
      if (sessionId) {
        url += `&sessionId=${sessionId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fan moments: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data?.items) {
        return { success: true, data: result.data.items };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch fan moments', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit a new fan moment
   */
  async submitFanMoment(request: {
    nickname: string;
    city: string;
    caption: string;
    imageUrl?: string;
    videoUrl?: string;
    source?: string;
    sessionId: string;
  }): Promise<ApiResponse<FanMoment>> {
    if (this.useMockData) {
      await this.simulateDelay(500);
      const newMoment: FanMoment = {
        id: `moment-${Date.now()}`,
        userId: request.sessionId,
        userName: request.nickname,
        caption: request.caption,
        imageUrl: request.imageUrl,
        location: request.city,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: newMoment };
    }

    try {
      const response = await fetch(this.buildUrl('/api/fanmoments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit fan moment: ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to submit fan moment', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Like a fan moment
   */
  async likeFanMoment(id: string, sessionId: string): Promise<ApiResponse<boolean>> {
    if (this.useMockData) {
      await this.simulateDelay(200);
      return { success: true, data: true };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/fanmoments/${id}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(sessionId),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to like fan moment: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to like fan moment', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ========== POLLS ==========

  /**
   * Get active poll (backend returns single active poll)
   */
  async getActivePoll(): Promise<ApiResponse<Poll>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: polls[0] };
    }

    try {
      const response = await fetch(this.buildUrl('/api/polls/active'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'No active poll found' };
        }
        throw new Error(`Failed to fetch active poll: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch active poll', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all polls (for backward compatibility, returns array)
   */
  async getPolls(): Promise<ApiResponse<Poll[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: polls };
    }

    // Get active poll and return as array
    const response = await this.getActivePoll();
    if (response.success && response.data) {
      return { success: true, data: [response.data] };
    }
    return { success: true, data: [] }; // Return empty array if no active poll
  }

  /**
   * Submit poll vote
   */
  async votePoll(pollOptionId: string, sessionId: string): Promise<ApiResponse<Poll>> {
    if (this.useMockData) {
      await this.simulateDelay(300);
      const poll = polls[0];
      if (!poll) {
        return { success: false, error: 'Poll not found' };
      }
      return { success: true, data: poll };
    }

    try {
      const response = await fetch(this.buildUrl('/api/polls/vote'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ pollOptionId, sessionId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to vote: ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to submit vote', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user has already voted on a poll
   */
  async getVotedOption(pollId: string, sessionId: string): Promise<ApiResponse<string | null>> {
    if (this.useMockData) {
      await this.simulateDelay(200);
      return { success: true, data: null };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/polls/voted-option?pollId=${pollId}&sessionId=${sessionId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check voted option: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to check voted option', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ========== ANNOUNCEMENTS ==========

  /**
   * Get announcements (only approved ones by default)
   */
  async getAnnouncements(status: 'Pending' | 'Approved' | 'Rejected' = 'Approved'): Promise<ApiResponse<Announcement[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      // Filter by status if specified
      const filtered = status ? announcements.filter(a => a.status === status) : announcements;
      return { success: true, data: filtered };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/announcements?status=${status}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.statusText}`);
      }

      const result = await response.json();

      // Backend returns { success: true, data: [...], message: "..." }
      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch announcements', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit new announcement (will be pending approval)
   */
  async submitAnnouncement(announcement: {
    city: string;
    location?: string;
    eventDate: string; // ISO date string
    contact?: string;
    translations: Array<{
      languageCode: string;
      title: string;
      note?: string;
    }>;
  }): Promise<ApiResponse<Announcement>> {
    if (this.useMockData) {
      await this.simulateDelay(500);
      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        title: announcement.translations[0]?.title || '',
        note: announcement.translations[0]?.note,
        city: announcement.city,
        location: announcement.location,
        eventDate: announcement.eventDate,
        contact: announcement.contact,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: newAnnouncement };
    }

    try {
      const response = await fetch(this.buildUrl('/api/announcements'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(announcement),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit announcement: ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to submit announcement', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ========== PLAYERS ==========

  /**
   * Get all players by team type
   */
  async getPlayers(teamType: 'Mens' | 'Womens' = 'Mens', position?: string): Promise<ApiResponse<Player[]>> {
    if (this.useMockData) {
      await this.simulateDelay();
      return { success: true, data: players };
    }

    try {
      let url = this.buildUrl(`/api/players?teamType=${teamType}`);
      if (position) {
        url += `&position=${position}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch players', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get player by ID
   */
  async getPlayerById(id: string): Promise<ApiResponse<Player>> {
    if (this.useMockData) {
      await this.simulateDelay();
      const player = players.find((p) => p.id === id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }
      return { success: true, data: player };
    }

    try {
      const response = await fetch(this.buildUrl(`/api/players/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch player: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      logger.error('API: Failed to fetch player by id', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
