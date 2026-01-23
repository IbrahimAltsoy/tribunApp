import * as SignalR from "@microsoft/signalr";
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";

export type ChatHubMessage = {
  id: string;
  roomId: string;
  username: string;
  message: string;
  createdAt: string;
  sessionId?: string;
};

export type ChatScheduleUpdate = {
  isOpen: boolean;
  startUtc?: string | null;
  endUtc?: string | null;
  note?: string | null;
};

export enum ConnectionStatus {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
  Reconnecting = "Reconnecting",
  Failed = "Failed",
}

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const HUB_URL = joinUrl(API_BASE_URL, "/hubs/chat");

class ChatHubService {
  private connection: SignalR.HubConnection | null = null;
  private currentRoomId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isManuallyDisconnected = false;

  private onMessageCallback: ((message: ChatHubMessage) => void) | null = null;
  private onUserCountCallback: ((count: number) => void) | null = null;
  private onStatusCallback: ((status: ChatScheduleUpdate) => void) | null =
    null;
  private onConnectionStatusCallback:
    | ((status: ConnectionStatus) => void)
    | null = null;

  async start(): Promise<void> {
    if (this.isManuallyDisconnected) {
      return;
    }

    if (this.connection?.state === SignalR.HubConnectionState.Connected) {
      this.notifyStatus(ConnectionStatus.Connected);
      return;
    }

    this.notifyStatus(ConnectionStatus.Connecting);

    this.connection = new SignalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        skipNegotiation: true,
        transport: SignalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delays = [0, 2000, 5000, 10000, 20000, 30000, 60000];
          const index = Math.min(
            retryContext.previousRetryCount,
            delays.length - 1
          );
          return delays[index];
        },
      })
      .configureLogging(SignalR.LogLevel.None)
      .build();

    this.registerHandlers();

    try {
      await this.connection.start();
      this.reconnectAttempts = 0;
      this.notifyStatus(ConnectionStatus.Connected);
      if (this.currentRoomId) {
        await this.joinRoom(this.currentRoomId);
      }
    } catch {
      this.reconnectAttempts += 1;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.notifyStatus(ConnectionStatus.Reconnecting);
        const delay = Math.min(5000 * this.reconnectAttempts, 30000);
        setTimeout(() => this.start(), delay);
      } else {
        this.notifyStatus(ConnectionStatus.Failed);
      }
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    this.currentRoomId = roomId;
    if (!this.connection || this.connection.state !== SignalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke("JoinRoom", roomId);
    } catch {
      // Ignore join errors; will retry on reconnect.
    }
  }

  async leaveRoom(): Promise<void> {
    if (!this.connection || !this.currentRoomId) return;

    try {
      await this.connection.invoke("LeaveRoom", this.currentRoomId);
    } catch {
      // Ignore leave errors.
    } finally {
      this.currentRoomId = null;
    }
  }

  async sendMessage(roomId: string, message: string, username?: string): Promise<void> {
    if (!this.connection || this.connection.state !== SignalR.HubConnectionState.Connected) {
      throw new Error("Not connected");
    }

    try {
      await this.connection.invoke("SendMessage", roomId, {
        message,
        username: username || "",
      });
    } catch {
      throw new Error("Send failed");
    }
  }

  onMessage(callback: (message: ChatHubMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onUserCount(callback: (count: number) => void): void {
    this.onUserCountCallback = callback;
  }

  onStatus(callback: (status: ChatScheduleUpdate) => void): void {
    this.onStatusCallback = callback;
  }

  onConnectionStatus(callback: (status: ConnectionStatus) => void): void {
    this.onConnectionStatusCallback = callback;
  }

  async stop(): Promise<void> {
    this.isManuallyDisconnected = true;
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Ignore stop errors.
      }
      this.connection = null;
    }
    this.notifyStatus(ConnectionStatus.Disconnected);
  }

  resume(): void {
    this.isManuallyDisconnected = false;
    this.reconnectAttempts = 0;
    this.start();
  }

  private registerHandlers(): void {
    if (!this.connection) return;

    this.connection.onclose(() => {
      this.notifyStatus(ConnectionStatus.Disconnected);
      if (!this.isManuallyDisconnected) {
        setTimeout(() => this.start(), 3000);
      }
    });

    this.connection.onreconnecting(() => {
      this.notifyStatus(ConnectionStatus.Reconnecting);
    });

    this.connection.onreconnected(() => {
      this.notifyStatus(ConnectionStatus.Connected);
    });

    this.connection.on("ReceiveMessage", (message: ChatHubMessage) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    });

    this.connection.on("UserJoined", (data: { userCount?: number }) => {
      if (this.onUserCountCallback) {
        this.onUserCountCallback(data?.userCount ?? 0);
      }
    });

    this.connection.on("UserLeft", (data: { userCount?: number }) => {
      if (this.onUserCountCallback) {
        this.onUserCountCallback(data?.userCount ?? 0);
      }
    });

    this.connection.on("ChatStatusChanged", (status: ChatScheduleUpdate) => {
      if (this.onStatusCallback) {
        this.onStatusCallback(status);
      }
    });
  }

  private notifyStatus(status: ConnectionStatus): void {
    if (this.onConnectionStatusCallback) {
      this.onConnectionStatusCallback(status);
    }
  }
}

export const chatHubService = new ChatHubService();
