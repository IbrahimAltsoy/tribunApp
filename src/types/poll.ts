/**
 * Poll Types
 * Type definitions matching backend API DTOs
 */

/**
 * PollDto from backend
 */
export interface PollDto {
  id: string;
  question: string; // Translated based on language
  isActive: boolean;
  closesAt?: string; // ISO date string
  options: PollOptionDto[];
}

export interface PollOptionDto {
  id: string;
  text: string; // Translated based on language
  voteCount: number;
  votePercentage: number;
}

/**
 * Vote Request
 */
export interface VotePollRequest {
  pollOptionId: string;
  sessionId: string;
}

/**
 * Backend API Response wrapper
 */
export interface BackendApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
