/**
 * FanMoment Hub Service
 * Real-time WebSocket connection for FanMoment like updates.
 * Connect when HomeScreen mounts, disconnect on unmount.
 */

import * as SignalR from "@microsoft/signalr";
import { getApiBaseUrl, joinUrl } from "../utils/apiBaseUrl";
import { getAccessToken } from "./authService";

export type FanMomentLikeUpdate = {
  fanMomentId: string;
  likeCount: number;
  likerId: string;
  isLiked: boolean;
};

const API_BASE_URL = getApiBaseUrl("http://localhost:5000");
const HUB_URL = joinUrl(API_BASE_URL, "/hubs/fanmoment");

class FanMomentHubService {
  private connection: SignalR.HubConnection | null = null;
  private isManuallyDisconnected = false;
  private onLikeUpdatedCallback: ((update: FanMomentLikeUpdate) => void) | null = null;

  async start(): Promise<void> {
    this.isManuallyDisconnected = false;

    if (
      this.connection?.state === SignalR.HubConnectionState.Connected ||
      this.connection?.state === SignalR.HubConnectionState.Connecting
    ) {
      return;
    }

    this.connection = new SignalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        skipNegotiation: true,
        transport: SignalR.HttpTransportType.WebSockets,
        accessTokenFactory: async () => (await getAccessToken()) ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(SignalR.LogLevel.None)
      .build();

    this.connection.on("FanMomentLikeUpdated", (update: FanMomentLikeUpdate) => {
      this.onLikeUpdatedCallback?.(update);
    });

    this.connection.onclose(() => {
      if (!this.isManuallyDisconnected) {
        setTimeout(() => {
          if (!this.isManuallyDisconnected) this.start();
        }, 3000);
      }
    });

    try {
      await this.connection.start();
    } catch {
      // Silently fail — real-time updates are best-effort; core functionality works without them
    }
  }

  async stop(): Promise<void> {
    this.isManuallyDisconnected = true;
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Ignore
      }
      this.connection = null;
    }
  }

  onLikeUpdated(callback: (update: FanMomentLikeUpdate) => void): void {
    this.onLikeUpdatedCallback = callback;
  }

  offLikeUpdated(): void {
    this.onLikeUpdatedCallback = null;
  }
}

export const fanMomentHubService = new FanMomentHubService();
