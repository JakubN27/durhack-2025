import Talk from 'talkjs';

// TalkJS App ID - you need to get this from https://talkjs.com/dashboard
const TALKJS_APP_ID = import.meta.env.VITE_TALKJS_APP_ID || 'YOUR_TALKJS_APP_ID';

/**
 * Initialize TalkJS session for a user
 */
export async function initializeTalkJS(currentUser) {
  await Talk.ready;
  
  const me = new Talk.User({
    id: currentUser.id,
    name: currentUser.name || currentUser.email,
    email: currentUser.email,
    photoUrl: currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&size=200`,
    role: 'default',
  });
  
  const session = new Talk.Session({
    appId: TALKJS_APP_ID,
    me: me,
  });
  
  return { session, me };
}

/**
 * Create or get a conversation between two users
 */
export function createConversation(session, currentUser, otherUser, conversationId) {
  const other = new Talk.User({
    id: otherUser.id || otherUser.user_id,
    name: otherUser.name || otherUser.user_name,
    email: otherUser.email || `user${otherUser.id}@skillswap.com`,
    photoUrl: otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name || otherUser.user_name)}&size=200`,
    role: 'default',
  });
  
  const conversation = session.getOrCreateConversation(conversationId || Talk.oneOnOneId(currentUser, other));
  conversation.setParticipant(session.me);
  conversation.setParticipant(other);
  
  // Set conversation subject/title
  conversation.setAttributes({
    subject: `Chat with ${otherUser.name || otherUser.user_name}`,
    custom: {
      type: 'skillswap_match'
    }
  });
  
  return conversation;
}

/**
 * Get inbox for showing all conversations
 */
export function createInbox(session) {
  return session.createInbox();
}

/**
 * Create chatbox for a specific conversation
 */
export function createChatbox(session, conversation) {
  return session.createChatbox(conversation);
}
