/**
 * Chat Service - Backend Communication
 *
 * This file contains placeholder functions for backend integration.
 * Replace these with actual WebSocket or REST API calls.
 */

export interface SendMessagePayload {
  sessionId: string;      // Unique anonymous session ID
  nickname: string;       // Amedspor-themed nickname
  message: string;        // Message content
  roomId: string;         // Chat room/match ID
  timestamp: number;      // Client timestamp
}

export interface ReceivedMessage {
  messageId: string;
  nickname: string;
  message: string;
  timestamp: number;
  serverTimestamp: number;
}

/**
 * Send message to backend
 *
 * TODO: Replace with actual WebSocket emit or REST API call
 *
 * Example WebSocket implementation:
 * ```typescript
 * import io from 'socket.io-client';
 * const socket = io('https://your-backend-url');
 *
 * socket.emit('sendMessage', payload);
 * ```
 *
 * Example REST API implementation:
 * ```typescript
 * await fetch('https://your-backend-url/api/chat/messages', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(payload)
 * });
 * ```
 */
export const sendMessageToBackend = async (
  payload: SendMessagePayload
): Promise<void> => {
  // For now, just log what would be sent
  console.log('📤 [CHAT] Sending message to backend:', {
    sessionId: payload.sessionId,
    nickname: payload.nickname,
    message: payload.message,
    roomId: payload.roomId,
    timestamp: new Date(payload.timestamp).toISOString(),
  });

  // TODO: Implement actual backend call
  // Example WebSocket:
  // socket.emit('sendMessage', payload);

  // Example REST:
  // const response = await fetch(API_URL + '/messages', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // });
  //
  // if (!response.ok) {
  //   throw new Error('Failed to send message');
  // }
};

/**
 * Subscribe to new messages from backend
 *
 * TODO: Replace with actual WebSocket listener or polling
 *
 * Example WebSocket implementation:
 * ```typescript
 * socket.on('newMessage', (message: ReceivedMessage) => {
 *   callback(message);
 * });
 * ```
 */
export const subscribeToMessages = (
  roomId: string,
  callback: (message: ReceivedMessage) => void
): (() => void) => {
  console.log('👂 [CHAT] Subscribing to messages in room:', roomId);

  // TODO: Implement actual backend subscription
  // Example WebSocket:
  // socket.on('newMessage', callback);
  //
  // Return cleanup function
  // return () => socket.off('newMessage', callback);

  // Placeholder cleanup
  return () => {
    console.log('🔇 [CHAT] Unsubscribed from room:', roomId);
  };
};

/**
 * Report a message for moderation
 */
export const reportMessage = async (
  messageId: string,
  reportedBySessionId: string,
  reason: 'spam' | 'offensive' | 'harassment' | 'other'
): Promise<void> => {
  console.log('🚨 [CHAT] Reporting message:', {
    messageId,
    reportedBy: reportedBySessionId,
    reason,
  });

  // TODO: Implement actual backend call
  // await fetch(API_URL + '/report', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ messageId, reportedBy: reportedBySessionId, reason })
  // });
};

/**
 * Fetch message history for a room
 */
export const fetchMessageHistory = async (
  roomId: string,
  limit: number = 50,
  beforeMessageId?: string
): Promise<ReceivedMessage[]> => {
  console.log('📜 [CHAT] Fetching message history:', {
    roomId,
    limit,
    beforeMessageId,
  });

  // TODO: Implement actual backend call
  // const response = await fetch(
  //   `${API_URL}/rooms/${roomId}/messages?limit=${limit}${beforeMessageId ? `&before=${beforeMessageId}` : ''}`
  // );
  // return await response.json();

  return [];
};
