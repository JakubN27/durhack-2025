import express from 'express'
import { generateLearningPlan, generateSessionSummary } from '../services/aiService.js'

export const aiRouter = express.Router()

/**
 * POST /api/ai/learning-plan
 * Generate a learning plan for a skill exchange
 */
aiRouter.post('/learning-plan', async (req, res) => {
  try {
    const { teacherSkills, learnerGoals, sessionCount = 6 } = req.body

    if (!teacherSkills || !learnerGoals) {
      return res.status(400).json({ error: 'Teacher skills and learner goals are required' })
    }

    const plan = await generateLearningPlan(teacherSkills, learnerGoals, sessionCount)

    res.json({
      success: true,
      plan,
      session_count: plan.length
    })
  } catch (error) {
    console.error('Learning plan error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/ai/session-summary
 * Generate AI summary for a session
 */
aiRouter.post('/session-summary', async (req, res) => {
  try {
    const { sessionNotes, participantEngagement = 'medium' } = req.body

    if (!sessionNotes) {
      return res.status(400).json({ error: 'Session notes are required' })
    }

    const summary = await generateSessionSummary(sessionNotes, participantEngagement)

    res.json({
      success: true,
      summary
    })
  } catch (error) {
    console.error('Session summary error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/ai/nudge
 * Generate a motivational nudge
 */
aiRouter.post('/nudge', async (req, res) => {
  try {
    const { context, userProgress } = req.body

    // Simple nudge generation (can be enhanced with AI)
    const nudges = {
      low_engagement: "Don't give up! Every expert was once a beginner. Keep practicing!",
      missed_session: "We miss you! Your learning partner is excited to continue your journey together.",
      milestone: "Congratulations on your progress! You're doing amazing!",
      stagnant: "Time to level up! Consider exploring advanced topics in your skill.",
      consistent: "You're on fire! Your consistency is inspiring."
    }

    const nudge = nudges[context] || "Keep up the great work! Learning is a journey."

    res.json({
      success: true,
      nudge,
      context
    })
  } catch (error) {
    console.error('Nudge generation error:', error)
    res.status(500).json({ error: error.message })
  }
})
