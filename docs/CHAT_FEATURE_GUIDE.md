# 💬 Chat Feature Guide

## Overview

The SkillSwap chat feature allows matched users to communicate in real-time using TalkJS. Users can chat about skill exchange, schedule learning sessions, and build learning relationships.

## Features

### ✨ Key Capabilities
- **Real-time Messaging**: Instant chat powered by TalkJS
- **Match-Based Conversations**: Chat only with confirmed matches
- **Conversations Inbox**: View all active conversations in one place
- **User Profiles in Chat**: Quick access to match details and skills
- **Match Score Display**: See compatibility percentage
- **Skill Preview**: View what you can learn from each other
- **Responsive Design**: Works on desktop and mobile

## User Flow

### 1. Finding Matches
1. Navigate to **Matches** page
2. Browse potential matches
3. Click "Connect & Start Chat" to create a match

### 2. Starting a Conversation
- After creating a match, you're automatically redirected to the chat
- Or navigate to **Conversations** to see all your matches
- Click on any match to open the chat

### 3. Chatting
- Send messages in real-time
- View match details in the sidebar (desktop)
- See mutual skills and what you can learn
- Access user profile from chat header

## Pages

### `/conversations` - Conversations Inbox

**Purpose**: Central hub for all chat conversations

**Features**:
- List of all matches with avatars and names
- Match scores and connection dates
- Status badges (Active, Pending, Completed)
- Quick skill previews
- Empty state with call-to-action
- Stats overview (total matches, active, completed)

**Example**:
```jsx
// Navigate to conversations
navigate('/conversations')
```

### `/chat/:matchId` - Chat Page

**Purpose**: One-on-one conversation with a matched user

**Features**:
- Full-height TalkJS chatbox
- Match details header
- Skills sidebar (desktop only)
- Mutual skills display
- Match status and connection date
- Back to conversations button

**Example**:
```jsx
// Open specific chat
navigate('/chat/abc-123-def-456')
```

## Technical Implementation

### TalkJS Integration

**Configuration** (`frontend/src/lib/talkjs.js`):
```javascript
import Talk from 'talkjs'

// Initialize TalkJS session
export async function initializeTalkJS(currentUser) {
  await Talk.ready
  
  const me = new Talk.User({
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    photoUrl: currentUser.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.name}`,
    role: 'default'
  })
  
  const session = new Talk.Session({
    appId: import.meta.env.VITE_TALKJS_APP_ID,
    me: me
  })
  
  return { session, me }
}

// Create conversation
export function createConversation(session, currentUser, otherUser, conversationId) {
  const other = new Talk.User({
    id: otherUser.id,
    name: otherUser.name,
    email: otherUser.email,
    photoUrl: otherUser.avatar_url || `https://ui-avatars.com/api/?name=${otherUser.name}`,
    role: 'default'
  })
  
  const conversation = session.getOrCreateConversation(conversationId)
  conversation.setParticipant(session.me)
  conversation.setParticipant(other)
  
  return conversation
}

// Create chatbox UI
export function createChatbox(session, conversation) {
  const chatbox = session.createChatbox()
  chatbox.select(conversation)
  return chatbox
}
```

### Chat Page Implementation

**Key Components**:
1. **Load Match Data**: Fetch match details from backend
2. **Initialize TalkJS**: Create session and conversation
3. **Mount Chatbox**: Render TalkJS UI in React ref
4. **Display Sidebar**: Show match info and skills (desktop)
5. **Cleanup**: Destroy chatbox on unmount

**Example**:
```jsx
const initializeChat = async (currentUser, matchData) => {
  const otherUser = matchData.user_a?.id === currentUser.id 
    ? matchData.user_b 
    : matchData.user_a
  
  const { session } = await initializeTalkJS(currentUser)
  const conversation = createConversation(session, currentUser, otherUser, `match-${matchId}`)
  const newChatbox = createChatbox(session, conversation)
  
  newChatbox.mount(chatboxEl.current)
  setChatbox(newChatbox)
}
```

### API Endpoints Used

**Get User Matches**:
```
GET /api/matching/user/:userId
```

**Get Specific Match**:
```
GET /api/matching/:matchId
```

**Create Match**:
```
POST /api/matching/create
Body: { userAId, userBId, score, mutualSkills }
```

## Environment Variables

### Frontend `.env.local`

```env
# TalkJS App ID (required for chat)
VITE_TALKJS_APP_ID=your_talkjs_app_id

# Backend API URL
VITE_API_URL=http://localhost:3000

# Supabase (for auth)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Getting TalkJS App ID

1. Go to [TalkJS Dashboard](https://talkjs.com/dashboard)
2. Create a new app or use existing
3. Copy your App ID
4. Add to `.env.local` as `VITE_TALKJS_APP_ID`

## UI Components

### Conversations Page

**Layout**:
```
┌─────────────────────────────────┐
│ 💬 Conversations                │
│ Chat with your matches...       │
├─────────────────────────────────┤
│ [Stats: Total | Active | Done]  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 👤 User Name    [Active]    │ │
│ │ Bio text...                 │ │
│ │ 🎯 95% • Connected 2d ago   │ │
│ │ [React] [Python]  [Open →] │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👤 Another User  [Pending]  │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Chat Page

**Desktop Layout**:
```
┌───────────────────────────────────────────────┐
│ ← Back | 👤 User | 95% | [View Profile]      │
├───────────────────────────┬───────────────────┤
│                           │                   │
│   TalkJS Chatbox          │  Match Info       │
│   (Real-time messages)    │  ├─ Profile      │
│                           │  ├─ Skills        │
│                           │  ├─ Mutual Skills │
│                           │  └─ Status        │
│                           │                   │
└───────────────────────────┴───────────────────┘
```

**Mobile Layout**:
```
┌───────────────────┐
│ ← Back | 👤 User  │
├───────────────────┤
│                   │
│   TalkJS Chatbox  │
│   (Full width)    │
│                   │
└───────────────────┘
```

## Navigation Flow

```
Dashboard
  └─→ Find Matches → Matches
                       ├─→ Connect → Chat
                       └─→ Conversations → Chat

Dashboard
  └─→ Conversations → Chat

Layout (Nav)
  └─→ 💬 Conversations → Chat
```

## Best Practices

### For Users

1. **Complete Your Profile First**: Add skills before finding matches
2. **Be Responsive**: Reply to messages to build relationships
3. **Be Clear**: Communicate your learning goals and availability
4. **Schedule Sessions**: Use chat to plan learning sessions
5. **Give Feedback**: Help matches improve by sharing feedback

### For Developers

1. **Always Check Auth**: Verify user is logged in before loading chat
2. **Handle Errors Gracefully**: Show friendly messages if chat fails to load
3. **Cleanup Resources**: Destroy TalkJS chatbox on component unmount
4. **Optimize Sidebar**: Hide on mobile to save space
5. **Cache Match Data**: Avoid redundant API calls

## Troubleshooting

### Chat Not Loading

**Problem**: Chatbox doesn't appear

**Solutions**:
- Check `VITE_TALKJS_APP_ID` is set in `.env.local`
- Verify TalkJS app exists in dashboard
- Check browser console for errors
- Ensure match exists in database

### "Match Not Found" Error

**Problem**: Chat page shows error

**Solutions**:
- Verify match ID is valid
- Check user is participant in match
- Ensure match exists in `matches` table
- Try refreshing conversations list

### Messages Not Sending

**Problem**: Can't send messages in chat

**Solutions**:
- Check internet connection
- Verify TalkJS app is active
- Check browser console for API errors
- Ensure both users have valid accounts

### Sidebar Not Showing

**Problem**: Skills sidebar missing

**Solutions**:
- Check screen width (sidebar hidden on <1280px)
- Verify match data includes user profiles
- Check skills data is populated

## Future Enhancements

### Planned Features

1. **Unread Message Badges**: Show unread count in conversations list
2. **Last Message Preview**: Display last message in inbox
3. **Online Status**: Show if user is currently online
4. **Typing Indicators**: See when other user is typing
5. **File Sharing**: Share documents and resources
6. **Video Calls**: Integrate video chat for live sessions
7. **Session Scheduler**: Built-in calendar for planning
8. **Chat Search**: Search messages within conversation
9. **Message Reactions**: React to messages with emojis
10. **Notifications**: Push notifications for new messages

### Technical Improvements

1. **Message Persistence**: Cache messages locally
2. **Optimistic Updates**: Show messages immediately
3. **Lazy Loading**: Load conversations on scroll
4. **WebSocket Fallback**: Alternative if WebSockets blocked
5. **Analytics**: Track conversation engagement
6. **Message Templates**: Quick reply suggestions
7. **Rich Text**: Support markdown formatting
8. **Language Detection**: Auto-translate messages

## Testing

### Manual Testing Checklist

- [ ] Create a match and open chat
- [ ] Send messages back and forth
- [ ] View conversations inbox
- [ ] Click match to open chat
- [ ] Check sidebar shows correct skills
- [ ] Test on mobile (responsive)
- [ ] Test back button navigation
- [ ] Verify match score displays
- [ ] Check empty state (no conversations)
- [ ] Test with multiple matches

### Test User Flow

1. **Login as Alice** (`alice@test.com`)
2. Go to **Matches**
3. Find and connect with Bob
4. **Chat opens automatically**
5. Send message: "Hi Bob! Ready to learn Python?"
6. **Login as Bob** (different browser/incognito)
7. Go to **Conversations**
8. Click Alice's conversation
9. Reply: "Yes! Let's start with React too!"
10. Both see messages in real-time ✅

## Resources

- [TalkJS Documentation](https://talkjs.com/docs/)
- [TalkJS React Guide](https://talkjs.com/docs/Getting_Started/Frameworks/React/)
- [TalkJS Dashboard](https://talkjs.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)

---

**Need Help?** Check the troubleshooting section or create an issue!
