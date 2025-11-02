# Google Gemini AI Integration Guide

**Last Updated:** November 2, 2025

## Overview

SkillSwap integrates **Google Gemini AI** to power intelligent features including skill extraction, match scoring, learning plan generation, and session summaries. Gemini is optional but enhances the user experience significantly.

---

## 🎯 What Gemini Powers

### 1. **Skill Extraction** 🎓
Automatically extracts skills from user bios and categorizes them into "teach" and "learn" skills.

**Use Cases:**
- User writes a bio like "I'm a Python developer interested in learning Japanese"
- Gemini identifies: **Teach**: Python (advanced) | **Learn**: Japanese (beginner)

### 2. **Match Scoring Enhancement** 🎯
Analyzes user profiles to improve match quality beyond simple keyword matching.

**Enhanced Factors:**
- Teaching expertise depth
- Learning goal clarity
- Reciprocal learning potential
- Profile quality assessment

### 3. **Learning Plan Generation** 📚
Creates structured, personalized learning roadmaps for skill exchanges.

**Features:**
- Session-by-session breakdown
- Topics, exercises, and outcomes
- Difficulty progression
- Customizable session count

### 4. **Session Summaries** 📝
Generates motivational summaries after learning sessions.

**Includes:**
- Session highlights
- Key achievements
- Areas for improvement
- Motivational messages
- Next steps

---

## 🔧 Setup & Configuration

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIzaSy...`)

### 2. Configure Backend

Add to `/backend/.env`:
```bash
# Gemini API Key (Optional - AI features will be disabled if not set)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
```

### 3. Configure Frontend (Optional)

Add to `/frontend/.env.local`:
```bash
# Gemini API Key (Optional)
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
```

**Note:** Frontend Gemini configuration is optional. Most AI features run on the backend.

### 4. Verify Configuration

When you start the backend, you should see:
```
✅ Gemini API configured successfully
```

If not configured:
```
⚠️  GEMINI_API_KEY not set. AI features will be disabled.
```

---

## 📁 File Structure

### Backend Configuration

```
backend/
├── config/
│   └── gemini.js              # Gemini client setup & models
├── services/
│   ├── aiService.js           # AI features (skill extraction, learning plans)
│   └── matchingService.js     # Enhanced matching with Gemini
└── routes/
    ├── ai.js                  # AI API endpoints
    ├── skillExtraction.js     # Skill extraction endpoints
    └── users.js               # User routes using AI
```

### Configuration File: `backend/config/gemini.js`

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Text generation model
export const textModel = genAI ? genAI.getGenerativeModel({
  model: 'gemini-pro',
  apiVersion: 'v1',
  generationConfig: {
    temperature: 0.7,  // Creativity (0-1)
    topP: 0.8,         // Diversity
    topK: 40           // Token selection
  }
}) : null

// Embedding model for semantic search
export const embeddingModel = genAI ? genAI.getGenerativeModel({
  model: 'embedding-001',
  apiVersion: 'v1'
}) : null

// Generate embeddings for text
export async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values  // Returns array of floats
}
```

---

## 🚀 API Endpoints

### 1. Skill Extraction

**Endpoint:** `POST /api/skills/extract`

**Request:**
```json
{
  "bio": "I'm a Python developer with 5 years of experience. I want to learn Japanese and guitar.",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "skills": {
    "teach_skills": [
      {
        "name": "Python",
        "proficiency": "advanced",
        "category": "technical"
      }
    ],
    "learn_skills": [
      {
        "name": "Japanese",
        "proficiency": "beginner",
        "category": "language"
      },
      {
        "name": "Guitar",
        "proficiency": "beginner",
        "category": "creative"
      }
    ]
  },
  "embedding_dimension": 768
}
```

**Implementation:** `/backend/routes/skillExtraction.js`

---

### 2. Learning Plan Generation

**Endpoint:** `POST /api/ai/learning-plan`

**Request:**
```json
{
  "teacherSkills": [
    {
      "name": "Python",
      "proficiency": "advanced"
    }
  ],
  "learnerGoals": [
    {
      "name": "Python",
      "proficiency": "beginner"
    }
  ],
  "sessionCount": 6
}
```

**Response:**
```json
{
  "success": true,
  "plan": [
    {
      "session": 1,
      "title": "Introduction to Python Basics",
      "topics": ["Variables", "Data types", "Basic operators"],
      "exercises": ["Write hello world", "Create calculator"],
      "outcomes": ["Understand Python syntax", "Run first program"],
      "difficulty": "beginner"
    },
    // ... more sessions
  ],
  "session_count": 6
}
```

**Implementation:** `/backend/routes/ai.js`

---

### 3. Session Summary

**Endpoint:** `POST /api/ai/session-summary`

**Request:**
```json
{
  "sessionNotes": "Covered Python functions, discussed lambda expressions, practiced with examples",
  "participantEngagement": "high"
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "summary": "Session covered Python functions and lambda expressions with practical examples",
    "achievements": [
      "Understood function syntax",
      "Mastered lambda expressions"
    ],
    "improvements": [
      "Practice more complex functions"
    ],
    "motivation": "Great progress! You're mastering Python fundamentals quickly.",
    "next_steps": [
      "Practice writing decorators",
      "Explore function composition"
    ]
  }
}
```

**Implementation:** `/backend/routes/ai.js`

---

### 4. Enhanced Matching (Internal)

**How It Works:**

When a user searches for matches (`GET /api/matching/user/:userId`), Gemini enhances the scoring:

```javascript
// In matchingService.js
async function analyzeProfileSkills(profile) {
  if (!textModel) {
    // Fallback: basic matching without AI
    return null
  }

  const prompt = `
    Analyze the following user profile:
    Bio: ${profile.bio}
    Teaching Skills: ${JSON.stringify(profile.teach_skills)}
    Learning Skills: ${JSON.stringify(profile.learn_skills)}

    Evaluate:
    1. Teaching expertise depth (score 0-1)
    2. Learning goal clarity (score 0-1)
    3. Reciprocal learning potential
  `

  const result = await textModel.generateContent(prompt)
  const analysis = JSON.parse(result.response.text())
  
  return {
    teaching_expertise: analysis.teaching_expertise || 0,
    learning_clarity: analysis.learning_clarity || 0,
    reciprocal_potential: analysis.reciprocal_potential || []
  }
}
```

**Scoring Formula:**
```javascript
// Without Gemini (basic)
finalScore = (skillMatchScore * 0.7) + (personalityScore * 0.3)

// With Gemini (enhanced)
finalScore = (skillMatchScore * 0.6) + 
             (personalityScore * 0.2) + 
             (teachingExpertise * 0.1) + 
             (learningClarity * 0.1)
```

---

## 💡 Implementation Details

### 1. Skill Extraction Flow

```
User Input (Bio)
    ↓
POST /api/skills/extract
    ↓
aiService.extractSkills()
    ↓
Gemini API (gemini-pro model)
    ↓
Parse JSON response
    ↓
Generate embeddings (embedding-001 model)
    ↓
Update user profile in Supabase
    ↓
Return skills + embedding dimension
```

**Code:** `/backend/services/aiService.js`

```javascript
export async function extractSkills(bioText) {
  const prompt = `
    Analyze the following user bio and extract skills.
    
    User Bio: "${bioText}"
    
    Extract and categorize skills into:
    1. Skills the user can TEACH
    2. Skills the user wants to LEARN
    
    Return ONLY a valid JSON object in this format:
    {
      "teach_skills": [...],
      "learn_skills": [...]
    }
  `

  const result = await textModel.generateContent(prompt)
  const text = result.response.text()
  
  // Handle markdown code blocks
  let jsonText = text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }
  
  const skills = JSON.parse(jsonText)
  return skills
}
```

---

### 2. Embedding Generation

**Purpose:** Enable semantic search and similarity matching

**Process:**
1. User bio → Gemini embedding model
2. Returns 768-dimensional vector
3. Stored in Supabase `users.embeddings` column
4. Used for cosine similarity calculations in matching

**Code:**
```javascript
export async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values  // Array of 768 floats
}
```

**Database Storage:**
```sql
-- In users table
embeddings vector(768)  -- pgvector extension
```

---

### 3. Learning Plan Generation

**Prompt Engineering:**

```javascript
const prompt = `
  Create a structured learning plan for a skill exchange.
  
  Teacher's Skills: ${JSON.stringify(teacherSkills)}
  Learner's Goals: ${JSON.stringify(learnerGoals)}
  Number of Sessions: ${sessionCount}
  
  Create a ${sessionCount}-session learning roadmap with:
  - Session number and title
  - Topics to cover
  - Practical exercises
  - Expected outcomes
  - Difficulty progression
  
  Return ONLY a valid JSON array.
`
```

**Response Parsing:**
- Handles markdown code blocks
- Validates JSON structure
- Returns array of session objects

---

## 🔒 Security & Best Practices

### 1. API Key Management

✅ **DO:**
- Store keys in `.env` files (never commit!)
- Use environment variables
- Add `.env` to `.gitignore`
- Use different keys for dev/prod

❌ **DON'T:**
- Hardcode API keys in source code
- Commit keys to version control
- Share keys in public forums
- Use production keys in development

### 2. Rate Limiting

**Gemini Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day

**Recommendations:**
- Implement request queuing
- Cache AI responses when possible
- Use AI features strategically (not on every request)
- Consider upgrading for production

### 3. Error Handling

```javascript
try {
  const result = await textModel.generateContent(prompt)
  // ... process result
} catch (error) {
  console.error('Gemini API error:', error)
  
  // Graceful fallback
  if (error.message.includes('rate limit')) {
    return { error: 'Too many requests. Please try again later.' }
  }
  
  // Return basic response without AI
  return basicSkillExtraction(bioText)
}
```

### 4. Prompt Injection Prevention

✅ **Sanitize user input:**
```javascript
const sanitizedBio = bioText
  .replace(/[<>]/g, '')  // Remove HTML
  .slice(0, 2000)        // Limit length
```

---

## 📊 Monitoring & Debugging

### 1. Check Configuration

**Backend logs on startup:**
```bash
✅ Gemini API configured successfully
```

**Or:**
```bash
⚠️  GEMINI_API_KEY not set. AI features will be disabled.
```

### 2. Test Skill Extraction

```bash
curl -X POST http://localhost:3000/api/skills/extract \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I am a software engineer who wants to learn Spanish"
  }'
```

### 3. Common Issues

**Issue:** "Gemini API not configured"
- **Cause:** Missing or invalid `GEMINI_API_KEY`
- **Fix:** Add key to `/backend/.env` and restart server

**Issue:** Rate limit errors
- **Cause:** Exceeded 60 requests/minute
- **Fix:** Implement request queuing or upgrade tier

**Issue:** Invalid JSON response
- **Cause:** Gemini returns markdown or extra text
- **Fix:** Enhanced parsing in `aiService.js` handles this

**Issue:** Embedding dimension mismatch
- **Cause:** Changed embedding model
- **Fix:** Update database schema to match new dimension

---

## 🎓 Models Used

### 1. **gemini-pro** (Text Generation)
- **Use:** Skill extraction, learning plans, summaries
- **Config:** Temperature 0.7, TopP 0.8, TopK 40
- **Output:** Text (JSON formatted)

### 2. **embedding-001** (Embeddings)
- **Use:** Semantic search, similarity matching
- **Output:** 768-dimensional vector
- **Storage:** PostgreSQL with pgvector extension

---

## 🚀 Advanced Features

### 1. Batch Processing

For processing multiple users at once:

```javascript
const analyses = await Promise.all(
  users.map(user => analyzeProfileSkills(user))
)
```

### 2. Caching Responses

```javascript
// Cache skill extractions to avoid redundant API calls
const cacheKey = `skills:${userId}:${bioHash}`
const cached = await redis.get(cacheKey)

if (cached) return JSON.parse(cached)

const skills = await extractSkills(bio)
await redis.setex(cacheKey, 3600, JSON.stringify(skills))
return skills
```

### 3. Custom Prompts

Adjust prompts in `/backend/services/aiService.js` to fine-tune AI behavior:

```javascript
const prompt = `
  You are an expert in skill assessment for learning platforms.
  [Your custom instructions...]
`
```

---

## 📝 Testing

### Unit Tests

```javascript
// Test skill extraction
import { extractSkills } from '../services/aiService.js'

describe('extractSkills', () => {
  it('should extract teach and learn skills', async () => {
    const bio = "I'm a Python expert learning Japanese"
    const result = await extractSkills(bio)
    
    expect(result.teach_skills).toContainEqual(
      expect.objectContaining({ name: 'Python' })
    )
    expect(result.learn_skills).toContainEqual(
      expect.objectContaining({ name: 'Japanese' })
    )
  })
})
```

### Integration Tests

Test full API endpoints with real Gemini calls (use dev API key).

---

## 💰 Cost Considerations

### Free Tier (Current)
- ✅ 60 RPM (requests per minute)
- ✅ 1,500 RPD (requests per day)
- ✅ Free forever for small projects

### Paid Tier
- 🚀 Higher rate limits
- 🚀 Priority support
- 🚀 Production SLA

**Estimate:**
- Skill extraction: ~1-2 seconds per request
- Learning plan: ~3-5 seconds per request
- Embedding: ~0.5 seconds per request

---

## 🔗 Related Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System design and data flow
- [API Documentation](../backend/API_DOCUMENTATION.md) - Full API reference
- [Setup Guide](./SETUP.md) - Initial project setup
- [Development Guide](./DEVELOPMENT.md) - Contributing and development workflow

---

## 📚 External Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini Models](https://ai.google.dev/models/gemini)
- [Rate Limits & Quotas](https://ai.google.dev/docs/rate_limits)

---

## ✅ Quick Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to `/backend/.env`
- [ ] Restart backend server
- [ ] Verify "✅ Gemini API configured successfully" in logs
- [ ] Test skill extraction endpoint
- [ ] Test learning plan generation
- [ ] Monitor rate limits in production

---

**Status:** ✅ Fully Implemented  
**Optional:** Yes - app works without it, but with reduced AI features  
**Recommended:** Yes - significantly improves user experience
