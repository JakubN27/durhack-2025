import app from './server.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 SkillSwap API running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}`)
  console.log(`❤️  Health check: http://localhost:${PORT}/health`)
})
