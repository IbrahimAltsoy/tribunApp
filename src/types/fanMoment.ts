/**
 * FanMoment Types
 * Type definitions matching backend API DTOs
 */

/**
 * FanMoment DTO from backend
 */
export interface FanMomentDto {
  id: string;
  username: string;
  imageUrl?: string;
  videoUrl?: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  likeCount: number;
  createdAt: string; // ISO string
  isOwnMoment?: boolean; // Indicates if current session owns this moment
  creatorSessionId?: string; // Session ID of the content creator
}

/**
 * Create FanMoment Request
 */
export interface CreateFanMomentRequest {
  nickname: string;
  city: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  source?: string;
  sessionId: string; // Anonymous user session ID
}

/**
 * Update Own FanMoment Request (limited fields for users)
 */
export interface UpdateOwnFanMomentRequest {
  sessionId: string;
  caption?: string;
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Delete Own FanMoment Request
 */
export interface DeleteOwnFanMomentRequest {
  sessionId: string;
}

/**
 * FanMoment for UI display (transformed from DTO)
 */
export interface FanMoment {
  id: string;
  user: string; // mapped from username/nickname
  location: string; // mapped from city
  caption: string;
  time: string; // calculated from createdAt
  timestamp: string; // createdAt ISO string
  source: 'Tribun' | 'Sehir Meydani' | 'Ev/Izleme';
  image?: string; // imageUrl
  video?: string; // videoUrl
  likeCount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  isOwnMoment?: boolean; // Indicates if current session owns this moment
}

/**
 * Backend API Response wrapper
 */
export interface BackendApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Paged Result from backend
 */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
