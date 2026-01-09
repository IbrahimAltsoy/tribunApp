export enum NotificationType {
  NewsPublished = 0,
  AnnouncementApproved = 1,
  PollCreated = 2,
  System = 3,
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
  data?: Record<string, any>;
}

export interface NotificationListResponse {
  success: boolean;
  data: NotificationDto[];
  totalCount: number;
  unreadCount: number;
  message?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}
