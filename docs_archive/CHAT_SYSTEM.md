# Chat System Guide

**Last Updated:** November 2, 2025

---

## Overview

SkillSwap uses **TalkJS** for real-time messaging between matched users.

---

## How It Works

```
User A ←→ Match ←→ Conversation ←→ TalkJS ←→ User B
```

1. Users get matched (via matching algorithm)
2. Match creates conversation ID
3. Frontend initializes TalkJS with conversation
4. Users chat in real-time
5. Messages sync across all devices

---

## Setup

### 1. TalkJS Account
1. Sign up at [talkjs.com](https://talkjs.com)
2. Create an app
3. Copy App ID from dashboard

### 2. Environment Variables

**Frontend `.env.local`:**
```bash
VITE_TALKJS_APP_ID=your_talkjs_app_id
```

### 3. Install Dependencies

Already installed:
```bash
npm install talkjs
```

---

## Implementation

### Backend: Match Creation

When users match, create conversation:

```javascript
// In matchingService.js
await supabase
  .from('conversations')
  .insert({
    match_id: matchId,
    talkjs_conversation_id: `match-${matchId}`,
    participants: [userAId, userBId]
  })
```

### Frontend: Chat Component

**File:** `/frontend/src/pages/Chat.jsx`

```javascript
import Talk from 'talkjs'

// Initialize TalkJS
const talkSession = new Talk.Session({
  appId: import.meta.env.VITE_TALKJS_APP_ID,
  me: {
    id: currentUser.id,
    name: currentUser.name,
    photoUrl: currentUser.avatar_url,
    role: 'default'
  }
})

// Create conversation
const conversation = talkSession.getOrCreateConversation(conversationId)
conversation.setParticipant(currentUser)
conversation.setParticipant(otherUser)

// Mount chatbox
const chatbox = talkSession.createChatbox()
chatbox.select(conversation)
chatbox.mount(document.getElementById('talkjs-container'))
```

---

## Features

### ✅ Currently Implemented

1. **Real-time Messaging** - Instant message delivery
2. **Message History** - Full conversation history
3. **Read Receipts** - See when messages are read
4. **Typing Indicators** - See when other user is typing
5. **Profile Pictures** - Display user avatars
6. **Desktop Notifications** - Optional browser notifications
7. **Message Search** - Search within conversations
8. **File Sharing** - Send images and files
9. **Emoji Support** - Full emoji picker

### 🔒 Security

- **Auth Required** - Must be authenticated to chat
- **Match Required** - Can only chat with matched users
- **TalkJS Encryption** - Messages encrypted in transit
- **Access Control** - Users can only access their conversations

---

## API Endpoints

### Get Match for Chat
```http
GET /api/chat/:matchId

Response:
{
  "success": true,
  "match": {
    "id": "match-uuid",
    "conversation_id": "match-uuid-1-uuid-2",
    "user_a": { name, avatar_url, ... },
    "user_b": { name, avatar_url, ... }
  },
  "currentUserId": "uuid",
  "otherUser": { ... }
}
```

### Get User Conversations
```http
GET /api/chat/conversations/:userId

Response:
{
  "success": true,
  "conversations": [
    {
      "id": "match-uuid",
      "user_a": {...},
      "user_b": {...},
      "last_message_at": "2025-11-02T10:00:00Z",
      "unread_count": 2
    }
  ]
}
```

---

## UI Components

### Chat Page
- Full-screen chat interface
- Sidebar with match info
- Message input with emoji picker
- File upload button
- Profile link to view partner

### Conversations List
- All active conversations
- Last message preview
- Unread count badge
- Match score display
- Quick access to chat

---

## Styling

TalkJS allows custom themes. Edit in TalkJS dashboard:

1. Go to Settings → Themes
2. Create custom theme
3. Customize colors, fonts, layout
4. Apply theme in code:

```javascript
const chatbox = talkSession.createChatbox({
  theme: 'your-theme-id'
})
```

---

## Troubleshooting

### TalkJS Container Not Showing

**Problem:** Empty chat area

**Solution:**
```javascript
// Ensure container has height
<div id="talkjs-container" style="height: 100vh"></div>

// Wait for TalkJS to load
await Talk.ready
```

### Users Can't See Each Other's Messages

**Problem:** One-way messaging

**Solution:**
```javascript
// Add BOTH users as participants
conversation.setParticipant(user1)
conversation.setParticipant(user2)
```

### "Conversation not found" Error

**Problem:** Invalid conversation ID

**Solution:**
- Check match exists in database
- Verify conversation_id format: `match-{matchId}`
- Ensure both users are in match

### Profile Pictures Not Showing

**Problem:** Avatar not displayed

**Solution:**
```javascript
// Include photoUrl in user object
me: {
  id: user.id,
  name: user.name,
  photoUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`,
  role: 'default'
}
```

---

## Best Practices

1. **Always check match exists** before opening chat
2. **Include avatar_url** in all user objects
3. **Handle TalkJS load failures** gracefully
4. **Clean up** TalkJS session on component unmount
5. **Use loading states** while TalkJS initializes

---

## Performance

- **Initial Load:** ~1-2 seconds
- **Message Delivery:** Real-time (< 100ms)
- **History Loading:** Paginated, loads as user scrolls
- **Connection:** WebSocket with automatic reconnection

---

## Limitations

### TalkJS Free Tier
- 2 seats (users who have sent a message)
- Unlimited messages
- 30 days message history
- Basic features

### TalkJS Paid Tier
- Unlimited seats
- Unlimited message history
- Advanced features (video/voice)
- Priority support

---

## Future Enhancements

1. **Video/Voice Calls** - Upgrade TalkJS plan
2. **Screen Sharing** - For teaching sessions
3. **Code Sharing** - Syntax-highlighted code blocks
4. **Session Scheduling** - Integrated calendar
5. **Translation** - Auto-translate messages

---

## Code Examples

### Open Chat from Match
```javascript
// From Matches page
<button onClick={() => navigate(`/chat/${match.id}`)}>
  Start Chat
</button>
```

### Get Other User Info
```javascript
const getOtherUser = (match) => {
  return match.user_a?.id === currentUserId 
    ? match.user_b 
    : match.user_a
}
```

### Check Unread Messages
```javascript
// TalkJS provides unread count
talkSession.unreads.on('change', (unreadConversations) => {
  const totalUnread = unreadConversations.length
  // Update badge
})
```

---

## Related Files

- `/frontend/src/pages/Chat.jsx` - Main chat component
- `/frontend/src/pages/Conversations.jsx` - Conversation list
- `/backend/routes/chat.js` - Chat API endpoints

---

## Resources

- [TalkJS Documentation](https://talkjs.com/docs/)
- [TalkJS React Guide](https://talkjs.com/docs/Getting_Started/Tutorials/React/)
- [TalkJS Dashboard](https://talkjs.com/dashboard/)

---

**Chat System Version:** 1.0  
**TalkJS Version:** Latest  
**Last Updated:** November 2, 2025
