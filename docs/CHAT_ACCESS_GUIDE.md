# How to Access Chat in SkillSwap

## Overview
When one user creates a match with another user, both users can access the chat. However, there are specific steps each user needs to follow.

## For the User Who Created the Match (User A)

When you create a match:
1. Click **"Match"** button on a potential match from the Matches page
2. You'll see a success message: "Match created! Opening chat..."
3. You'll be automatically redirected to the chat page
4. Start chatting!

## For the User Who Received the Match (User B)

When someone matches with you:
1. Navigate to **Conversations** page (from the navigation menu)
2. You should see the new conversation in your list
3. Click on the conversation to open the chat
4. Start chatting!

## Common Issues & Solutions

### Issue: "I logged in as the other user and can't bring up the chat"

**Possible Causes:**

1. **You're looking in the wrong place**
   - ✅ Solution: Go to the **Conversations** page, not Matches
   - The Matches page shows potential matches you can create
   - The Conversations page shows existing matches you can chat in

2. **The match hasn't been created yet**
   - ✅ Solution: Have User A create the match first
   - User A needs to go to Matches and click "Match" button
   - User B will then see it in their Conversations

3. **Chat is not enabled for the match**
   - ✅ Solution: Check that `chat_enabled` is true in the database
   - Run this query in Supabase SQL Editor:
     ```sql
     SELECT id, user_a_id, user_b_id, chat_enabled, status 
     FROM matches 
     WHERE user_a_id = 'USER_A_ID' OR user_b_id = 'USER_A_ID';
     ```

4. **The conversation is empty/no matches**
   - ✅ Solution: User A needs to create a match first
   - Both users should have completed their profiles with skills

## Step-by-Step: Testing Chat Between Two Users

### Step 1: Set Up User A
1. Log in as User A
2. Go to Profile and add:
   - Skills to teach (e.g., "JavaScript")
   - Skills to learn (e.g., "Python")
3. Save profile

### Step 2: Set Up User B
1. Log out and log in as User B
2. Go to Profile and add:
   - Skills to teach (e.g., "Python") - matches what User A wants to learn
   - Skills to learn (e.g., "JavaScript") - matches what User A can teach
3. Save profile

### Step 3: Create Match (as User A)
1. Still logged in as User A
2. Go to **Matches** page
3. You should see User B in the potential matches
4. Click **"Match"** button on User B's card
5. Wait for success message and automatic redirect to chat

### Step 4: Access Chat (as User B)
1. Log out and log in as User B
2. Go to **Conversations** page (NOT Matches page)
3. You should see a conversation with User A
4. Click on the conversation to open the chat
5. Start messaging!

## Troubleshooting Steps

### 1. Check if Match Exists
Run in Supabase SQL Editor:
```sql
SELECT 
  m.*,
  ua.name as user_a_name,
  ub.name as user_b_name
FROM matches m
JOIN users ua ON m.user_a_id = ua.id
JOIN users ub ON m.user_b_id = ub.id
ORDER BY m.created_at DESC
LIMIT 10;
```

### 2. Enable Chat for Existing Matches
If matches exist but chat is disabled:
```sql
UPDATE matches 
SET chat_enabled = true 
WHERE chat_enabled = false;
```

### 3. Check Backend Logs
Look for errors in the backend terminal:
- Match creation errors
- Conversation retrieval errors
- TalkJS initialization errors

### 4. Check Browser Console
Open browser DevTools (F12) and check Console for:
- API call errors
- TalkJS errors
- Network errors

### 5. Verify Both Users Can See Each Other
As User B, check the Conversations API directly:
```
http://localhost:3000/api/chat/conversations/USER_B_ID
```

Expected response should include the match with User A.

## Navigation Guide

### Main Navigation Options:
- **Dashboard**: Overview of your activity
- **Matches**: Find and create NEW matches
- **Conversations**: View and access EXISTING chats
- **Profile**: Edit your skills and info

### Quick Links:
- From Matches → Click "Match" → Auto-redirect to Chat
- From Conversations → Click conversation → Opens Chat
- From Chat → Click "Back to Conversations" → Returns to Conversations

## Important Notes

1. **Match vs Conversation**
   - A **Match** is when two users are paired (created from Matches page)
   - A **Conversation** is the chat interface for an existing match

2. **One-Way Creation**
   - Only User A needs to click "Match" to create the connection
   - User B automatically gets access to the conversation
   - No "accept/reject" flow (simplified for now)

3. **Real-Time Updates**
   - Messages appear in real-time thanks to TalkJS
   - Unread counts update automatically
   - Online status is shown for other users

## Need More Help?

If chat still doesn't work:
1. Check that backend is running on port 3000
2. Check that frontend is running on port 5173
3. Verify TalkJS App ID is set in `.env` files
4. Check browser console for JavaScript errors
5. Review backend logs for API errors

## File References
- Frontend Chat: `/frontend/src/pages/Chat.jsx`
- Backend Chat API: `/backend/routes/chat.js`
- Backend Matching API: `/backend/routes/matching.js`
- TalkJS Setup: `/frontend/src/lib/talkjs.js`
