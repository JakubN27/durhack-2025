import app from './server.js'

// Prefer explicitly-set PORT from api/.env, otherwise default to 3000
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 SkillSwap API running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}`)
  console.log(`❤️  Health check: http://localhost:${PORT}/health`)
})
