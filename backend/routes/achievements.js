import express from 'express'
import { supabase } from '../config/supabase.js'

export const achievementsRouter = express.Router()

/**
 * POST /api/achievements
 * Create a new achievement
 */
achievementsRouter.post('/', async (req, res) => {
  try {
    const { userId, badgeName, points, description } = req.body

    if (!userId || !badgeName) {
      return res.status(400).json({ error: 'User ID and badge name are required' })
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        badge_name: badgeName,
        points: points || 0,
        description: description || ''
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      achievement: data
    })
  } catch (error) {
    console.error('Create achievement error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/achievements/user/:userId
 * Get all achievements for a user
 */
achievementsRouter.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate total points
    const totalPoints = data?.reduce((sum, a) => sum + (a.points || 0), 0) || 0

    res.json({
      success: true,
      achievements: data || [],
      count: data?.length || 0,
      total_points: totalPoints
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/achievements/leaderboard
 * Get leaderboard of top users by points
 */
achievementsRouter.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // Get all achievements with user info
    const { data, error } = await supabase
      .from('achievements')
      .select(`
        user_id,
        points,
        users!achievements_user_id_fkey(id, name)
      `)

    if (error) throw error

    // Aggregate points by user
    const userPoints = {}
    data?.forEach(achievement => {
      const userId = achievement.user_id
      if (!userPoints[userId]) {
        userPoints[userId] = {
          user_id: userId,
          name: achievement.users?.name || 'Unknown',
          total_points: 0,
          badges_count: 0
        }
      }
      userPoints[userId].total_points += achievement.points || 0
      userPoints[userId].badges_count += 1
    })

    // Convert to array and sort
    const leaderboard = Object.values(userPoints)
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit)

    res.json({
      success: true,
      leaderboard,
      count: leaderboard.length
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/achievements/:achievementId
 * Delete an achievement
 */
achievementsRouter.delete('/:achievementId', async (req, res) => {
  try {
    const { achievementId } = req.params

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', achievementId)

    if (error) throw error

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    })
  } catch (error) {
    console.error('Delete achievement error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/achievements/award
 * Award a predefined achievement to a user
 */
achievementsRouter.post('/award', async (req, res) => {
  try {
    const { userId, achievementType } = req.body

    if (!userId || !achievementType) {
      return res.status(400).json({ error: 'User ID and achievement type are required' })
    }

    // Define achievement types
    const achievementTypes = {
      first_profile: { name: 'Profile Creator', points: 10, description: 'Created your first profile' },
      first_match: { name: 'Connected', points: 25, description: 'Made your first match' },
      first_session: { name: 'Learner', points: 50, description: 'Completed your first session' },
      five_sessions: { name: 'Dedicated', points: 100, description: 'Completed 5 sessions' },
      teacher: { name: 'Teacher', points: 75, description: 'Taught a skill' },
      legacy_builder: { name: 'Legacy Builder', points: 150, description: 'Your skills reached 5 learners' },
      helpful: { name: 'Helpful', points: 50, description: 'Received positive feedback' }
    }

    const achievement = achievementTypes[achievementType]
    if (!achievement) {
      return res.status(400).json({ error: 'Invalid achievement type' })
    }

    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_name', achievement.name)
      .single()

    if (existing) {
      return res.json({
        success: false,
        message: 'User already has this achievement'
      })
    }

    // Award the achievement
    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        badge_name: achievement.name,
        points: achievement.points,
        description: achievement.description
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      achievement: data,
      message: `Awarded ${achievement.name}!`
    })
  } catch (error) {
    console.error('Award achievement error:', error)
    res.status(500).json({ error: error.message })
  }
})
