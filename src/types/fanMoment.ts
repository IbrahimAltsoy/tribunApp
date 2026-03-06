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
  isOwnMoment?: boolean; // True if current JWT user owns this moment
  hasLiked?: boolean; // True if current JWT user has liked this moment
  creatorUserId?: string; // UserId of authenticated creator (null for anonymous)
  creatorSessionId?: string; // Session ID of anonymous creator (kept for backward compat)
  creatorAvatarUrl?: string; // Signed avatar URL of the creator
}

/**
 * Like toggle result from backend
 */
export interface LikeToggleResult {
  liked: boolean; // true = liked, false = unliked
  likeCount: number;
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
  sessionId?: string; // Anonymous session ID (optional when authenticated)
}

/**
 * Update Own FanMoment Request (JWT auth - no sessionId needed)
 */
export interface UpdateOwnFanMomentRequest {
  caption?: string;
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Delete Own FanMoment Request (JWT auth - no body needed)
 */
export interface DeleteOwnFanMomentRequest {
  // No fields required — ownership verified via JWT
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
  isOwnMoment?: boolean;
  hasLiked?: boolean;
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
