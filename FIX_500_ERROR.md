# 🔧 Fixing the 500 Error

## Problem Identified ✅

The **500 Internal Server Error** on the `/create` endpoint is happening because:

1. ❌ **Database migration hasn't been run yet**
   - The `matches` table is missing new columns like `conversation_id`, `unread_count_a`, `unread_count_b`, etc.
   - When the backend tries to create a match, it fails because the database schema doesn't match

2. ℹ️ **Servers are not running**
   - Backend: Not running on port 3000
   - Frontend: Not running on port 5173

---

## 🎯 Solution: 3 Simple Steps

### Step 1: Run Database Migration (Most Important!)

This adds the missing chat-related columns to your database.

**Option A: Automated (Easiest)**
```bash
cd /Users/jakubnosek/Programming/durhack-2025
./scripts/setup-chat-db.sh
```

**Option B: Manual via Supabase Dashboard**
1. Open https://supabase.com/dashboard
2. Select your project: `qkpheubpwntynozyptbh`
3. Click **SQL Editor** in left sidebar
4. Open this file in your editor:
   ```
   /Users/jakubnosek/Programming/durhack-2025/supabase/migrations/20251101130000_chat_enhancements.sql
   ```
5. Copy ALL contents (251 lines)
6. Paste into SQL Editor
7. Click **Run** or press `Ctrl+Enter`
8. Wait for success message

**What this does:**
- Creates 3 new tables: `conversations`, `notifications`, `message_events`
- Adds 8 new columns to `users` table
- Adds 7 new columns to `matches` table (this fixes the 500 error!)
- Creates database functions and triggers

---

### Step 2: Start the Backend & Frontend

After migration completes:

```bash
cd /Users/jakubnosek/Programming/durhack-2025
npm run dev
```

This starts both servers:
- ✅ Backend on http://localhost:3000
- ✅ Frontend on http://localhost:5173

---

### Step 3: Verify the Fix

Once servers are running, test:

**Test 1: Check API is running**
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"ok",...}`

**Test 2: Check chat endpoints registered**
```bash
curl http://localhost:3000/
```
Should show `chat` and `notifications` in endpoints list

**Test 3: Try the action that caused the 500 error**
- Refresh your browser
- Try the action again (e.g., creating a match, viewing conversations)
- Should work now! ✅

---

## 🧪 Quick Test: Create a Match

After migration and restart, try creating a test match:

```bash
# Replace USER_A_ID and USER_B_ID with actual user IDs from your database
curl -X POST http://localhost:3000/api/matching/create \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "USER_A_ID",
    "userBId": "USER_B_ID",
    "score": 0.85,
    "mutualSkills": []
  }'
```

Should return:
```json
{
  "success": true,
  "match": { ... }
}
```

If you still get 500 error, the migration didn't run successfully.

---

## 🔍 Verify Migration Success

In Supabase Dashboard:

1. Go to **Table Editor** (left sidebar)
2. Click on `matches` table
3. Check that these columns exist:
   - ✅ `conversation_id`
   - ✅ `last_message_at`
   - ✅ `last_message_preview`
   - ✅ `unread_count_a`
   - ✅ `unread_count_b`
   - ✅ `chat_enabled`
   - ✅ `archived_by`

If these columns are there, migration was successful!

---

## 🚨 Troubleshooting

### Migration fails with "permission denied"
**Solution:** Make sure you're using the **service role key** in `backend/.env`, not the anon key.

### Migration fails with "relation already exists"
**Solution:** Tables may already exist. Check Supabase Dashboard → Table Editor. If tables exist, you may need to drop and recreate them.

### Still getting 500 error after migration
**Solution:** 
1. Check backend console for detailed error message
2. Verify migration completed successfully (check table columns)
3. Restart backend server
4. Check backend logs: Look for error details in the terminal

### Backend won't start
**Check:**
```bash
# Verify environment variables
cat backend/.env | grep -E "SUPABASE|TALKJS"
```

Should show:
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- TALKJS_APP_ID=tl0iWYDE
- TALKJS_SECRET_KEY=sk_test_...

---

## 📊 What the Migration Does

The migration adds these important features:

### For Chat
- Track conversations linked to matches
- Count unread messages per user
- Store last message preview
- Track user online/offline status

### For Database
- 3 new tables
- 15 new columns across existing tables
- 5 database functions
- Automated triggers
- Row Level Security policies

### Why It's Needed
Without the migration, the database schema doesn't match what the code expects, causing 500 errors when:
- Creating matches
- Loading conversations
- Sending messages
- Updating user status

---

## ✅ Success Checklist

After following the steps above, verify:

- [ ] Database migration completed without errors
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] `curl http://localhost:3000/health` returns success
- [ ] `matches` table has new columns in Supabase
- [ ] 500 error is gone when testing
- [ ] Can create matches successfully
- [ ] Can view conversations page

---

## 🎉 Once Fixed

After the migration:
- ✅ No more 500 errors on `/create`
- ✅ Can create matches
- ✅ Can view conversations
- ✅ Chat feature works
- ✅ Unread counts display
- ✅ TalkJS integration works

---

## 📖 More Help

- **Full database setup guide:** `DATABASE_SETUP.md`
- **TalkJS configuration:** `TALKJS_CONFIGURED.md`
- **API documentation:** `backend/CHAT_API_DOCUMENTATION.md`
- **Quick start:** `NEXT_STEPS.md`

---

**TL;DR:**
1. Run database migration: `./scripts/setup-chat-db.sh`
2. Start servers: `npm run dev`
3. Test again - 500 error should be gone! ✅
