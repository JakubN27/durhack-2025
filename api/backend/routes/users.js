import express from 'express'
import { supabase } from '../config/supabase.js'
import { extractSkills } from '../services/aiService.js'
import { generateEmbedding } from '../config/gemini.js'

export const usersRouter = express.Router()

/**
 * GET /api/users
 * Get all users (for admin or matching)
 */
usersRouter.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query

    const { data, error, count } = await supabase
      .from('users')
      .select('id, name, bio, teach_skills, learn_skills', { count: 'exact' })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) throw error

    res.json({
      success: true,
      users: data || [],
      count: data?.length || 0,
      total: count
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/users/:userId
 * Get user profile by ID
 */
usersRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // If user doesn't exist (PGRST116), return empty profile structure
    if (error && error.code === 'PGRST116') {
      return res.json({
        success: true,
        data: {
          id: userId,
          name: '',
          bio: '',
          email: '',
          teach_skills: [],
          learn_skills: [],
          favorite_ice_cream: '',
          spirit_animal: '',
          personality_type: 'introvert',
          daily_rhythm: 'early_bird',
          personal_color: '',
          avatar_url: null
        }
      })
    }

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/users
 * Create a new user profile
 */
usersRouter.post('/', async (req, res) => {
  try {
    const { id, email, name, bio, avatar_url } = req.body

    if (!id || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        email,
        name: name || email.split('@')[0],
        bio: bio || '',
        avatar_url: avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&size=200`,
        teach_skills: [],
        learn_skills: []
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PUT /api/users/:userId
 * Update user profile (or create if doesn't exist)
 */
usersRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { 
      name, 
      bio, 
      email,
      teach_skills, 
      learn_skills,
      favorite_ice_cream,
      spirit_animal,
      personality_type,
      daily_rhythm,
      personal_color,
      avatar_url
    } = req.body

    // Build update data object
    const updateData = { id: userId }
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (email !== undefined) updateData.email = email
    if (teach_skills !== undefined) updateData.teach_skills = teach_skills
    if (learn_skills !== undefined) updateData.learn_skills = learn_skills
    if (favorite_ice_cream !== undefined) updateData.favorite_ice_cream = favorite_ice_cream
    if (spirit_animal !== undefined) updateData.spirit_animal = spirit_animal
    if (personality_type !== undefined) updateData.personality_type = personality_type
    if (daily_rhythm !== undefined) updateData.daily_rhythm = daily_rhythm
    if (personal_color !== undefined) updateData.personal_color = personal_color
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    // Use upsert to create or update
    const { data, error } = await supabase
      .from('users')
      .upsert(updateData, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/users/:userId/extract-skills
 * Extract skills from bio using AI and update user profile
 */
usersRouter.post('/:userId/extract-skills', async (req, res) => {
  try {
    const { userId } = req.params
    const { bio } = req.body

    if (!bio) {
      return res.status(400).json({ error: 'Bio is required' })
    }

    // Extract skills using AI
    const skills = await extractSkills(bio)

    // Generate embedding for the bio
    const embedding = await generateEmbedding(bio)

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        bio,
        teach_skills: skills.teach_skills,
        learn_skills: skills.learn_skills,
        embeddings: embedding
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: data,
      extracted_skills: {
        teach: skills.teach_skills,
        learn: skills.learn_skills
      }
    })
  } catch (error) {
    console.error('Extract skills error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/users/:userId/stats
 * Get user statistics
 */
usersRouter.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params

    // Get active matches count
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')

    if (matchesError) throw matchesError

    // Get total points
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('points')
      .eq('user_id', userId)

    if (achievementsError) throw achievementsError

    const totalPoints = achievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0

    // Get sessions count
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .in('match_id', matches?.map(m => m.id) || [])

    if (sessionsError) throw sessionsError

    res.json({
      success: true,
      stats: {
        active_matches: matches?.length || 0,
        total_points: totalPoints,
        sessions_completed: sessions?.length || 0,
        badges_earned: achievements?.length || 0
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/users/:userId
 * Delete a user
 */
usersRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: error.message })
  }
})

