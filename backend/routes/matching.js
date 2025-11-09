import express from 'express'
import { supabase } from '../config/supabase.js'
import { findMatches, createMatch, getUserMatches } from '../services/matchingService.js'

export const matchingRouter = express.Router()

/**
 * GET /api/matching/find/:userId
 * Find potential matches for a user
 * Query params: limit (number), skill (string) for search
 */
matchingRouter.get('/find/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const limit = parseInt(req.query.limit) || 10
    const searchSkill = req.query.skill || null
    
    const matches = await findMatches(userId, limit, searchSkill)
    
    res.json({
      success: true,
      count: matches.length,
      matches,
      searchSkill: searchSkill
    })
  } catch (error) {
    console.error('Matching error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/matching/create
 * Create a match between two users
 * If match already exists, returns the existing match instead of error
 */
matchingRouter.post('/create', async (req, res) => {
  try {
    const { userAId, userBId, score, mutualSkills } = req.body
    
    if (!userAId || !userBId) {
      return res.status(400).json({ error: 'Both user IDs are required' })
    }
    
    const match = await createMatch(userAId, userBId, score || 0, mutualSkills || [])
    
    res.json({
      success: true,
      match,
      created: match.created !== false,
      message: match.created === false ? 'Match already exists' : 'Match created successfully'
    })
  } catch (error) {
    console.error('Create match error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/matching/user/:userId
 * Get all matches for a user
 */
matchingRouter.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const matches = await getUserMatches(userId)
    
    res.json({
      success: true,
      count: matches.length,
      matches
    })
  } catch (error) {
    console.error('Get matches error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/matching/:matchId
 * Get a specific match by ID
 */
matchingRouter.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey(id, name, bio, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, teach_skills, learn_skills)
      `)
      .eq('id', matchId)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Match not found' })
    }

    res.json({
      success: true,
      match: data
    })
  } catch (error) {
    console.error('Get match error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/matching/:matchId/status
 * Update match status
 */
matchingRouter.patch('/:matchId/status', async (req, res) => {
  try {
    const { matchId } = req.params
    const { status } = req.body
    
    if (!['pending', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single()
    
    if (error) throw error
    
    res.json({ success: true, match: data })
  } catch (error) {
    console.error('Update match status error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/matching/:matchId
 * Delete a match
 */
matchingRouter.delete('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)

    if (error) throw error

    res.json({
      success: true,
      message: 'Match deleted successfully'
    })
  } catch (error) {
    console.error('Delete match error:', error)
    res.status(500).json({ error: error.message })
  }
})
