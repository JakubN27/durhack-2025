import express from 'express'
import { supabase } from '../config/supabase.js'

export const messagesRouter = express.Router()

/**
 * POST /api/messages
 * Send a new message
 */
messagesRouter.post('/', async (req, res) => {
  try {
    const { matchId, senderId, content } = req.body

    if (!matchId || !senderId || !content) {
      return res.status(400).json({ error: 'Match ID, sender ID, and content are required' })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
        read: false
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: data
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/messages/match/:matchId
 * Get all messages for a match
 */
messagesRouter.get('/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name)
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json({
      success: true,
      messages: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/messages/:messageId/read
 * Mark a message as read
 */
messagesRouter.patch('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params

    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: data
    })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/messages/match/:matchId/read-all
 * Mark all messages in a match as read for a user
 */
messagesRouter.patch('/match/:matchId/read-all', async (req, res) => {
  try {
    const { matchId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId)
      .select()

    if (error) throw error

    res.json({
      success: true,
      updated_count: data?.length || 0
    })
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/messages/unread/:userId
 * Get unread message count for a user
 */
messagesRouter.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Get all matches for the user
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)

    if (matchError) throw matchError

    const matchIds = matches?.map(m => m.id) || []

    if (matchIds.length === 0) {
      return res.json({ success: true, unread_count: 0, by_match: {} })
    }

    // Get unread messages count per match
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('match_id')
      .in('match_id', matchIds)
      .neq('sender_id', userId)
      .eq('read', false)

    if (messagesError) throw messagesError

    // Count by match
    const byMatch = {}
    unreadMessages?.forEach(msg => {
      byMatch[msg.match_id] = (byMatch[msg.match_id] || 0) + 1
    })

    res.json({
      success: true,
      unread_count: unreadMessages?.length || 0,
      by_match: byMatch
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/messages/:messageId
 * Delete a message
 */
messagesRouter.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ error: error.message })
  }
})
