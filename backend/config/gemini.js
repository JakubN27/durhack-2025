import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn('⚠️  GEMINI_API_KEY not set. AI features will be disabled.')
} else {
  console.log('✅ Gemini API configured successfully')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Text generation model
export const textModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null

// Embedding model
export const embeddingModel = genAI ? genAI.getGenerativeModel({ model: 'embedding-001' }) : null

// Generate embeddings for text
export async function generateEmbedding(text) {
  try {
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}
