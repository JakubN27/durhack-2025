# 🚀 Quick Start: Chat Feature Setup

## What's Been Done ✅

All backend code and database schema for the chat feature is complete! Here's what was added:

### Files Created (6)
1. **Database Migration**: `supabase/migrations/20251101130000_chat_enhancements.sql`
2. **Chat API**: `backend/routes/chat.js` (11 endpoints)
3. **Notifications API**: `backend/routes/notifications.js` (8 endpoints)
4. **Setup Script**: `scripts/setup-chat-db.sh`
5. **API Docs**: `backend/CHAT_API_DOCUMENTATION.md`
6. **Setup Guide**: `DATABASE_SETUP.md`

### Files Updated (2)
1. **Server**: `backend/server.js` (registered new routes)
2. **Environment**: `backend/.env.example` (added TalkJS config)

---

## 🎯 What You Need to Do Now

### Step 1: Get TalkJS Credentials (5 minutes)

1. Go to https://talkjs.com/dashboard
2. Sign up or log in
3. Create a new app or use existing
4. Copy your **App ID** from the dashboard
5. Go to Settings → Secret Key
6. Copy your **Secret Key**

### Step 2: Update Environment Variables (2 minutes)

Edit `backend/.env` and add:
```bash
TALKJS_APP_ID=your-app-id-here
TALKJS_SECRET_KEY=your-secret-key-here
```

Also update `frontend/.env`:
```bash
VITE_TALKJS_APP_ID=your-app-id-here
```

### Step 3: Run Database Migration (2 minutes)

**Option A: Automated Setup**
```bash
cd /Users/jakubnosek/Programming/durhack-2025
./scripts/setup-chat-db.sh
```

**Option B: Manual Setup**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/20251101130000_chat_enhancements.sql`
4. Paste into editor and click **Run**

### Step 4: Start the Backend (1 minute)
```bash
npm run dev
```

You should see:
```
🚀 SkillSwap API running on http://localhost:3001
📚 API Documentation: http://localhost:3001
```

### Step 5: Verify Everything Works (3 minutes)

**Test 1: Check API Endpoints**
```bash
# Open in browser or use curl
curl http://localhost:3001/

# Should show chat and notifications in the endpoints list
```

**Test 2: Test Chat Endpoint**
```bash
# Replace YOUR_USER_ID with a real user ID from your database
curl http://localhost:3001/api/chat/conversations/YOUR_USER_ID

# Should return: { "success": true, "conversations": [...] }
```

**Test 3: Check Frontend**
- Visit http://localhost:5173
- Log in
- Go to Conversations page
- Should see your matches (or empty state if no matches yet)

---

## 📋 What Each File Does

### 1. Database Migration (`20251101130000_chat_enhancements.sql`)
Creates:
- `conversations` table - Maps TalkJS conversations to matches
- `notifications` table - Stores user notifications
- `message_events` table - Tracks message analytics
- Adds 15 new columns to `users` and `matches` tables
- 5 database functions for unread counts and triggers
- Row Level Security policies
- Automated triggers for message tracking

### 2. Chat Router (`backend/routes/chat.js`)
11 endpoints for:
- Getting user conversations with unread counts
- Creating/getting TalkJS conversations
- Marking messages as read
- Tracking message events (sent, delivered, read, typing)
- Archiving/unarchiving conversations
- Updating online status
- Generating TalkJS HMAC signatures
- Getting chat statistics

### 3. Notifications Router (`backend/routes/notifications.js`)
8 endpoints for:
- Getting user notifications
- Creating notifications (single or batch)
- Marking notifications as read
- Deleting notifications
- Getting unread counts

### 4. Setup Script (`scripts/setup-chat-db.sh`)
Automated script that:
- Validates environment variables
- Checks for Supabase CLI
- Runs the database migration
- Verifies successful setup

### 5. Documentation
- `DATABASE_SETUP.md` - Complete database setup guide
- `backend/CHAT_API_DOCUMENTATION.md` - Full API reference with examples
- `CHAT_COMPLETE.md` - Complete implementation summary

---

## 🎯 Key Features Now Available

### Backend API
✅ Get all conversations for a user
✅ Track unread message counts per conversation
✅ Create and manage TalkJS conversations
✅ Send and receive notifications
✅ Track message events for analytics
✅ Update user online/offline status
✅ Generate secure TalkJS signatures
✅ Archive/unarchive conversations

### Database
✅ Conversation tracking linked to matches
✅ Per-user unread counts (user_a and user_b)
✅ Last message preview and timestamp
✅ User presence tracking (online/last active)
✅ Notification system with types
✅ Message event analytics
✅ Automated triggers for updates
✅ Row Level Security policies

---

## 🧪 Testing Flow

### Create a Test Conversation

1. **Create two test users** (if you haven't already):
   - Go to your app
   - Register User A
   - Register User B

2. **Create a match** between them:
   ```bash
   curl -X POST http://localhost:3001/api/matching/create \
     -H "Content-Type: application/json" \
     -d '{
       "userAId": "user-a-id",
       "userBId": "user-b-id",
       "score": 0.85,
       "mutualSkills": []
     }'
   ```

3. **Get conversations** for User A:
   ```bash
   curl http://localhost:3001/api/chat/conversations/user-a-id
   ```

4. **Open chat page** as User A:
   - Navigate to `/chat/match-id`
   - Should initialize TalkJS and allow messaging

5. **Send a message** in TalkJS

6. **Check unread count** for User B:
   ```bash
   curl http://localhost:3001/api/chat/unread-count/user-b-id
   ```

7. **Mark as read** when User B opens chat:
   ```bash
   curl -X POST http://localhost:3001/api/chat/mark-read/match-id \
     -H "Content-Type: application/json" \
     -d '{"userId": "user-b-id"}'
   ```

---

## 📊 Database Structure at a Glance

```
users (enhanced)
├── avatar_url          ← Profile pictures
├── is_online           ← Online status
├── last_active         ← Last activity time
└── talkjs_signature    ← Auth signature

matches (enhanced)
├── conversation_id     ← TalkJS conversation ID
├── last_message_at     ← When last message sent
├── last_message_preview ← Preview text
├── unread_count_a      ← User A's unread count
├── unread_count_b      ← User B's unread count
└── chat_enabled        ← Can chat or not

conversations (new)
├── match_id            ← Links to matches
├── talkjs_conversation_id
├── participants        ← User IDs array
└── metadata            ← Extra data

notifications (new)
├── user_id
├── type (new_match, new_message, etc.)
├── title & message
├── read (boolean)
└── action_url          ← Where to go when clicked

message_events (new)
├── match_id
├── sender_id
├── event_type (sent, delivered, read, typing)
└── metadata            ← Analytics data
```

---

## 🔍 Troubleshooting

### "Module not found" error
```bash
# Make sure you're running from the root
cd /Users/jakubnosek/Programming/durhack-2025
npm install
npm run dev
```

### Migration fails
- Use manual migration via Supabase Dashboard SQL Editor
- Copy/paste from `supabase/migrations/20251101130000_chat_enhancements.sql`

### TalkJS not loading
- Check frontend `.env` has `VITE_TALKJS_APP_ID`
- Check backend `.env` has `TALKJS_APP_ID` and `TALKJS_SECRET_KEY`
- Verify App ID is correct in TalkJS dashboard

### Unread counts not working
- Check database triggers are active:
  ```sql
  SELECT * FROM information_schema.triggers;
  ```

### Can't see conversations
- Make sure you have matches created
- Check match has `chat_enabled = true`
- Verify user ID is correct

---

## 📚 Documentation Reference

| File | What's Inside |
|------|---------------|
| `DATABASE_SETUP.md` | Detailed database setup guide with verification steps |
| `backend/CHAT_API_DOCUMENTATION.md` | Complete API reference with all endpoints and examples |
| `CHAT_COMPLETE.md` | Full implementation summary and success criteria |
| `CHAT_IMPLEMENTATION.md` | Frontend TalkJS integration guide (already done) |
| `CHAT_FEATURE_GUIDE.md` | User-facing feature documentation |

---

## ✅ Success Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] `http://localhost:3001/` shows chat & notifications endpoints
- [ ] Migration ran successfully in Supabase
- [ ] Can fetch conversations: `GET /api/chat/conversations/:userId`
- [ ] Can get unread count: `GET /api/chat/unread-count/:userId`
- [ ] Frontend Conversations page loads
- [ ] Can open chat with a match
- [ ] TalkJS chat interface loads
- [ ] Messages send and receive
- [ ] Unread counts update correctly

---

## 🎉 You're Ready!

Everything is set up. Just need to:
1. ✅ Add TalkJS credentials to `.env` files
2. ✅ Run database migration
3. ✅ Start backend: `npm run dev`
4. ✅ Test it out!

**Next:** See `DATABASE_SETUP.md` for detailed setup instructions.

**Questions?** Check `backend/CHAT_API_DOCUMENTATION.md` for API details.
