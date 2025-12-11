# Backend API Reference - Anonymous Chat System

## Overview

This document describes the backend API requirements for the anonymous chat system with session tracking for moderation purposes.

## User Privacy & Legal Compliance

### Privacy Model: "Pseudo-Anonymous"
- Users appear **anonymous** to each other
- Backend stores **minimal data** for legal compliance
- Session tracking enables moderation without exposing real identity

### Data Retention Policy
- Message content: Keep for **90 days** (Turkish law compliance)
- Session logs: Keep for **90 days**
- IP hashes: Keep for **90 days**
- Auto-delete after retention period

## Frontend → Backend Data Flow

### Message Structure (Sent from Frontend)

```typescript
interface MessagePayload {
  sessionId: string;      // UUID from AsyncStorage (e.g., "a1b2c3d4-...")
  nickname: string;       // Amedspor-themed name (e.g., "Kırmızı Aslan")
  message: string;        // Message content
  roomId: string;         // Match/room identifier
  timestamp: number;      // Client timestamp (milliseconds)
}
```

### Example Payload

```json
{
  "sessionId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "nickname": "Kırmızı Aslan",
  "message": "Harika gol! 🔥",
  "roomId": "match-123",
  "timestamp": 1704067200000
}
```

## Backend API Endpoints

### 1. Send Message (WebSocket or REST)

**WebSocket Event:**
```typescript
// Client emits
socket.emit('sendMessage', messagePayload);

// Server broadcasts
io.to(roomId).emit('newMessage', {
  messageId: "msg-xyz",
  nickname: "Kırmızı Aslan",
  message: "Harika gol! 🔥",
  timestamp: 1704067200000,
  serverTimestamp: 1704067201000
});
```

**REST Alternative:**
```http
POST /api/chat/messages
Content-Type: application/json

{
  "sessionId": "a1b2c3d4-...",
  "nickname": "Kırmızı Aslan",
  "message": "Harika gol! 🔥",
  "roomId": "match-123",
  "timestamp": 1704067200000
}
```

### 2. Get Room Messages

```http
GET /api/chat/rooms/{roomId}/messages?limit=50&before={messageId}

Response:
{
  "messages": [
    {
      "messageId": "msg-123",
      "nickname": "Yeşil Şimşek",
      "message": "Forvet harika oynuyor",
      "timestamp": 1704067100000
    },
    ...
  ],
  "hasMore": true
}
```

### 3. Report Message (Moderation)

```http
POST /api/chat/report
Content-Type: application/json

{
  "messageId": "msg-123",
  "reportReason": "offensive",
  "reportedBy": "session-abc"  // Reporter's sessionId
}
```

## Backend Database Schema

### Messages Table

```sql
CREATE TABLE messages (
  message_id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,          -- From frontend
  nickname VARCHAR(100) NOT NULL,           -- Amedspor-themed name
  message TEXT NOT NULL,
  room_id VARCHAR(36) NOT NULL,
  client_timestamp BIGINT NOT NULL,
  server_timestamp BIGINT NOT NULL,
  ip_hash VARCHAR(64) NOT NULL,             -- SHA-256 hash of IP
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,                -- For soft delete

  INDEX idx_room_timestamp (room_id, server_timestamp),
  INDEX idx_session (session_id),
  INDEX idx_created_at (created_at)         -- For auto-deletion
);
```

### Session Bans Table (Optional - for moderation)

```sql
CREATE TABLE session_bans (
  ban_id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  ip_hash VARCHAR(64) NOT NULL,
  reason TEXT,
  banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,

  INDEX idx_session (session_id),
  INDEX idx_ip_hash (ip_hash)
);
```

### Reports Table (Optional - for moderation)

```sql
CREATE TABLE message_reports (
  report_id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  reported_by_session VARCHAR(36) NOT NULL,
  reason VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (message_id) REFERENCES messages(message_id),
  INDEX idx_message (message_id),
  INDEX idx_reviewed (reviewed)
);
```

## Backend Implementation Guide

### 1. IP Hashing (Privacy Protection)

```javascript
const crypto = require('crypto');

function hashIP(ipAddress) {
  // Use SHA-256 with a secret salt
  const salt = process.env.IP_HASH_SALT; // Store in env variables
  return crypto
    .createHash('sha256')
    .update(ipAddress + salt)
    .digest('hex');
}

// Usage in request handler
app.post('/api/chat/messages', (req, res) => {
  const ipHash = hashIP(req.ip);
  // Store ipHash, NOT the original IP
});
```

### 2. Auto-Delete Old Messages (Data Retention)

```javascript
// Cron job - runs daily
async function deleteOldMessages() {
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

  await db.messages.deleteMany({
    created_at: { $lt: ninetyDaysAgo }
  });

  console.log('Deleted messages older than 90 days');
}
```

### 3. Profanity Filter (Auto-Moderation)

```javascript
const badWords = ['...', '...']; // Turkish profanity list

function containsProfanity(message) {
  const lowerMessage = message.toLowerCase();
  return badWords.some(word => lowerMessage.includes(word));
}

// Usage
if (containsProfanity(message)) {
  // Option 1: Reject message
  return res.status(400).json({ error: 'Uygunsuz içerik tespit edildi' });

  // Option 2: Flag for moderation
  await db.messages.create({ ...message, flagged: true });
}
```

### 4. Rate Limiting (Spam Prevention)

```javascript
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,     // 1 minute
  max: 10,                      // 10 messages per minute
  keyGenerator: (req) => req.body.sessionId,
  message: 'Çok fazla mesaj gönderiyorsunuz. Lütfen bekleyin.'
});

app.post('/api/chat/messages', chatLimiter, handleMessage);
```

### 5. Ban Check Middleware

```javascript
async function checkBanned(req, res, next) {
  const { sessionId } = req.body;
  const ipHash = hashIP(req.ip);

  const ban = await db.session_bans.findOne({
    $or: [
      { session_id: sessionId },
      { ip_hash: ipHash }
    ],
    $or: [
      { expires_at: null },              // Permanent ban
      { expires_at: { $gt: new Date() } } // Active temp ban
    ]
  });

  if (ban) {
    return res.status(403).json({
      error: 'Hesabınız yasaklanmıştır',
      reason: ban.reason,
      expiresAt: ban.expires_at
    });
  }

  next();
}
```

## WebSocket Implementation Example (Socket.io)

```javascript
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Send message
  socket.on('sendMessage', async (payload) => {
    const { sessionId, nickname, message, roomId, timestamp } = payload;
    const ipHash = hashIP(socket.handshake.address);

    // Validate
    if (!message || message.trim().length === 0) {
      return socket.emit('error', { message: 'Boş mesaj gönderilemez' });
    }

    // Check banned
    const banned = await checkIfBanned(sessionId, ipHash);
    if (banned) {
      return socket.emit('error', { message: 'Hesabınız yasaklanmıştır' });
    }

    // Check profanity
    if (containsProfanity(message)) {
      return socket.emit('error', { message: 'Uygunsuz içerik tespit edildi' });
    }

    // Save to database
    const messageId = generateUUID();
    await db.messages.create({
      message_id: messageId,
      session_id: sessionId,
      nickname: nickname,
      message: message.trim(),
      room_id: roomId,
      client_timestamp: timestamp,
      server_timestamp: Date.now(),
      ip_hash: ipHash
    });

    // Broadcast to room
    io.to(roomId).emit('newMessage', {
      messageId,
      nickname,
      message: message.trim(),
      timestamp,
      serverTimestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

## Security Considerations

### ✅ DO:
- Hash IP addresses before storing
- Use rate limiting per sessionId
- Filter profanity automatically
- Log moderation actions
- Auto-delete old messages (90 days)
- Use HTTPS/WSS for all connections
- Validate all input on server side

### ❌ DON'T:
- Store raw IP addresses
- Log device identifiers
- Share sessionId with other users
- Keep messages forever
- Trust client timestamps alone
- Skip input validation

## KVKK Compliance (Turkish Data Protection Law)

### Required Disclosures:
```
"Anonim sohbet hizmeti sunuyoruz. Ancak yasal zorunluluklar
nedeniyle mesaj içerikleri ve oturum bilgileri geçici olarak
saklanmaktadır. Verileriniz 90 gün sonra otomatik olarak silinir."
```

### User Rights:
- Right to deletion: Delete user's messages on request
- Right to access: Provide user's own message history
- Data portability: Export user's messages

## Testing Checklist

- [ ] Message sending/receiving works
- [ ] Session persistence across app restarts
- [ ] IP hashing works correctly
- [ ] Rate limiting prevents spam
- [ ] Profanity filter catches bad words
- [ ] Ban system blocks messages
- [ ] Auto-deletion runs correctly
- [ ] WebSocket reconnection works
- [ ] Error messages are user-friendly (Turkish)
- [ ] KVKK compliance notice is shown

## Environment Variables

```env
# Required
IP_HASH_SALT=your-secret-salt-here-change-in-production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Optional
MESSAGE_RETENTION_DAYS=90
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_MESSAGES=10
```

---

**Last Updated:** 2024
**Contact:** Backend Team
