# SkillSwap - Complete API Reference

**Version:** 1.2  
**Last Updated:** November 2, 2025

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication

All endpoints require a valid Supabase auth token in the Authorization header:

```
Authorization: Bearer <supabase_access_token>
```

Get token from Supabase Auth:
```javascript
const { data: { session } } = await supabase.auth.getSession()
const token = session.access_token
```

---

## 👤 User Endpoints

### Create User
```http
POST /api/users
```

**Request Body:**
```json
{
  "id": "uuid-from-supabase-auth",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "bio": "Passionate developer",
  "teach_skills": [
    {"name": "Python", "proficiency": "advanced", "category": "Programming Languages"}
  ],
  "learn_skills": [
    {"name": "Japanese", "proficiency": "beginner", "category": "Language"}
  ],
  "personality_type": "introvert",
  "daily_rhythm": "early_bird",
  "spirit_animal": "Owl",
  "favorite_ice_cream": "Vanilla"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* user object */ }
}
```

### Get User Profile
```http
GET /api/users/:userId
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "bio": "Passionate developer",
  "avatar_url": "https://...",
  "teach_skills": [...],
  "learn_skills": [...],
  "personality_type": "introvert",
  "daily_rhythm": "early_bird",
  "spirit_animal": "Owl",
  "favorite_ice_cream": "Vanilla",
  "created_at": "2025-11-01T12:00:00Z"
}
```

### Update User Profile
```http
PUT /api/users/:userId
```

**Request Body:** Same as create user (all fields optional)

---

## 🎯 Matching Endpoints

### Get User Matches
```http
GET /api/matching/user/:userId?search=Python
```

**Query Parameters:**
- `search` (optional) - Filter by skill name

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "user_id": "uuid",
      "user_name": "John Smith",
      "user_bio": "...",
      "avatar_url": "https://...",
      "teach_skills": [...],
      "learn_skills": [...],
      "score_a_to_b": 0.85,
      "score_b_to_a": 0.78,
      "reciprocal_score": 0.87,
      "mutual_skills": [
        {
          "skill": "Python",
          "direction": "you_teach",
          "teacher": "You",
          "learner": "John"
        }
      ],
      "personality_compatibility": 0.82,
      "compatibility_breakdown": {
        "skill_match": 0.82,
        "basic_personality": 0.82,
        "ai_bio_compatibility": 0.85,
        "ai_learning_style": 0.78,
        "ai_personality_synergy": 0.92,
        "ai_communication": 0.88,
        "ai_motivation": 0.75,
        "ai_cultural_overlap": 0.70,
        "insights": ["Insight 1", "Insight 2"],
        "challenges": ["Challenge 1"],
        "recommendation": "strong"
      }
    }
  ],
  "count": 1
}
```

### Create Match
```http
POST /api/matching/create
```

**Request Body:**
```json
{
  "userAId": "uuid-1",
  "userBId": "uuid-2",
  "score": 0.87,
  "mutualSkills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "match": {
    "id": "match-uuid",
    "user_a_id": "uuid-1",
    "user_b_id": "uuid-2",
    "score": 0.87,
    "mutual_skills": [...],
    "status": "pending",
    "chat_enabled": true,
    "conversation_id": "match-uuid-1-uuid-2",
    "created_at": "2025-11-02T12:00:00Z",
    "user_a": { /* full user object */ },
    "user_b": { /* full user object */ }
  },
  "created": true
}
```

---

## 💬 Chat Endpoints

### Get Match for Chat
```http
GET /api/chat/:matchId
```

**Response:**
```json
{
  "success": true,
  "match": {
    "id": "match-uuid",
    "user_a": { /* user object with avatar_url */ },
    "user_b": { /* user object with avatar_url */ },
    "mutual_skills": [...],
    "status": "active",
    "conversation_id": "match-uuid-1-uuid-2"
  },
  "currentUserId": "uuid",
  "otherUser": { /* user object */ }
}
```

### Get User Conversations
```http
GET /api/chat/conversations/:userId
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "match-uuid",
      "user_a": {...},
      "user_b": {...},
      "status": "active",
      "last_message_at": "2025-11-02T10:00:00Z",
      "last_message_preview": "Hey, let's schedule...",
      "unread_count": 2
    }
  ],
  "count": 1
}
```

---

## 🤖 AI Endpoints

### Extract Skills from Bio
```http
POST /api/skills/extract
```

**Request Body:**
```json
{
  "bio": "I'm a Python developer who wants to learn Japanese",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "skills": {
    "teach_skills": [
      {"name": "Python", "proficiency": "advanced", "category": "technical"}
    ],
    "learn_skills": [
      {"name": "Japanese", "proficiency": "beginner", "category": "language"}
    ]
  },
  "embedding_dimension": 768
}
```

### Generate Learning Plan
```http
POST /api/ai/learning-plan
```

**Request Body:**
```json
{
  "teacherSkills": [{"name": "Python", "proficiency": "advanced"}],
  "learnerGoals": [{"name": "Python", "proficiency": "beginner"}],
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
      "title": "Introduction to Python",
      "topics": ["Variables", "Data types"],
      "exercises": ["Hello world", "Calculator"],
      "outcomes": ["Understand syntax"],
      "difficulty": "beginner"
    }
  ],
  "session_count": 6
}
```

### Generate Session Summary
```http
POST /api/ai/session-summary
```

**Request Body:**
```json
{
  "sessionNotes": "Covered functions and lambdas",
  "participantEngagement": "high"
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "summary": "Session covered Python functions...",
    "achievements": ["Understood functions", "Mastered lambdas"],
    "improvements": ["Practice decorators"],
    "motivation": "Great progress!",
    "next_steps": ["Try decorators", "Explore composition"]
  }
}
```

---

## 🔐 Auth Endpoints

### Sign Up
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Jane Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...},
  "session": {...}
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

---

## 📁 File Upload

### Upload Profile Picture
```http
POST /api/upload/avatar
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - Image file (max 2MB, jpg/png/gif/webp)
- `userId` - User UUID

**Response:**
```json
{
  "success": true,
  "url": "https://supabase-storage.../avatars/uuid.jpg"
}
```

---

## 📊 Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid token)
- `404` - Not Found
- `429` - Rate Limit Exceeded (Gemini API)
- `500` - Internal Server Error

---

## ⚡ Rate Limits

### Gemini AI
- Free Tier: 60 requests/minute
- Paid Tier: Higher limits

### Supabase
- Free Tier: Standard rate limits apply
- Check Supabase dashboard for details

---

## 🧪 Testing Endpoints

Use `curl` or tools like Postman:

```bash
# Get matches
curl http://localhost:3000/api/matching/user/USER_ID \
  -H "Authorization: Bearer TOKEN"

# Create match
curl -X POST http://localhost:3000/api/matching/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userAId":"uuid1","userBId":"uuid2","score":0.85}'
```

---

## 📝 Notes

1. **All dates** are in ISO 8601 format (UTC)
2. **UUIDs** are used for all IDs
3. **Arrays** can be empty `[]` if no data
4. **Optional fields** may be `null` or omitted
5. **Gemini AI** features degrade gracefully if API key not set

---

## 🔗 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [GEMINI_INTEGRATION.md](./GEMINI_INTEGRATION.md) - AI features
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure

---

**Last Updated:** November 2, 2025  
**API Version:** 1.2
