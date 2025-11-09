import express from 'express'
import { extractSkills } from '../services/aiService.js'
import { supabase } from '../config/supabase.js'
import { generateEmbedding } from '../config/gemini.js'

export const skillExtractionRouter = express.Router()

/**
 * POST /api/skills/extract
 * Extract skills from bio text
 */
skillExtractionRouter.post('/extract', async (req, res) => {
  try {
    const { bio, userId } = req.body
    
    if (!bio) {
      return res.status(400).json({ error: 'Bio text is required' })
    }
    
    // Extract skills using AI
    const skills = await extractSkills(bio)
    
    // Generate embedding for the bio
    const embedding = await generateEmbedding(bio)
    
    // If userId provided, update the user's profile
    if (userId) {
      const { error } = await supabase
        .from('users')
        .update({
          teach_skills: skills.teach_skills,
          learn_skills: skills.learn_skills,
          embeddings: embedding
        })
        .eq('id', userId)
      
      if (error) throw error
    }
    
    res.json({
      success: true,
      skills,
      embedding_dimension: embedding.length
    })
  } catch (error) {
    console.error('Skill extraction error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/skills/update
 * Update user skills manually
 */
skillExtractionRouter.post('/update', async (req, res) => {
  try {
    const { userId, teachSkills, learnSkills } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({
        teach_skills: teachSkills || [],
        learn_skills: learnSkills || []
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    res.json({ success: true, user: data })
  } catch (error) {
    console.error('Skill update error:', error)
    res.status(500).json({ error: error.message })
  }
})
