# SkillSwap Troubleshooting Guide

> **Complete troubleshooting reference for SkillSwap development, debugging, and common issues.**

## Table of Contents
1. [Quick Diagnostics](#quick-diagnostics)
2. [Common Issues](#common-issues)
3. [Database Issues](#database-issues)
4. [Chat & Conversations Issues](#chat--conversations-issues)
5. [Authentication & Profile Issues](#authentication--profile-issues)
6. [API & Backend Issues](#api--backend-issues)
7. [Frontend & UI Issues](#frontend--ui-issues)
8. [TalkJS Integration Issues](#talkjs-integration-issues)
9. [Development Environment](#development-environment)

---

## Quick Diagnostics

### First Steps for Any Issue

1. **Check Browser Console** (F12 or Cmd+Option+I)
   - Look for error messages in red
   - Check Network tab for failed requests
   - Note any 500, 404, or other HTTP errors

2. **Check Backend Logs**
   - Look at terminal running `npm run dev`
   - Check for error stack traces
   - Verify which endpoints are being called

3. **Verify Services Are Running**
   ```bash
   # Backend health check
   curl http://localhost:3000/health
   
   # Should return: {"status":"ok",...}
   ```

4. **Check Database Connection**
   - Go to Supabase Dashboard
   - Verify project is active
   - Check if tables are populated

---

## Common Issues

### Issue: Port Already in Use (EADDRINUSE)

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process is using port 3000 (backend) or 5173 (frontend)

**Fix:**
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Restart servers
npm run dev
```

**Prevention:** Always stop servers with `Ctrl+C` before starting new ones

---

### Issue: 500 Internal Server Error

**Symptoms:**
- API calls fail with 500 status
- Backend logs show database errors
- "Cannot coerce result to single JSON object" error

**Common Causes & Fixes:**

#### Cause 1: Database Schema Mismatch
**Diagnosis:** Migration not run or incomplete
```bash
# Check if migration ran
# Go to Supabase Dashboard → Table Editor → matches table
# Verify columns exist: conversation_id, unread_count_a, unread_count_b, etc.
```

**Fix:**
```bash
# Run migration
./scripts/setup-chat-db.sh

# OR manually in Supabase SQL Editor
# Copy contents of: supabase/migrations/20251101130000_chat_enhancements.sql
# Paste and run
```

#### Cause 2: Backend Not Restarted After Migration
**Fix:**
```bash
# Stop backend (Ctrl+C)
# Restart
cd /Users/jakubnosek/Programming/durhack-2025
npm run dev
```

#### Cause 3: Missing User Profile
**Diagnosis:** User exists in `auth.users` but not in `users` table
**Fix:** Backend now handles this automatically (returns empty profile on GET, creates on PUT)

---

### Issue: Conversations Page Empty

**Symptoms:**
- Matches exist but Conversations page shows "No conversations yet"
- Browser console shows "Found matches: 0"

**Diagnosis Steps:**

#### Step 1: Check Browser Console
```javascript
// Look for these logs:
[Conversations] Loading for user: <USER_ID>
[Conversations] API response: {...}
[Conversations] Found matches: <NUMBER>
```

#### Step 2: Test API Directly
```bash
# Replace USER_ID with actual user ID from console
curl http://localhost:3000/api/matching/user/USER_ID
```

**Expected:** `{"success": true, "count": 1, "matches": [...]}`

**If count is 0:** No matches exist for this user

#### Step 3: Check Database
```sql
-- In Supabase SQL Editor
SELECT 
  id,
  user_a_id,
  user_b_id,
  status,
  chat_enabled,
  created_at
FROM matches
ORDER BY created_at DESC;
```

**Possible Fixes:**

#### Fix 1: Matches Exist But chat_enabled is NULL/False
```sql
UPDATE matches 
SET chat_enabled = true 
WHERE chat_enabled IS NULL OR chat_enabled = false;
```

#### Fix 2: Missing Conversations for Existing Matches
```sql
-- Create missing conversations
INSERT INTO conversations (match_id, talkjs_conversation_id, participants)
SELECT 
  m.id,
  'match-' || m.id::text,
  ARRAY[m.user_a_id, m.user_b_id]
FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id
WHERE c.id IS NULL
ON CONFLICT (match_id) DO NOTHING;

-- Update matches to have conversation_id
UPDATE matches m
SET conversation_id = 'match-' || m.id::text
WHERE conversation_id IS NULL;
```

#### Fix 3: Backend Not Running
```bash
# Check if backend is accessible
curl http://localhost:3000/health

# If not, start it
npm run dev
```

#### Fix 4: User ID Mismatch or RLS Issue
```sql
-- Check what user IDs exist
SELECT id, name, email FROM users;

-- Check matches for specific user
SELECT * FROM matches 
WHERE user_a_id = 'USER_ID' OR user_b_id = 'USER_ID';

-- Temporarily disable RLS for testing (re-enable after!)
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
-- Remember: ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
```

---

## Database Issues

### Missing Columns in matches Table

**Symptoms:**
- Backend errors mention missing columns
- 500 errors when creating matches

**Fix:**
```bash
# Run the chat enhancements migration
./scripts/setup-chat-db.sh

# Verify columns exist
# Go to Supabase → Table Editor → matches table
# Should see: conversation_id, last_message_at, unread_count_a, etc.
```

### RLS Blocking Queries

**Symptoms:**
- Queries work in SQL Editor but not in app
- Empty results despite data existing

**Diagnosis:**
```sql
-- Test with RLS disabled (for testing only!)
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
-- Try query again
-- Re-enable: ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
```

**Fix:** Review and update RLS policies to match your authentication scheme

### Conversations Not Being Created

**Symptoms:**
- Matches created but conversations table empty
- Conversations count != Matches count

**Fix:**
```sql
-- Backfill missing conversations
INSERT INTO conversations (match_id, talkjs_conversation_id, participants)
SELECT 
  m.id,
  'match-' || m.id::text,
  ARRAY[m.user_a_id, m.user_b_id]
FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id
WHERE c.id IS NULL
ON CONFLICT (match_id) DO NOTHING;

-- Verify counts match
SELECT 
  (SELECT COUNT(*) FROM matches) as matches,
  (SELECT COUNT(*) FROM conversations) as conversations;
```

---

## Chat & Conversations Issues

### Chat Container Not Found Error

**Symptoms:**
```
[Error] Chat container not found
Error initializing chat: Error: Chat container not found
```

**Root Cause:** Chat component using early returns - DOM element not rendered when TalkJS tries to mount

**Bad Pattern:**
```javascript
if (loading) {
  return <div>Loading...</div>  // ❌ chatboxEl ref not in DOM!
}
return <div ref={chatboxEl} ... />
```

**Fixed Pattern:**
```javascript
return (
  <div>
    {loading && <div className="overlay">Loading...</div>}
    <div 
      ref={chatboxEl} 
      style={{ visibility: loading ? 'hidden' : 'visible' }}
    />
  </div>
)
```

**Solution Applied in `/frontend/src/pages/Chat.jsx`:**
1. Container always rendered
2. Loading/error states shown as overlays
3. Added retry logic with timeout
4. Split loading and initialization state

### TalkJS Mount Error

**Symptoms:**
```
[TalkJS] Cannot mount UI: container element not found
```

**Root Causes:**
1. Race condition - TalkJS initializing before DOM ready
2. UseEffect dependency issue causing infinite re-render
3. State-based chatbox reference causing unnecessary re-renders

**Fix Applied:**
1. Changed chatbox from state to ref
2. Fixed useEffect dependency array (removed chatbox)
3. Added DOM readiness check
4. Added small delay before initialization
5. Proper cleanup on unmount

### Other User Can't See Chat

**Symptoms:**
- User A creates match and sees chat
- User B doesn't see it in their conversations

**Understanding:**
- **Matches page** = Find NEW people to match with
- **Conversations page** = Chat with EXISTING matches

**Solution:**
**User B needs to go to the Conversations page, not Matches page!**

**Verification:**
1. User A creates match from Matches page → auto-redirects to chat ✅
2. User B logs in → goes to Conversations page → sees User A ✅
3. User B clicks conversation → chat opens ✅

---

## Authentication & Profile Issues

### Profile Error: "Cannot coerce result to a single JSON object"

**Symptoms:**
```
Error: Cannot coerce the result to a single JSON object
Code: PGRST116
Details: The result contains 0 rows
```

**Root Cause:**
- User exists in `auth.users` (Supabase Auth)
- User doesn't exist in `users` table yet
- Backend tries to fetch profile → returns 0 rows → error

**Fix Applied:**
Backend now handles this gracefully:
- **GET** returns empty profile structure if user not found
- **PUT** uses `upsert()` to create or update profile
- Frontend includes email from auth in profile updates

**Files Modified:**
- `backend/routes/users.js`
- `frontend/src/pages/Profile.jsx`
- `frontend/src/components/ProfileForm.jsx`

### User Flow Now:
1. ✅ User signs up → Supabase Auth creates account
2. ✅ User visits Profile → GET returns empty profile (no error)
3. ✅ User fills profile → PUT creates user record
4. ✅ Profile saved successfully

---

## API & Backend Issues

### Backend Not Starting

**Check:**
```bash
# Verify Node version
node --version
# Should be 20.19+ or 22.12+

# Check for syntax errors
cd backend
npm run lint
```

### Environment Variables Missing

**Check:**
```bash
# Verify .env files exist
ls backend/.env
ls frontend/.env

# Check required variables
cat backend/.env | grep -E "SUPABASE_URL|SUPABASE_KEY|TALKJS"
```

**Required in `backend/.env`:**
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
TALKJS_APP_ID=your-talkjs-app-id
TALKJS_SECRET_KEY=your-talkjs-secret-key
```

**Required in `frontend/.env`:**
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TALKJS_APP_ID=your-talkjs-app-id
```

### API Calls Failing with CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:3000/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Fix:** Backend should have CORS enabled in `server.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

---

## Frontend & UI Issues

### Frontend Not Loading

**Check:**
```bash
# Verify dependencies installed
cd frontend
npm install

# Check for errors
npm run dev
```

### React Router 404 Errors

**Symptoms:** Direct navigation to `/profile` or `/chat/:id` returns 404

**Fix:** Ensure dev server configured for SPA:
```javascript
// vite.config.js
export default {
  server: {
    historyApiFallback: true
  }
}
```

### Components Not Re-rendering

**Common Causes:**
1. State not updating correctly
2. Missing dependencies in useEffect
3. Ref being used instead of state for UI updates

**Debug:**
```javascript
// Add logging to track state changes
useEffect(() => {
  console.log('[Component] State changed:', state)
}, [state])
```

---

## TalkJS Integration Issues

### TalkJS Not Loading

**Check:**
1. TalkJS credentials in environment variables
2. TalkJS script loaded in index.html
3. Browser console for TalkJS errors

**Verify:**
```javascript
// In browser console
console.log(window.Talk)
// Should show TalkJS SDK object
```

### Chat Not Initializing

**Steps:**
1. Check chatbox container exists in DOM
2. Verify TalkJS credentials valid
3. Check network tab for TalkJS API calls
4. Review TalkJS dashboard for errors

**Debug Logs:**
```javascript
console.log('[Chat] Container:', chatboxEl.current)
console.log('[Chat] User:', user)
console.log('[Chat] Match:', match)
```

---

## Development Environment

### Node Version Warning

**Warning:**
```
You are using Node.js 22.11.0. Vite requires Node.js version 20.19+ or 22.12+.
```

**Fix:**
```bash
# Check version
node --version

# Update with nvm (if installed)
nvm install 22.12
nvm use 22.12

# Or with Homebrew
brew upgrade node
```

### Dependencies Out of Date

**Update:**
```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Or update specific package
npm install package-name@latest
```

### Build Failures

**Clean and Rebuild:**
```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Clear cache if needed
npm cache clean --force
```

---

## Debugging Tools & Commands

### Useful cURL Commands

```bash
# Health check
curl http://localhost:3000/health

# Get user profile
curl http://localhost:3000/api/users/USER_ID

# Get user matches
curl http://localhost:3000/api/matching/user/USER_ID

# Get conversations
curl http://localhost:3000/api/chat/conversations/USER_ID

# Get all endpoints
curl http://localhost:3000/
```

### Database Queries for Debugging

```sql
-- Count all records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM matches) as matches,
  (SELECT COUNT(*) FROM conversations) as conversations;

-- Recent matches
SELECT * FROM matches ORDER BY created_at DESC LIMIT 5;

-- User's matches
SELECT * FROM matches 
WHERE user_a_id = 'USER_ID' OR user_b_id = 'USER_ID';

-- Conversations without matches
SELECT c.* FROM conversations c
LEFT JOIN matches m ON m.id = c.match_id
WHERE m.id IS NULL;

-- Matches without conversations
SELECT m.* FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id
WHERE c.id IS NULL;
```

### Browser Console Debugging

```javascript
// Check if user is authenticated
localStorage.getItem('supabase.auth.token')

// Check API base URL
console.log(import.meta.env.VITE_API_URL)

// Test API call
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
```

---

## Getting Help

### Information to Include in Bug Reports

1. **Environment:**
   - Operating system
   - Node.js version
   - Browser version

2. **Steps to Reproduce:**
   - What you were trying to do
   - Steps taken
   - Expected behavior
   - Actual behavior

3. **Logs:**
   - Browser console errors
   - Backend terminal output
   - Network tab (failed requests)

4. **Context:**
   - User ID (if applicable)
   - Match ID (if applicable)
   - Timestamp of issue

### Quick Reference: Common Commands

```bash
# Kill processes
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend

# Start services
npm run dev                     # Both servers
cd backend && npm start         # Backend only
cd frontend && npm run dev      # Frontend only

# Database
./scripts/setup-chat-db.sh      # Run migrations
supabase db push                # Push schema changes

# Debugging
curl http://localhost:3000/health  # Test backend
npm run lint                       # Check for errors
```

---

**Last Updated:** January 2025  
**Maintained By:** SkillSwap Development Team
