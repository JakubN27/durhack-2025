# 🚀 Restart Backend After Migration

Since you ran `supabase db push`, the database schema has been updated! Now you need to **restart the backend** to clear the 500 error.

## Quick Fix (3 steps):

### Step 1: Stop any running servers
Press `Ctrl+C` in the terminal where `npm run dev` is running.

### Step 2: Start the servers again
```bash
cd /Users/jakubnosek/Programming/durhack-2025
npm run dev
```

### Step 3: Test
Open your browser and try the action that was causing the 500 error. It should work now! ✅

---

## Why This Works

After running `supabase db push`:
- ✅ Database schema is updated with new columns
- ✅ `matches` table now has: `conversation_id`, `unread_count_a`, `unread_count_b`, etc.
- ✅ New tables created: `conversations`, `notifications`, `message_events`

But the backend server needs to be **restarted** to:
- Clear any cached database connections
- Reconnect with the updated schema
- Pick up any code changes

---

## 🧪 Quick Verification

Once servers are running again:

**Test 1: Check Backend Health**
Open in browser: http://localhost:3000/health

Should see: `{"status":"ok","message":"SkillSwap API is running",...}`

**Test 2: Check Chat Endpoints**
Open in browser: http://localhost:3000/

Should see `chat` and `notifications` in the endpoints list.

**Test 3: Try the Action Again**
Go back to your app and try whatever was causing the 500 error (e.g., creating a match, viewing conversations).

Should work now! ✅

---

## 🔍 If Still Getting 500 Error

1. **Check backend logs** in the terminal for the actual error message
2. **Verify migration ran successfully** in Supabase Dashboard:
   - Go to Table Editor
   - Click on `matches` table
   - Verify these columns exist:
     - `conversation_id`
     - `last_message_at`
     - `unread_count_a`
     - `unread_count_b`
     - `chat_enabled`

3. **Check backend console** for detailed error:
   - Look at the terminal running `npm run dev`
   - Should show the actual SQL error if migration failed

---

## 🆘 Alternative: Manual Check

If you want to verify the migration worked, check in Supabase:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor**
4. Click **matches** table
5. Look for these NEW columns (should be at the end):
   - `conversation_id` (text)
   - `last_message_at` (timestamp)
   - `last_message_preview` (text)
   - `unread_count_a` (int4)
   - `unread_count_b` (int4)
   - `chat_enabled` (bool)
   - `archived_by` (uuid[])

If these columns are there, the migration was successful!

---

## TL;DR

```bash
# Stop servers (Ctrl+C)
# Then:
npm run dev
# Try again - should work! ✅
```

That's it! The 500 error should be gone after restarting. 🎉
