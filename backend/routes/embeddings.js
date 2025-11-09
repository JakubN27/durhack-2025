import express from 'express'
import { generateEmbedding } from '../config/gemini.js'

export const embeddingsRouter = express.Router()

/**
 * POST /api/embeddings/generate
 * Generate embeddings for text
 */
embeddingsRouter.post('/generate', async (req, res) => {
  try {
    const { text } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }
    
    const embedding = await generateEmbedding(text)
    
    res.json({
      success: true,
      embedding,
      dimension: embedding.length
    })
  } catch (error) {
    console.error('Embedding generation error:', error)
    res.status(500).json({ error: error.message })
  }
})
