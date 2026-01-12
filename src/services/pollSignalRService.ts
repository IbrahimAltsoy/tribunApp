import * as SignalR from '@microsoft/signalr';
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import type { PollDto } from '../types/poll';

// Get API URL from environment
const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const HUB_URL = joinUrl(API_BASE_URL, "/hubs/poll");

// Connection status enum for better state management
export enum ConnectionStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
  Failed = 'Failed'
}

class PollSignalRService {
  private connection: SignalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased from 5
  private onPollUpdatedCallback: ((poll: PollDto) => void) | null = null;
  private onConnectionStatusChanged: ((status: ConnectionStatus) => void) | null = null;
  private subscribedPollIds: Set<string> = new Set();
  private isManuallyDisconnected = false;

  /**
   * Start SignalR connection to poll hub with graceful error handling
   */
  async start(): Promise<void> {
    // Don't reconnect if manually disconnected
    if (this.isManuallyDisconnected) {
      return;
    }

    if (this.connection?.state === SignalR.HubConnectionState.Connected) {
      this.notifyStatusChange(ConnectionStatus.Connected);
      return;
    }

    try {
      this.notifyStatusChange(ConnectionStatus.Connecting);

      // Create connection with resilient configuration
      this.connection = new SignalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          skipNegotiation: true,
          transport: SignalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Smart exponential backoff: 0ms, 2s, 5s, 10s, 20s, 30s, 60s (max)
            const delays = [0, 2000, 5000, 10000, 20000, 30000, 60000];
            const index = Math.min(retryContext.previousRetryCount, delays.length - 1);
            return delays[index];
          },
        })
        .configureLogging(SignalR.LogLevel.None) // Completely disable SignalR logging
        .build();

      // Setup event handlers BEFORE starting connection
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      this.reconnectAttempts = 0;
      this.notifyStatusChange(ConnectionStatus.Connected);

      // Re-subscribe to polls after reconnection
      await this.resubscribeToPolls();
    } catch {
      // Completely silent - app works fine without SignalR
      this.reconnectAttempts++;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.notifyStatusChange(ConnectionStatus.Reconnecting);
        // Exponential backoff for manual retry
        const delay = Math.min(5000 * this.reconnectAttempts, 30000);
        setTimeout(() => this.start(), delay);
      } else {
        // Max retries reached - app continues working without real-time updates
        this.notifyStatusChange(ConnectionStatus.Failed);
      }
    }
  }

  /**
   * Setup SignalR event handlers with graceful error handling
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Handle connection closed - silently attempt reconnect
    this.connection.onclose(() => {
      this.notifyStatusChange(ConnectionStatus.Disconnected);

      // Auto-reconnect if not manually disconnected
      if (!this.isManuallyDisconnected) {
        setTimeout(() => this.start(), 3000);
      }
    });

    // Handle reconnecting - notify user with subtle indicator
    this.connection.onreconnecting(() => {
      this.notifyStatusChange(ConnectionStatus.Reconnecting);
    });

    // Handle reconnected - re-subscribe to polls
    this.connection.onreconnected(async () => {
      this.reconnectAttempts = 0;
      this.notifyStatusChange(ConnectionStatus.Connected);

      // Re-subscribe to all polls
      await this.resubscribeToPolls();
    });

    // Listen for poll updates from server
    this.connection.on('PollUpdated', (poll: PollDto) => {
      if (this.onPollUpdatedCallback) {
        this.onPollUpdatedCallback(poll);
      }
    });
  }

  /**
   * Notify connection status change to UI
   */
  private notifyStatusChange(status: ConnectionStatus): void {
    if (this.onConnectionStatusChanged) {
      this.onConnectionStatusChanged(status);
    }
  }

  /**
   * Re-subscribe to all polls after reconnection
   */
  private async resubscribeToPolls(): Promise<void> {
    if (this.subscribedPollIds.size === 0) return;

    for (const pollId of this.subscribedPollIds) {
      try {
        await this.subscribeToPoll(pollId);
      } catch {
        // Silent - will retry on next reconnect
      }
    }
  }

  /**
   * Subscribe to a specific poll for real-time updates
   */
  async subscribeToPoll(pollId: string): Promise<void> {
    // Track subscription for auto-resubscribe on reconnect
    this.subscribedPollIds.add(pollId);

    if (!this.connection || this.connection.state !== SignalR.HubConnectionState.Connected) {
      // Will auto-subscribe when connection is established
      return;
    }

    try {
      await this.connection.invoke('SubscribeToPoll', pollId);
    } catch {
      // Silent - will retry on reconnect
    }
  }

  /**
   * Unsubscribe from a specific poll
   */
  async unsubscribeFromPoll(pollId: string): Promise<void> {
    // Remove from tracked subscriptions
    this.subscribedPollIds.delete(pollId);

    if (!this.connection || this.connection.state !== SignalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('UnsubscribeFromPoll', pollId);
    } catch {
      // Silent - not critical
    }
  }

  /**
   * Register callback for when poll is updated
   */
  onPollUpdated(callback: (poll: PollDto) => void): void {
    this.onPollUpdatedCallback = callback;
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionStatus(callback: (status: ConnectionStatus) => void): void {
    this.onConnectionStatusChanged = callback;
  }

  /**
   * Stop SignalR connection (manually)
   */
  async stop(): Promise<void> {
    this.isManuallyDisconnected = true;
    this.subscribedPollIds.clear();

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Already closed
      }
      this.connection = null;
    }
    this.notifyStatusChange(ConnectionStatus.Disconnected);
  }

  /**
   * Resume auto-reconnect (after manual stop)
   */
  resume(): void {
    this.isManuallyDisconnected = false;
    this.reconnectAttempts = 0;
    this.start();
  }

  /**
   * Get current connection state
   */
  getState(): SignalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connection?.state === SignalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const pollSignalRService = new PollSignalRService();
