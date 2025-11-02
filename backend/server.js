import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { skillExtractionRouter } from './routes/skillExtraction.js'
import { matchingRouter } from './routes/matching.js'
import { embeddingsRouter } from './routes/embeddings.js'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'
import { sessionsRouter } from './routes/sessions.js'
import { messagesRouter } from './routes/messages.js'
import { achievementsRouter } from './routes/achievements.js'
import { aiRouter } from './routes/ai.js'
import { chatRouter } from './routes/chat.js'
import { notificationsRouter } from './routes/notifications.js'
import { networkRouter } from './routes/network.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SkillSwap API is running',
    timestamp: new Date().toISOString()
  })
})

// API Documentation
app.get('/', (req, res) => {
  res.json({
    name: 'SkillSwap API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      skills: '/api/skills',
      matching: '/api/matching',
      sessions: '/api/sessions',
      messages: '/api/messages',
      achievements: '/api/achievements',
      ai: '/api/ai',
      embeddings: '/api/embeddings',
      chat: '/api/chat',
      notifications: '/api/notifications'
    },
    docs: 'See /api/docs for detailed documentation'
  })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/skills', skillExtractionRouter)
app.use('/api/matching', matchingRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/achievements', achievementsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/embeddings', embeddingsRouter)
app.use('/api/chat', chatRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/network', networkRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`🚀 SkillSwap API running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}`)
  console.log(`❤️  Health check: http://localhost:${PORT}/health`)
})
