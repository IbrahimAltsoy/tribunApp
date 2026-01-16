import type { NewsDto, NewsCategoryDto, PagedResult } from '../types/news';
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { languageService } from "../utils/languageService";

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/news");

/**
 * Get paginated news list ştems
 */
const getNews = async (
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<{ success: boolean; data?: PagedResult<NewsDto>; error?: string }> => {
  try {
    const response = await fetch(
      `${API_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}&isPublished=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...languageService.getRequestHeaders(),
        },
      }
    );

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
 * Get latest news
 */
const getLatestNews = async (
  count: number = 5
): Promise<{ success: boolean; data?: NewsDto[]; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/latest?count=${count}`, {
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
 * Get news by ID
 */
const getNewsById = async (
  id: string
): Promise<{ success: boolean; data?: NewsDto; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
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
 * Get news by category
 */
const getNewsByCategory = async (
  categorySlug: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<{ success: boolean; data?: PagedResult<NewsDto>; error?: string }> => {
  try {
    const response = await fetch(
      `${API_URL}/category/${categorySlug}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...languageService.getRequestHeaders(),
        },
      }
    );

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
 * Get all news categories
 */
const getCategories = async (): Promise<{
  success: boolean;
  data?: NewsCategoryDto[];
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
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

export const newsService = {
  getNews,
  getLatestNews,
  getNewsById,
  getNewsByCategory,
  getCategories,
};
