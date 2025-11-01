# Chat API Documentation

Complete API reference for SkillSwap chat functionality with TalkJS integration.

## Table of Contents
- [Chat Endpoints](#chat-endpoints)
- [Notifications Endpoints](#notifications-endpoints)
- [Messages Endpoints](#messages-endpoints)
- [Data Models](#data-models)
- [Database Schema](#database-schema)

---

## Chat Endpoints

### Get User Conversations
Get all conversations for a user with unread counts and last message info.

**Endpoint:** `GET /api/chat/conversations/:userId`

**Parameters:**
- `userId` (path, required): User ID
- `status` (query, optional): Filter by status ('active', 'pending', 'completed', 'all'). Default: 'active'
- `limit` (query, optional): Number of conversations to return. Default: 50

**Response:**
```json
{
  "success": true,
  "count": 5,
  "conversations": [
    {
      "matchId": "uuid",
      "conversationId": "match-uuid",
      "createdAt": "2025-11-01T12:00:00Z",
      "lastMessageAt": "2025-11-01T13:30:00Z",
      "lastMessagePreview": "Hey, when would you like to...",
      "status": "active",
      "score": 0.85,
      "mutualSkills": [
        {
          "skill": "Python",
          "teacher": "Alice",
          "learner": "Bob"
        }
      ],
      "unreadCount": 3,
      "chatEnabled": true,
      "otherUser": {
        "id": "uuid",
        "name": "Alice Smith",
        "bio": "Software engineer passionate about teaching",
        "avatarUrl": "https://...",
        "teachSkills": ["Python", "JavaScript"],
        "learnSkills": ["Machine Learning"],
        "isOnline": true,
        "lastActive": "2025-11-01T14:00:00Z"
      }
    }
  ]
}
```

---

### Create or Get Conversation
Create a new conversation or get existing one for a match.

**Endpoint:** `POST /api/chat/conversation`

**Body:**
```json
{
  "matchId": "uuid",
  "conversationId": "match-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "matchId": "uuid",
    "talkjsConversationId": "match-uuid",
    "participants": ["uuid1", "uuid2"],
    "createdAt": "2025-11-01T12:00:00Z"
  },
  "created": true
}
```

---

### Mark Messages as Read
Mark all messages in a conversation as read for a user.

**Endpoint:** `POST /api/chat/mark-read/:matchId`

**Parameters:**
- `matchId` (path, required): Match ID

**Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

### Get Unread Count
Get total unread message count across all conversations.

**Endpoint:** `GET /api/chat/unread-count/:userId`

**Parameters:**
- `userId` (path, required): User ID

**Response:**
```json
{
  "success": true,
  "unreadCount": 12
}
```

---

### Track Message Event
Track message events for analytics (sent, delivered, read, typing).

**Endpoint:** `POST /api/chat/message-event`

**Body:**
```json
{
  "matchId": "uuid",
  "senderId": "uuid",
  "eventType": "sent",
  "metadata": {
    "messageLength": 45,
    "hasAttachment": false
  }
}
```

**Event Types:**
- `sent` - Message was sent
- `delivered` - Message was delivered
- `read` - Message was read
- `typing` - User is typing

**Response:**
```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "matchId": "uuid",
    "senderId": "uuid",
    "eventType": "sent",
    "createdAt": "2025-11-01T14:00:00Z"
  }
}
```

---

### Archive Conversation
Archive a conversation for a user.

**Endpoint:** `POST /api/chat/archive/:matchId`

**Parameters:**
- `matchId` (path, required): Match ID

**Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation archived"
}
```

---

### Unarchive Conversation
Unarchive a conversation for a user.

**Endpoint:** `POST /api/chat/unarchive/:matchId`

**Parameters:**
- `matchId` (path, required): Match ID

**Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation unarchived"
}
```

---

### Update Online Status
Update user's online/offline status.

**Endpoint:** `PUT /api/chat/online-status/:userId`

**Parameters:**
- `userId` (path, required): User ID

**Body:**
```json
{
  "isOnline": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Online status updated"
}
```

---

### Generate TalkJS Signature
Generate HMAC signature for TalkJS authentication.

**Endpoint:** `POST /api/chat/talkjs-signature`

**Body:**
```json
{
  "userId": "uuid",
  "appId": "your-talkjs-app-id"
}
```

**Response:**
```json
{
  "success": true,
  "signature": "hmac-signature-string"
}
```

---

### Get Conversation Details
Get full conversation details for a specific match.

**Endpoint:** `GET /api/chat/conversation/:matchId`

**Parameters:**
- `matchId` (path, required): Match ID

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "matchId": "uuid",
    "talkjsConversationId": "match-uuid",
    "participants": ["uuid1", "uuid2"],
    "match": {
      "id": "uuid",
      "status": "active",
      "score": 0.85,
      "mutualSkills": [...],
      "userA": {...},
      "userB": {...}
    }
  }
}
```

---

### Get Chat Statistics
Get chat statistics and analytics for a user.

**Endpoint:** `GET /api/chat/stats/:userId`

**Parameters:**
- `userId` (path, required): User ID

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalConversations": 15,
    "activeConversations": 10,
    "totalUnread": 12,
    "messagesSent": 234
  }
}
```

---

## Notifications Endpoints

### Get Notifications
Get all notifications for a user.

**Endpoint:** `GET /api/notifications/:userId`

**Parameters:**
- `userId` (path, required): User ID
- `limit` (query, optional): Number to return. Default: 50
- `offset` (query, optional): Pagination offset. Default: 0
- `unreadOnly` (query, optional): Show only unread. Default: false

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "new_message",
      "title": "New message from Alice",
      "message": "Alice sent you a message",
      "read": false,
      "actionUrl": "/chat/match-uuid",
      "relatedId": "match-uuid",
      "createdAt": "2025-11-01T14:00:00Z"
    }
  ],
  "count": 25,
  "unreadCount": 5
}
```

**Notification Types:**
- `new_match` - New match created
- `new_message` - New message received
- `session_reminder` - Upcoming session reminder
- `achievement` - New achievement unlocked
- `system` - System notification

---

### Create Notification
Create a new notification.

**Endpoint:** `POST /api/notifications`

**Body:**
```json
{
  "userId": "uuid",
  "type": "new_message",
  "title": "New message",
  "message": "You have a new message from Alice",
  "actionUrl": "/chat/match-uuid",
  "relatedId": "match-uuid",
  "metadata": {
    "matchId": "uuid",
    "senderId": "uuid"
  }
}
```

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "userId": "uuid",
    "type": "new_message",
    "title": "New message",
    "message": "You have a new message from Alice",
    "read": false,
    "createdAt": "2025-11-01T14:00:00Z"
  }
}
```

---

### Mark Notification as Read
Mark a specific notification as read.

**Endpoint:** `PATCH /api/notifications/:notificationId/read`

**Parameters:**
- `notificationId` (path, required): Notification ID

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "read": true
  }
}
```

---

### Mark All Notifications as Read
Mark all notifications as read for a user.

**Endpoint:** `POST /api/notifications/:userId/mark-all-read`

**Parameters:**
- `userId` (path, required): User ID

**Response:**
```json
{
  "success": true,
  "updated_count": 5
}
```

---

### Delete Notification
Delete a specific notification.

**Endpoint:** `DELETE /api/notifications/:notificationId`

**Parameters:**
- `notificationId` (path, required): Notification ID

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### Clear All Read Notifications
Clear all read notifications for a user.

**Endpoint:** `DELETE /api/notifications/:userId/clear-all`

**Parameters:**
- `userId` (path, required): User ID

**Response:**
```json
{
  "success": true,
  "message": "All read notifications cleared"
}
```

---

### Get Unread Notification Count
Get count of unread notifications.

**Endpoint:** `GET /api/notifications/:userId/unread-count`

**Parameters:**
- `userId` (path, required): User ID

**Response:**
```json
{
  "success": true,
  "unreadCount": 5
}
```

---

### Create Batch Notifications
Create multiple notifications at once.

**Endpoint:** `POST /api/notifications/batch`

**Body:**
```json
{
  "notifications": [
    {
      "userId": "uuid1",
      "type": "new_match",
      "title": "New match!",
      "message": "You have a new match"
    },
    {
      "userId": "uuid2",
      "type": "new_match",
      "title": "New match!",
      "message": "You have a new match"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "notifications": [...]
}
```

---

## Messages Endpoints

### Send Message
Send a new message (primarily for non-TalkJS messages).

**Endpoint:** `POST /api/messages`

**Body:**
```json
{
  "matchId": "uuid",
  "senderId": "uuid",
  "content": "Hello! When would you like to meet?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "matchId": "uuid",
    "senderId": "uuid",
    "content": "Hello! When would you like to meet?",
    "read": false,
    "createdAt": "2025-11-01T14:00:00Z"
  }
}
```

---

### Get Messages for Match
Get all messages in a match.

**Endpoint:** `GET /api/messages/match/:matchId`

**Parameters:**
- `matchId` (path, required): Match ID
- `limit` (query, optional): Number to return. Default: 50
- `offset` (query, optional): Pagination offset. Default: 0

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "matchId": "uuid",
      "senderId": "uuid",
      "content": "Hello!",
      "read": true,
      "createdAt": "2025-11-01T14:00:00Z",
      "sender": {
        "id": "uuid",
        "name": "Alice Smith"
      }
    }
  ],
  "count": 25
}
```

---

## Data Models

### Conversation
```typescript
interface Conversation {
  id: string
  matchId: string
  conversationId: string
  createdAt: string
  lastMessageAt?: string
  lastMessagePreview?: string
  status: 'active' | 'pending' | 'completed'
  score: number
  mutualSkills: MutualSkill[]
  unreadCount: number
  chatEnabled: boolean
  otherUser: User
}
```

### User
```typescript
interface User {
  id: string
  name: string
  email: string
  bio?: string
  avatarUrl?: string
  teachSkills: Skill[]
  learnSkills: Skill[]
  location?: string
  timezone?: string
  isOnline: boolean
  lastActive: string
}
```

### Notification
```typescript
interface Notification {
  id: string
  userId: string
  type: 'new_match' | 'new_message' | 'session_reminder' | 'achievement' | 'system'
  title: string
  message: string
  read: boolean
  actionUrl?: string
  relatedId?: string
  metadata?: Record<string, any>
  createdAt: string
}
```

---

## Database Schema

### New Tables

#### `conversations`
Stores TalkJS conversation mappings.
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  match_id UUID UNIQUE REFERENCES matches(id),
  talkjs_conversation_id TEXT UNIQUE,
  participants UUID[],
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  metadata JSONB
);
```

#### `notifications`
User notifications.
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('new_match', 'new_message', 'session_reminder', 'achievement', 'system')),
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  related_id UUID,
  metadata JSONB
);
```

#### `message_events`
Track message events for analytics.
```sql
CREATE TABLE message_events (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  match_id UUID REFERENCES matches(id),
  sender_id UUID REFERENCES users(id),
  event_type TEXT CHECK (event_type IN ('sent', 'delivered', 'read', 'typing')),
  metadata JSONB
);
```

### Enhanced Tables

#### `users` (new columns)
```sql
ALTER TABLE users ADD COLUMN
  avatar_url TEXT,
  location TEXT,
  timezone TEXT,
  availability JSONB,
  preferred_communication TEXT[],
  talkjs_signature TEXT,
  last_active TIMESTAMP,
  is_online BOOLEAN;
```

#### `matches` (new columns)
```sql
ALTER TABLE matches ADD COLUMN
  conversation_id TEXT UNIQUE,
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  unread_count_a INTEGER DEFAULT 0,
  unread_count_b INTEGER DEFAULT 0,
  chat_enabled BOOLEAN DEFAULT true,
  archived_by UUID[];
```

### Database Functions

#### `reset_unread_count(match_uuid, user_uuid)`
Resets unread message count for a user in a match.

#### `get_total_unread_count(user_uuid)`
Returns total unread messages across all matches for a user.

### Database Views

#### `user_conversations`
Convenient view for accessing conversations with user details.

---

## Usage Examples

### Initialize Chat for a Match
```javascript
// 1. Get match details
const matchResponse = await fetch(`/api/matching/${matchId}`)
const { match } = await matchResponse.json()

// 2. Create/get conversation
const convResponse = await fetch('/api/chat/conversation', {
  method: 'POST',
  body: JSON.stringify({
    matchId: match.id,
    conversationId: `match-${match.id}`
  })
})

// 3. Initialize TalkJS with conversation
// See CHAT_IMPLEMENTATION.md for TalkJS setup
```

### Get Conversations List
```javascript
const response = await fetch(`/api/chat/conversations/${userId}?status=active`)
const { conversations } = await response.json()

// Display conversations with unread counts
conversations.forEach(conv => {
  console.log(`${conv.otherUser.name}: ${conv.unreadCount} unread`)
})
```

### Handle New Message Notification
```javascript
// When user receives a message via TalkJS webhook
await fetch('/api/notifications', {
  method: 'POST',
  body: JSON.stringify({
    userId: recipientId,
    type: 'new_message',
    title: `New message from ${senderName}`,
    message: messagePreview,
    actionUrl: `/chat/${matchId}`,
    relatedId: matchId
  })
})
```

---

## Environment Variables

Add to your `.env` file:

```bash
# TalkJS Configuration
TALKJS_APP_ID=your-talkjs-app-id
TALKJS_SECRET_KEY=your-talkjs-secret-key

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Migration Instructions

1. **Run the migration:**
   ```bash
   # In Supabase Dashboard: SQL Editor
   # Run: supabase/migrations/20251101130000_chat_enhancements.sql
   ```

2. **Verify tables created:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('conversations', 'notifications', 'message_events');
   ```

3. **Test functions:**
   ```sql
   SELECT get_total_unread_count('your-user-id');
   ```

4. **Restart backend server:**
   ```bash
   npm run dev:backend
   ```

---

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Resource not found
- `500` - Server error

---

## Rate Limiting

Consider implementing rate limiting for:
- Message sending: 30 messages per minute
- Notification creation: 100 per minute
- Status updates: 60 per minute

---

## Security Notes

1. **TalkJS Signature:** Always generate signatures server-side
2. **RLS Policies:** Enforce row-level security on all tables
3. **Input Validation:** Validate all user inputs
4. **CORS:** Configure appropriate CORS settings
5. **Authentication:** Verify user authentication for all endpoints

---

For more details, see:
- [CHAT_FEATURE_GUIDE.md](../CHAT_FEATURE_GUIDE.md)
- [CHAT_IMPLEMENTATION.md](../CHAT_IMPLEMENTATION.md)
- [Backend API Documentation](./API_DOCUMENTATION.md)
