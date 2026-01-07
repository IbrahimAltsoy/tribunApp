/**
 * Session Management for Anonymous Chat
 *
 * Handles:
 * - Generating unique session IDs
 * - Storing/retrieving session data
 * - Managing anonymous user identity
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateAmedNickname } from "./amedNameGenerator";
import { logger } from "./logger";

const STORAGE_KEYS = {
  SESSION_ID: "@tribun_session_id",
  NICKNAME: "@tribun_nickname",
  CREATED_AT: "@tribun_created_at",
};

export interface UserSession {
  sessionId: string;
  nickname: string;
  createdAt: number;
}

/**
 * Generate a unique session ID (UUID v4)
 */
const generateSessionId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Initialize or retrieve user session
 * - If session exists, return it
 * - If not, create new session with random Amedspor nickname
 */
export const initializeSession = async (): Promise<UserSession> => {
  try {
    // Try to retrieve existing session
    const [sessionId, nickname, createdAt] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID),
      AsyncStorage.getItem(STORAGE_KEYS.NICKNAME),
      AsyncStorage.getItem(STORAGE_KEYS.CREATED_AT),
    ]);

    // If session exists, return it
    if (sessionId && nickname && createdAt) {
      return {
        sessionId,
        nickname,
        createdAt: parseInt(createdAt, 10),
      };
    }

    // Create new session
    const newSessionId = generateSessionId();
    const newNickname = generateAmedNickname();
    const timestamp = Date.now();

    // Save to storage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId),
      AsyncStorage.setItem(STORAGE_KEYS.NICKNAME, newNickname),
      AsyncStorage.setItem(STORAGE_KEYS.CREATED_AT, timestamp.toString()),
    ]);

    return {
      sessionId: newSessionId,
      nickname: newNickname,
      createdAt: timestamp,
    };
  } catch (error) {
    logger.error("Error initializing session:", error);
    // Fallback: generate session without storage
    return {
      sessionId: generateSessionId(),
      nickname: generateAmedNickname(),
      createdAt: Date.now(),
    };
  }
};

/**
 * Update nickname (when user clicks shuffle button)
 */
export const updateNickname = async (newNickname: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NICKNAME, newNickname);
  } catch (error) {
    logger.error("Error updating nickname:", error);
  }
};

/**
 * Get current session
 */
export const getSession = async (): Promise<UserSession | null> => {
  try {
    const [sessionId, nickname, createdAt] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID),
      AsyncStorage.getItem(STORAGE_KEYS.NICKNAME),
      AsyncStorage.getItem(STORAGE_KEYS.CREATED_AT),
    ]);

    if (sessionId && nickname && createdAt) {
      return {
        sessionId,
        nickname,
        createdAt: parseInt(createdAt, 10),
      };
    }

    return null;
  } catch (error) {
    logger.error("Error getting session:", error);
    return null;
  }
};

/**
 * Clear session (for testing or user logout)
 */
export const clearSession = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ID),
      AsyncStorage.removeItem(STORAGE_KEYS.NICKNAME),
      AsyncStorage.removeItem(STORAGE_KEYS.CREATED_AT),
    ]);
  } catch (error) {
    logger.error("Error clearing session:", error);
  }
};
