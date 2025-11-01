# Chat Database Setup Guide

This guide covers the database schema updates and backend endpoints needed for the SkillSwap chat feature with TalkJS integration.

## Overview

The chat enhancement includes:
- ✅ New tables: `conversations`, `notifications`, `message_events`
- ✅ Enhanced `users` table with chat-specific fields
- ✅ Enhanced `matches` table with conversation tracking
- ✅ Database functions for unread counts and message tracking
- ✅ Row Level Security (RLS) policies
- ✅ Automated triggers for message events
- ✅ New API endpoints: `/api/chat` and `/api/notifications`

---

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# From project root
cd /Users/jakubnosek/Programming/durhack-2025

# Run the setup script
./scripts/setup-chat-db.sh
```

### Option 2: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251101130000_chat_enhancements.sql`
4. Paste into SQL Editor and click **Run**
5. Verify tables created in **Table Editor**

---

## What's Changed

### New Tables

#### 1. `conversations`
Maps TalkJS conversations to SkillSwap matches.

**Columns:**
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `match_id` (UUID, Foreign Key → matches)
- `talkjs_conversation_id` (Text, Unique)
- `participants` (UUID Array)
- `last_message_at` (Timestamp)
- `last_message_preview` (Text)
- `metadata` (JSONB)

**Purpose:** Track TalkJS conversations and sync with SkillSwap matches.

---

#### 2. `notifications`
User notifications for various events.

**Columns:**
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `user_id` (UUID, Foreign Key → users)
- `type` (Text: 'new_match', 'new_message', 'session_reminder', 'achievement', 'system')
- `title` (Text)
- `message` (Text)
- `read` (Boolean, Default: false)
- `action_url` (Text)
- `related_id` (UUID)
- `metadata` (JSONB)

**Purpose:** Notify users of important events across the platform.

---

#### 3. `message_events`
Track message events for analytics.

**Columns:**
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `match_id` (UUID, Foreign Key → matches)
- `sender_id` (UUID, Foreign Key → users)
- `event_type` (Text: 'sent', 'delivered', 'read', 'typing')
- `metadata` (JSONB)

**Purpose:** Analytics and event tracking for chat behavior.

---

### Enhanced Tables

#### `users` (New Columns)

```sql
avatar_url TEXT                    -- Profile picture URL
location TEXT                      -- User location
timezone TEXT                      -- User timezone
availability JSONB                 -- Available times for sessions
preferred_communication TEXT[]     -- Preferred communication methods
talkjs_signature TEXT             -- HMAC signature for TalkJS auth
last_active TIMESTAMP             -- Last activity timestamp
is_online BOOLEAN                 -- Current online status
```

**Impact:** Better user profiles and presence tracking for chat.

---

#### `matches` (New Columns)

```sql
conversation_id TEXT              -- TalkJS conversation ID
last_message_at TIMESTAMP        -- Last message timestamp
last_message_preview TEXT        -- Preview of last message
unread_count_a INTEGER           -- Unread count for user A
unread_count_b INTEGER           -- Unread count for user B
chat_enabled BOOLEAN             -- Whether chat is enabled
archived_by UUID[]               -- Users who archived this chat
```

**Impact:** Track conversation state and unread messages per user.

---

## Database Functions

### 1. `reset_unread_count(match_uuid, user_uuid)`
Resets the unread message count for a specific user in a match.

**Usage:**
```sql
SELECT reset_unread_count('match-id', 'user-id');
```

**Called by:** `POST /api/chat/mark-read/:matchId`

---

### 2. `get_total_unread_count(user_uuid)`
Returns the total unread message count across all active conversations.

**Usage:**
```sql
SELECT get_total_unread_count('user-id');
```

**Returns:** Integer (total unread count)

**Called by:** `GET /api/chat/unread-count/:userId`

---

### 3. `update_user_last_active()`
Trigger function that updates `last_active` when a user sends a message.

**Automatic:** Triggered on `messages` INSERT

---

### 4. `update_match_last_message()`
Trigger function that updates match info when a new message is sent.

**Updates:**
- `last_message_at`
- `last_message_preview`

**Automatic:** Triggered on `messages` INSERT

---

### 5. `increment_unread_count()`
Trigger function that increments unread count for the recipient.

**Automatic:** Triggered on `messages` INSERT

---

## Database Views

### `user_conversations`
Convenient view for accessing conversations with full user details.

**Usage:**
```sql
SELECT * FROM user_conversations 
WHERE user_a_id = 'user-id' OR user_b_id = 'user-id'
ORDER BY last_message_at DESC;
```

**Includes:**
- Match details (status, score, mutual skills)
- Both users' info (name, avatar, online status)
- Unread counts
- Last message info

---

## Row Level Security (RLS)

All new tables have RLS enabled with appropriate policies:

### `conversations`
- ✅ Users can view conversations they're participants in
- ✅ Users can create conversations for their matches
- ✅ Users can update their conversations

### `notifications`
- ✅ Users can view their own notifications
- ✅ Users can update their own notifications
- ✅ System can create notifications (backend)

### `message_events`
- ✅ Users can view events in their matches
- ✅ Users can create events for their messages

---

## API Endpoints

### Chat Endpoints (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/:userId` | Get all conversations |
| POST | `/conversation` | Create/get conversation |
| POST | `/mark-read/:matchId` | Mark messages as read |
| GET | `/unread-count/:userId` | Get total unread count |
| POST | `/message-event` | Track message event |
| POST | `/archive/:matchId` | Archive conversation |
| POST | `/unarchive/:matchId` | Unarchive conversation |
| PUT | `/online-status/:userId` | Update online status |
| POST | `/talkjs-signature` | Generate TalkJS signature |
| GET | `/conversation/:matchId` | Get conversation details |
| GET | `/stats/:userId` | Get chat statistics |

### Notifications Endpoints (`/api/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:userId` | Get notifications |
| POST | `/` | Create notification |
| PATCH | `/:notificationId/read` | Mark as read |
| POST | `/:userId/mark-all-read` | Mark all as read |
| DELETE | `/:notificationId` | Delete notification |
| DELETE | `/:userId/clear-all` | Clear all read |
| GET | `/:userId/unread-count` | Get unread count |
| POST | `/batch` | Create batch notifications |

See [CHAT_API_DOCUMENTATION.md](./CHAT_API_DOCUMENTATION.md) for detailed API docs.

---

## Environment Variables

Add these to your `backend/.env` file:

```bash
# TalkJS Configuration
TALKJS_APP_ID=your-talkjs-app-id
TALKJS_SECRET_KEY=your-talkjs-secret-key

# Supabase Configuration (existing)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Verification Steps

### 1. Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'notifications', 'message_events');
```

Expected: 3 rows

---

### 2. Check New User Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('avatar_url', 'is_online', 'last_active', 'talkjs_signature');
```

Expected: 4 rows

---

### 3. Check New Match Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('conversation_id', 'unread_count_a', 'unread_count_b', 'chat_enabled');
```

Expected: 4 rows

---

### 4. Test Functions
```sql
-- Test get_total_unread_count
SELECT get_total_unread_count('some-user-id');

-- Should return 0 for new user
```

---

### 5. Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('conversations', 'notifications', 'message_events');
```

Expected: Multiple policies per table

---

### 6. Test API Endpoints
```bash
# Start the backend
cd backend
npm run dev

# Test health check
curl http://localhost:3001/health

# Test conversations endpoint (replace USER_ID)
curl http://localhost:3001/api/chat/conversations/USER_ID

# Test unread count (replace USER_ID)
curl http://localhost:3001/api/chat/unread-count/USER_ID
```

---

## Troubleshooting

### Migration Fails with "relation already exists"
**Solution:** Tables may already exist. Drop and recreate:
```sql
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS message_events CASCADE;
-- Then re-run migration
```

### RLS Policies Blocking Access
**Solution:** Verify user authentication:
```sql
SELECT auth.uid(); -- Should return your user ID
```

### Functions Not Found
**Solution:** Check function creation:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('reset_unread_count', 'get_total_unread_count');
```

### Triggers Not Firing
**Solution:** Check trigger status:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'messages';
```

---

## Data Migration (Optional)

If you have existing matches and want to initialize them with chat:

```sql
-- Add conversation IDs to existing matches
UPDATE matches 
SET conversation_id = CONCAT('match-', id::text)
WHERE conversation_id IS NULL;

-- Initialize unread counts
UPDATE matches 
SET unread_count_a = 0, unread_count_b = 0
WHERE unread_count_a IS NULL OR unread_count_b IS NULL;

-- Enable chat for all active matches
UPDATE matches 
SET chat_enabled = true
WHERE status = 'active' AND chat_enabled IS NULL;
```

---

## Performance Considerations

### Indexes
The migration creates these indexes for performance:
- `idx_users_last_active` - Online users query
- `idx_users_is_online` - Online status filtering
- `idx_matches_conversation_id` - Conversation lookup
- `idx_matches_last_message_at` - Recent conversations
- `idx_conversations_participants` - Find user's conversations
- `idx_notifications_user` - User notifications
- `idx_notifications_read` - Unread notifications

### Query Optimization
- Use `LIMIT` on conversations list (default: 50)
- Filter by `status` for active conversations only
- Use pagination for large notification lists
- Cache unread counts on frontend (refresh every 30s)

---

## Security Best Practices

1. **Never expose TalkJS secret key** in frontend code
2. **Always generate signatures server-side** via `/api/chat/talkjs-signature`
3. **Validate user ownership** before marking messages as read
4. **Rate limit** notification creation (prevent spam)
5. **Sanitize message content** before storing
6. **Use HTTPS** for all API calls in production

---

## Testing Checklist

- [ ] Tables created successfully
- [ ] Columns added to users and matches
- [ ] Functions created and callable
- [ ] Triggers firing on message insert
- [ ] RLS policies allowing correct access
- [ ] API endpoints responding
- [ ] Conversations list displays correctly
- [ ] Unread counts increment/decrement
- [ ] Notifications created and displayed
- [ ] TalkJS integration working
- [ ] Online status updates

---

## Next Steps

After successful database setup:

1. **Configure TalkJS:** Get your App ID and Secret Key from [TalkJS Dashboard](https://talkjs.com/dashboard)
2. **Update Environment Variables:** Add TalkJS credentials to `.env`
3. **Test Frontend Integration:** Use Conversations and Chat pages
4. **Create Test Users:** Register multiple accounts to test chat
5. **Monitor Analytics:** Check `message_events` table for insights

---

## Support

For issues or questions:
- Check [CHAT_API_DOCUMENTATION.md](./CHAT_API_DOCUMENTATION.md) for API details
- Review [CHAT_IMPLEMENTATION.md](../CHAT_IMPLEMENTATION.md) for frontend guide
- See migration file: `supabase/migrations/20251101130000_chat_enhancements.sql`

---

## Rollback

If you need to rollback the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS message_events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Remove new columns from users
ALTER TABLE users 
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS timezone,
DROP COLUMN IF EXISTS availability,
DROP COLUMN IF EXISTS preferred_communication,
DROP COLUMN IF EXISTS talkjs_signature,
DROP COLUMN IF EXISTS last_active,
DROP COLUMN IF EXISTS is_online;

-- Remove new columns from matches
ALTER TABLE matches 
DROP COLUMN IF EXISTS conversation_id,
DROP COLUMN IF EXISTS last_message_at,
DROP COLUMN IF EXISTS last_message_preview,
DROP COLUMN IF EXISTS unread_count_a,
DROP COLUMN IF EXISTS unread_count_b,
DROP COLUMN IF EXISTS chat_enabled,
DROP COLUMN IF EXISTS archived_by;

-- Drop functions
DROP FUNCTION IF EXISTS reset_unread_count;
DROP FUNCTION IF EXISTS get_total_unread_count;
DROP FUNCTION IF EXISTS update_user_last_active;
DROP FUNCTION IF EXISTS update_match_last_message;
DROP FUNCTION IF EXISTS increment_unread_count;

-- Drop view
DROP VIEW IF EXISTS user_conversations;
```

---

**Database setup complete! 🎉**

Your SkillSwap chat feature is now fully configured at the database level.
