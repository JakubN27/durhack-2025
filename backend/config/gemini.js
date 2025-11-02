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

// Text generation model - using gemini-2.0-flash (stable, fast, available in v1 API)
export const textModel = genAI ? genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',  // Fastest model available
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40
  }
}) : null

// Embedding model with stable API configuration
export const embeddingModel = genAI ? genAI.getGenerativeModel({
  model: 'text-embedding-004'  // Current embedding model
}) : null

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
