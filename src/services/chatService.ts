import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { languageService } from "../utils/languageService";

export type ChatRoomDto = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  maxUsers?: number | null;
  currentUserCount: number;
  createdAt: string;
  imageUrl?: string | null;
};

export type ChatMessageDto = {
  id: string;
  roomId: string;
  username: string;
  message: string;
  createdAt: string;
  sessionId?: string;
};

export type ChatScheduleDto = {
  isOpen: boolean;
  startUtc?: string | null;
  endUtc?: string | null;
  note?: string | null;
};

type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const API_URL = joinUrl(API_BASE_URL, "/api/chat");

const getRooms = async (): Promise<{
  success: boolean;
  data?: ChatRoomDto[];
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...languageService.getRequestHeaders() },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const data = Array.isArray(json.data) ? json.data : [];

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const getRoomMessages = async (
  roomId: string,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<{
  success: boolean;
  data?: PagedResult<ChatMessageDto>;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_URL}/rooms/${roomId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...languageService.getRequestHeaders() },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    return { success: true, data: json.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const sendMessage = async (
  roomId: string,
  payload: { username: string; message: string }
): Promise<{
  success: boolean;
  data?: ChatMessageDto;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...languageService.getRequestHeaders() },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage =
        errorBody?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const json = await response.json();

    return { success: true, data: json.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const getChatStatus = async (): Promise<{
  success: boolean;
  data?: ChatScheduleDto;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...languageService.getRequestHeaders() },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    return { success: true, data: json.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const reportMessage = async (
  messageId: string,
  payload: { reason: string; reportedBy: string }
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/messages/${messageId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...languageService.getRequestHeaders() },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const chatService = {
  getRooms,
  getRoomMessages,
  sendMessage,
  getChatStatus,
  reportMessage,
};
