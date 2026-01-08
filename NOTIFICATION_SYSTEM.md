# Push Notification System - Implementation Guide

## Overview

This document describes the comprehensive push notification system implemented in the Amedspor Tribün mobile app. The system includes:

- ✅ Local notification support
- ✅ Push notification token management
- ✅ User notification preferences
- ✅ Deep linking from notifications
- ✅ Multi-language support (TR/EN)
- ✅ Settings UI for managing notifications
- ⏳ Backend integration (requires implementation)

## Architecture

### Mobile App Components

#### 1. **Notification Service** (`src/services/notificationService.ts`)

Main service handling all notification operations:

```typescript
import { notificationService, NotificationType } from '../services/notificationService';

// Initialize push notifications (call on app startup)
await notificationService.initialize();

// Send a local notification
await notificationService.scheduleLocalNotification({
  type: NotificationType.MATCH_GOAL,
  id: 'match-123',
  title: '⚽ GOL!',
  body: 'Amedspor - Mehmet Ali (45\')',
});

// Get user preferences
const prefs = await notificationService.getPreferences();

// Save user preferences
await notificationService.savePreferences({
  enabled: true,
  chatRooms: true,
  liveMatches: true,
  matchGoals: true,
  news: true,
  announcements: true,
  polls: true,
});
```

**Available Notification Types:**
- `CHAT_ROOM_OPENED` - New chat room opened
- `LIVE_MATCH` - Match started/in progress
- `MATCH_GOAL` - Team scored a goal
- `MATCH_FINISHED` - Match ended
- `NEWS_PUBLISHED` - New article published
- `ANNOUNCEMENT_APPROVED` - User's announcement approved
- `POLL_CREATED` - New poll created
- `GENERAL` - General notifications

#### 2. **Deep Linking** (`src/utils/notificationDeepLink.ts`)

Handles navigation when users tap notifications:

```typescript
import { handleNotificationResponse } from '../utils/notificationDeepLink';

// Setup notification response listener
notificationService.addNotificationResponseListener((response) => {
  handleNotificationResponse(response, navigationRef);
});
```

**Navigation Mapping:**
- Chat notifications → Marş tab
- Match notifications → Maç tab (with matchId)
- News notifications → Haber tab (with newsId)
- Announcements → Marş tab
- Polls → Marş tab
- General → Ana Sayfa tab

#### 3. **UI Components**

- **Settings Screen** (`src/screens/SettingsScreen.tsx`) - Main settings with notification option
- **Notification Preferences** (`src/components/NotificationPreferences.tsx`) - Full preferences UI

## Backend Requirements

### 1. Push Token Registration Endpoint

**Endpoint:** `POST /api/notifications/register`

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios" | "android",
  "deviceId": "unique-device-id",
  "deviceName": "iPhone 14 Pro"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token registered successfully"
}
```

**Database Schema Suggestion:**
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(10) NOT NULL,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(token);
```

### 2. User Preferences Endpoint

**Endpoint:** `PUT /api/notifications/preferences`

**Request Body:**
```json
{
  "enabled": true,
  "chatRooms": true,
  "liveMatches": true,
  "matchGoals": true,
  "news": true,
  "announcements": true,
  "polls": true
}
```

**Response:**
```json
{
  "success": true,
  "preferences": { ...saved preferences }
}
```

**Database Schema Suggestion:**
```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  enabled BOOLEAN DEFAULT true,
  chat_rooms BOOLEAN DEFAULT true,
  live_matches BOOLEAN DEFAULT true,
  match_goals BOOLEAN DEFAULT true,
  news BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  polls BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Sending Push Notifications

Use Expo Push Notification Service to send notifications.

**Install Expo Server SDK:**
```bash
npm install expo-server-sdk
```

**Example Node.js Implementation:**
```javascript
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPushNotification(userTokens, notificationData) {
  const messages = userTokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: notificationData.title,
      body: notificationData.body,
      data: {
        type: notificationData.type,
        id: notificationData.id,
        ...notificationData.customData
      },
      priority: 'high',
      channelId: getChannelId(notificationData.type), // For Android
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending notification chunk:', error);
    }
  }

  return tickets;
}

function getChannelId(notificationType) {
  switch (notificationType) {
    case 'chat_room_opened':
      return 'chat';
    case 'live_match':
    case 'match_goal':
    case 'match_finished':
      return 'matches';
    case 'news_published':
    case 'announcement_approved':
      return 'news';
    default:
      return 'general';
  }
}
```

### 4. Notification Triggers

Implement notification triggers for the following events:

#### Chat Room Opened
```javascript
// When a chat room is opened
async function onChatRoomOpened(roomId, roomName) {
  const users = await getUsersWithPreference('chat_rooms', true);
  const tokens = await getPushTokens(users);

  await sendPushNotification(tokens, {
    type: 'chat_room_opened',
    id: roomId,
    title: '💬 Yeni Sohbet Odası',
    body: `${roomName} açıldı! Katıl ve konuş.`,
  });
}
```

#### Match Started
```javascript
// When a match starts
async function onMatchStarted(matchId, homeTeam, awayTeam) {
  const users = await getUsersWithPreference('live_matches', true);
  const tokens = await getPushTokens(users);

  await sendPushNotification(tokens, {
    type: 'live_match',
    id: matchId,
    title: '⚽ Maç Başladı!',
    body: `${homeTeam} vs ${awayTeam} - Canlı takip et`,
  });
}
```

#### Goal Scored
```javascript
// When team scores a goal
async function onGoalScored(matchId, playerName, minute) {
  const users = await getUsersWithPreference('match_goals', true);
  const tokens = await getPushTokens(users);

  await sendPushNotification(tokens, {
    type: 'match_goal',
    id: matchId,
    title: '⚽ GOOOOL!',
    body: `${playerName} (${minute}')`,
  });
}
```

#### News Published
```javascript
// When news is published
async function onNewsPublished(newsId, title) {
  const users = await getUsersWithPreference('news', true);
  const tokens = await getPushTokens(users);

  await sendPushNotification(tokens, {
    type: 'news_published',
    id: newsId,
    title: '📰 Yeni Haber',
    body: title,
  });
}
```

#### Announcement Approved
```javascript
// When user's announcement is approved
async function onAnnouncementApproved(userId, announcementId, title) {
  const tokens = await getPushTokens([userId]);

  await sendPushNotification(tokens, {
    type: 'announcement_approved',
    id: announcementId,
    title: '✅ Duyuru Onaylandı',
    body: `"${title}" duyurunuz yayınlandı.`,
  });
}
```

#### Poll Created
```javascript
// When a new poll is created
async function onPollCreated(pollId, question) {
  const users = await getUsersWithPreference('polls', true);
  const tokens = await getPushTokens(users);

  await sendPushNotification(tokens, {
    type: 'poll_created',
    id: pollId,
    title: '📊 Yeni Anket',
    body: question,
  });
}
```

## Testing

### Local Notification Testing

Users can test notifications directly from the Settings screen using the "Test Bildirimi Gönder" button.

### Push Notification Testing

**Expo Push Notification Tool:**
https://expo.dev/notifications

1. Get the push token from the app (logs or debug screen)
2. Visit the Expo notification tool
3. Enter the token and test message
4. Send notification

**Example Test Payload:**
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Test Notification",
  "body": "This is a test notification",
  "data": {
    "type": "general",
    "id": "test-123"
  }
}
```

## Environment Variables

Add to your `.env` or environment configuration:

```env
# Expo Project ID (for push notifications)
EXPO_PUBLIC_PROJECT_ID=your-eas-project-id

# API Base URL
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

## Android Notification Channels

The app automatically creates these Android notification channels:

| Channel ID | Name | Importance | Usage |
|-----------|------|------------|-------|
| `chat` | Chat Notifications | HIGH | Chat room notifications |
| `matches` | Match Notifications | MAX | Live match updates, goals |
| `news` | News Notifications | DEFAULT | News and announcements |
| `general` | General Notifications | DEFAULT | Other notifications |

## Permissions

### iOS (app.json)
```json
{
  "ios": {
    "infoPlist": {
      "NSUserTrackingUsageDescription": "We need permission to send you notifications about matches, news, and updates."
    }
  }
}
```

### Android (app.json)
```json
{
  "android": {
    "permissions": [
      "NOTIFICATIONS"
    ]
  }
}
```

## Security Considerations

1. **Token Validation:** Validate Expo push tokens before storing
2. **Rate Limiting:** Implement rate limiting on notification endpoints
3. **User Authentication:** Require authentication for preference updates
4. **Token Expiry:** Clean up inactive/expired tokens regularly
5. **GDPR Compliance:** Allow users to opt-out completely
6. **Data Privacy:** Don't send sensitive data in notification payloads

## Monitoring & Analytics

Recommended metrics to track:

- Push token registration rate
- Notification delivery rate
- Notification open rate by type
- User preference changes
- Failed notification attempts
- Token expiry/invalidation rate

## Troubleshooting

### Common Issues:

**1. Notifications not received:**
- Check if user has granted permissions
- Verify push token is registered in backend
- Check user preferences (notifications enabled)
- Verify Expo project ID is correct
- Test on physical device (not simulator for iOS)

**2. Deep linking not working:**
- Check notification data payload format
- Verify navigation ref is ready
- Check screen names match exactly

**3. Android notifications not showing:**
- Verify channel ID is correct
- Check Android notification channel setup
- Ensure importance level is appropriate

## Future Enhancements

- [ ] Badge count management
- [ ] Notification history/inbox
- [ ] Scheduled notifications (match reminders)
- [ ] Rich notifications (images, actions)
- [ ] Notification grouping
- [ ] Quiet hours configuration
- [ ] Custom notification sounds
- [ ] Web push notifications support

## Support

For issues or questions:
- Check Expo Notifications documentation: https://docs.expo.dev/versions/latest/sdk/notifications/
- Review Expo Push Notification service: https://docs.expo.dev/push-notifications/overview/

---

**Last Updated:** 2026-01-08
**Version:** 1.0.0
