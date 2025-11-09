import express from 'express'
import { supabase } from '../config/supabase.js'

export const sessionsRouter = express.Router()

/**
 * POST /api/sessions
 * Create a new session
 */
sessionsRouter.post('/', async (req, res) => {
  try {
    const { matchId, date, notes, progress } = req.body

    if (!matchId || !date) {
      return res.status(400).json({ error: 'Match ID and date are required' })
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        match_id: matchId,
        date,
        notes: notes || '',
        progress: progress || {}
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      session: data
    })
  } catch (error) {
    console.error('Create session error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/sessions/match/:matchId
 * Get all sessions for a match
 */
sessionsRouter.get('/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('match_id', matchId)
      .order('date', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      sessions: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/sessions/:sessionId
 * Get a specific session
 */
sessionsRouter.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json({
      success: true,
      session: data
    })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PUT /api/sessions/:sessionId
 * Update a session
 */
sessionsRouter.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { date, notes, progress, ai_summary } = req.body

    const updateData = {}
    if (date !== undefined) updateData.date = date
    if (notes !== undefined) updateData.notes = notes
    if (progress !== undefined) updateData.progress = progress
    if (ai_summary !== undefined) updateData.ai_summary = ai_summary

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      session: data
    })
  } catch (error) {
    console.error('Update session error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/sessions/:sessionId
 * Delete a session
 */
sessionsRouter.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error

    res.json({
      success: true,
      message: 'Session deleted successfully'
    })
  } catch (error) {
    console.error('Delete session error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/sessions/user/:userId
 * Get all sessions for a user (across all matches)
 */
sessionsRouter.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // First get all matches for the user
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)

    if (matchError) throw matchError

    const matchIds = matches?.map(m => m.id) || []

    if (matchIds.length === 0) {
      return res.json({ success: true, sessions: [], count: 0 })
    }

    // Get all sessions for these matches
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .in('match_id', matchIds)
      .order('date', { ascending: false })

    if (sessionsError) throw sessionsError

    res.json({
      success: true,
      sessions: sessions || [],
      count: sessions?.length || 0
    })
  } catch (error) {
    console.error('Get user sessions error:', error)
    res.status(500).json({ error: error.message })
  }
})
