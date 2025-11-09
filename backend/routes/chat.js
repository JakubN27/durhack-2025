import express from 'express'
import { supabase } from '../config/supabase.js'
import crypto from 'crypto'

export const chatRouter = express.Router()

/**
 * GET /api/chat/conversations/:userId
 * Get all conversations for a user with unread counts and last message info
 */
chatRouter.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { status = 'active', limit = 50 } = req.query

    // Get matches with full user details
    let query = supabase
      .from('matches')
      .select(`
        id,
        created_at,
        conversation_id,
        last_message_at,
        last_message_preview,
        status,
        score,
        mutual_skills,
        unread_count_a,
        unread_count_b,
        chat_enabled,
        user_a_id,
        user_b_id,
        user_a:users!matches_user_a_id_fkey(
          id,
          name,
          bio,
          avatar_url,
          teach_skills,
          learn_skills,
          is_online,
          last_active
        ),
        user_b:users!matches_user_b_id_fkey(
          id,
          name,
          bio,
          avatar_url,
          teach_skills,
          learn_skills,
          is_online,
          last_active
        )
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      // Removed chat_enabled filter - show all matches
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) throw error

    // Log for debugging
    console.log(`[Conversations] Found ${data?.length || 0} matches for user ${userId}`)

    // Format conversations with proper unread count per user
    const conversations = (data || []).map(match => {
      const isUserA = match.user_a_id === userId
      const otherUser = isUserA ? match.user_b : match.user_a
      const unreadCount = isUserA ? (match.unread_count_a || 0) : (match.unread_count_b || 0)

      return {
        matchId: match.id,
        conversationId: match.conversation_id,
        createdAt: match.created_at,
        lastMessageAt: match.last_message_at,
        lastMessagePreview: match.last_message_preview,
        status: match.status,
        score: match.score,
        mutualSkills: match.mutual_skills,
        unreadCount,
        chatEnabled: match.chat_enabled !== false, // Default to true if null
        otherUser: {
          id: otherUser?.id,
          name: otherUser?.name,
          bio: otherUser?.bio,
          avatarUrl: otherUser?.avatar_url,
          teachSkills: otherUser?.teach_skills || [],
          learnSkills: otherUser?.learn_skills || [],
          isOnline: otherUser?.is_online || false,
          lastActive: otherUser?.last_active
        }
      }
    })

    res.json({
      success: true,
      count: conversations.length,
      conversations
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/chat/conversation
 * Create or get a conversation for a match
 */
chatRouter.post('/conversation', async (req, res) => {
  try {
    const { matchId, conversationId } = req.body

    if (!matchId || !conversationId) {
      return res.status(400).json({ error: 'Match ID and conversation ID are required' })
    }

    // Check if conversation already exists
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('*')
      .eq('match_id', matchId)
      .single()

    if (existingConv) {
      return res.json({
        success: true,
        conversation: existingConv,
        created: false
      })
    }

    // Get match to verify it exists and get participants
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('user_a_id, user_b_id')
      .eq('id', matchId)
      .single()

    if (matchError) throw matchError
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    // Create conversation
    const { data: conversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        match_id: matchId,
        talkjs_conversation_id: conversationId,
        participants: [match.user_a_id, match.user_b_id]
      })
      .select()
      .single()

    if (createError) throw createError

    // Update match with conversation ID
    await supabase
      .from('matches')
      .update({ conversation_id: conversationId })
      .eq('id', matchId)

    res.json({
      success: true,
      conversation,
      created: true
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/chat/mark-read/:matchId
 * Mark all messages in a conversation as read for a user
 */
chatRouter.post('/mark-read/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Call the database function to reset unread count
    const { error } = await supabase.rpc('reset_unread_count', {
      match_uuid: matchId,
      user_uuid: userId
    })

    if (error) throw error

    // Also mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId)

    res.json({
      success: true,
      message: 'Messages marked as read'
    })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/chat/unread-count/:userId
 * Get total unread message count for a user
 */
chatRouter.get('/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Call the database function
    const { data, error } = await supabase.rpc('get_total_unread_count', {
      user_uuid: userId
    })

    if (error) throw error

    res.json({
      success: true,
      unreadCount: data || 0
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/chat/message-event
 * Track message events (sent, delivered, read, typing)
 */
chatRouter.post('/message-event', async (req, res) => {
  try {
    const { matchId, senderId, eventType, metadata = {} } = req.body

    if (!matchId || !senderId || !eventType) {
      return res.status(400).json({ error: 'Match ID, sender ID, and event type are required' })
    }

    const { data, error } = await supabase
      .from('message_events')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        event_type: eventType,
        metadata
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      event: data
    })
  } catch (error) {
    console.error('Track message event error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/chat/archive/:matchId
 * Archive a conversation for a user
 */
chatRouter.post('/archive/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get current archived_by array
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('archived_by')
      .eq('id', matchId)
      .single()

    if (fetchError) throw fetchError

    const archivedBy = match.archived_by || []
    if (!archivedBy.includes(userId)) {
      archivedBy.push(userId)
    }

    // Update archived_by
    const { error: updateError } = await supabase
      .from('matches')
      .update({ archived_by: archivedBy })
      .eq('id', matchId)

    if (updateError) throw updateError

    res.json({
      success: true,
      message: 'Conversation archived'
    })
  } catch (error) {
    console.error('Archive conversation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/chat/unarchive/:matchId
 * Unarchive a conversation for a user
 */
chatRouter.post('/unarchive/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get current archived_by array
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('archived_by')
      .eq('id', matchId)
      .single()

    if (fetchError) throw fetchError

    const archivedBy = (match.archived_by || []).filter(id => id !== userId)

    // Update archived_by
    const { error: updateError } = await supabase
      .from('matches')
      .update({ archived_by: archivedBy })
      .eq('id', matchId)

    if (updateError) throw updateError

    res.json({
      success: true,
      message: 'Conversation unarchived'
    })
  } catch (error) {
    console.error('Unarchive conversation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PUT /api/chat/online-status/:userId
 * Update user's online status
 */
chatRouter.put('/online-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { isOnline } = req.body

    const updates = {
      is_online: isOnline,
      last_active: new Date().toISOString()
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    res.json({
      success: true,
      message: 'Online status updated'
    })
  } catch (error) {
    console.error('Update online status error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/chat/talkjs-signature
 * Generate HMAC signature for TalkJS authentication
 */
chatRouter.post('/talkjs-signature', async (req, res) => {
  try {
    const { userId, appId } = req.body

    if (!userId || !appId) {
      return res.status(400).json({ error: 'User ID and App ID are required' })
    }

    const secret = process.env.TALKJS_SECRET_KEY
    if (!secret) {
      throw new Error('TalkJS secret key not configured')
    }

    // Generate HMAC signature
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(userId)
    const signature = hmac.digest('hex')

    // Store signature in user record
    await supabase
      .from('users')
      .update({ talkjs_signature: signature })
      .eq('id', userId)

    res.json({
      success: true,
      signature
    })
  } catch (error) {
    console.error('Generate TalkJS signature error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/chat/conversation/:matchId
 * Get conversation details for a specific match
 */
chatRouter.get('/conversation/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        match:matches(
          id,
          status,
          score,
          mutual_skills,
          user_a:users!matches_user_a_id_fkey(id, name, avatar_url, bio),
          user_b:users!matches_user_b_id_fkey(id, name, avatar_url, bio)
        )
      `)
      .eq('match_id', matchId)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    res.json({
      success: true,
      conversation: data
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/chat/stats/:userId
 * Get chat statistics for a user
 */
chatRouter.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Get total conversations
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, status, user_a_id, user_b_id, unread_count_a, unread_count_b')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('chat_enabled', true)

    if (matchError) throw matchError

    // Calculate stats
    const totalConversations = matches.length
    const activeConversations = matches.filter(m => m.status === 'active').length
    const totalUnread = matches.reduce((sum, match) => {
      const unread = match.user_a_id === userId ? match.unread_count_a : match.unread_count_b
      return sum + (unread || 0)
    }, 0)

    // Get message count
    const matchIds = matches.map(m => m.id)
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('match_id', matchIds)
      .eq('sender_id', userId)

    if (msgError) throw msgError

    res.json({
      success: true,
      stats: {
        totalConversations,
        activeConversations,
        totalUnread,
        messagesSent: messages || 0
      }
    })
  } catch (error) {
    console.error('Get chat stats error:', error)
    res.status(500).json({ error: error.message })
  }
})
