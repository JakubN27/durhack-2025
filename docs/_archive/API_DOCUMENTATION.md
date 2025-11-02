# SkillSwap API Documentation

Base URL: `http://localhost:3001`

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Skills](#skills)
- [Matching](#matching)
- [Sessions](#sessions)
- [Messages](#messages)
- [Achievements](#achievements)
- [AI](#ai)
- [Embeddings](#embeddings)

---

## Authentication

### Sign Up
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "bio": "Software engineer passionate about teaching Python and learning guitar"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

### Sign In
```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "session": { ... }
}
```

### Sign Out
```http
POST /api/auth/signout
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully signed out"
}
```

### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "refresh-token"
}
```

---

## Users

### Get User Profile
```http
GET /api/users/:userId
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "bio": "Software engineer...",
    "teach_skills": [
      {
        "name": "Python",
        "proficiency": "advanced",
        "category": "technical"
      }
    ],
    "learn_skills": [
      {
        "name": "Guitar",
        "proficiency": "beginner",
        "category": "creative"
      }
    ],
    "embeddings": [0.123, ...],
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/:userId
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Updated bio...",
  "teach_skills": [...],
  "learn_skills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### Delete User
```http
DELETE /api/users/:userId
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get All Users
```http
GET /api/users
```

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "users": [...],
  "count": 25,
  "total": 100
}
```

---

## Skills

### Extract Skills from Bio
```http
POST /api/skills/extract
```

**Request Body:**
```json
{
  "bio": "I'm a software engineer with 5 years of Python experience. I want to learn guitar and Japanese.",
  "userId": "uuid" // optional
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
      },
      {
        "name": "Software Engineering",
        "proficiency": "advanced",
        "category": "technical"
      }
    ],
    "learn_skills": [
      {
        "name": "Guitar",
        "proficiency": "beginner",
        "category": "creative"
      },
      {
        "name": "Japanese",
        "proficiency": "beginner",
        "category": "language"
      }
    ]
  },
  "embedding_dimension": 1536
}
```

### Update Skills Manually
```http
POST /api/skills/update
```

**Request Body:**
```json
{
  "userId": "uuid",
  "teachSkills": [...],
  "learnSkills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## Matching

### Find Matches for User
```http
GET /api/matching/find/:userId
```

**Query Parameters:**
- `limit` (optional): Max matches to return (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "matches": [
    {
      "user_id": "uuid",
      "user_name": "Jane Smith",
      "user_bio": "...",
      "teach_skills": [...],
      "learn_skills": [...],
      "score_a_to_b": 0.85,
      "score_b_to_a": 0.78,
      "reciprocal_score": 0.815,
      "mutual_skills": [
        {
          "skill": "Python",
          "teacher": "John Doe",
          "learner": "Jane Smith",
          "direction": "A→B"
        }
      ]
    }
  ]
}
```

### Create a Match
```http
POST /api/matching/create
```

**Request Body:**
```json
{
  "userAId": "uuid",
  "userBId": "uuid",
  "score": 0.85,
  "mutualSkills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "match": {
    "id": "uuid",
    "user_a_id": "uuid",
    "user_b_id": "uuid",
    "score": 0.85,
    "mutual_skills": [...],
    "status": "pending",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### Get User's Matches
```http
GET /api/matching/user/:userId
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "matches": [...]
}
```

### Get Specific Match
```http
GET /api/matching/:matchId
```

**Response:**
```json
{
  "success": true,
  "match": {
    "id": "uuid",
    "user_a": { ... },
    "user_b": { ... },
    "score": 0.85,
    "mutual_skills": [...],
    "status": "active"
  }
}
```

### Update Match Status
```http
PATCH /api/matching/:matchId/status
```

**Request Body:**
```json
{
  "status": "active" // pending, active, or completed
}
```

**Response:**
```json
{
  "success": true,
  "match": { ... }
}
```

### Delete Match
```http
DELETE /api/matching/:matchId
```

---

## Sessions

### Create Session
```http
POST /api/sessions
```

**Request Body:**
```json
{
  "matchId": "uuid",
  "date": "2025-01-15T14:00:00Z",
  "notes": "Covered Python basics",
  "progress": {
    "topics_covered": ["variables", "functions"],
    "exercises_completed": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "match_id": "uuid",
    "date": "2025-01-15T14:00:00Z",
    "notes": "...",
    "progress": { ... },
    "ai_summary": null,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### Get Sessions for Match
```http
GET /api/sessions/match/:matchId
```

**Response:**
```json
{
  "success": true,
  "sessions": [...],
  "count": 5
}
```

### Get Session by ID
```http
GET /api/sessions/:sessionId
```

### Update Session
```http
PUT /api/sessions/:sessionId
```

**Request Body:**
```json
{
  "notes": "Updated notes",
  "progress": { ... },
  "ai_summary": "AI-generated summary"
}
```

### Delete Session
```http
DELETE /api/sessions/:sessionId
```

### Get User's Sessions
```http
GET /api/sessions/user/:userId
```

**Response:**
```json
{
  "success": true,
  "sessions": [...],
  "count": 12
}
```

---

## Messages

### Send Message
```http
POST /api/messages
```

**Request Body:**
```json
{
  "matchId": "uuid",
  "senderId": "uuid",
  "content": "Hey! Ready for our session tomorrow?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "match_id": "uuid",
    "sender_id": "uuid",
    "content": "...",
    "read": false,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### Get Messages for Match
```http
GET /api/messages/match/:matchId
```

**Query Parameters:**
- `limit` (optional): Max messages (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "content": "...",
      "sender": {
        "id": "uuid",
        "name": "John Doe"
      },
      "read": false,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 15
}
```

### Mark Message as Read
```http
PATCH /api/messages/:messageId/read
```

**Response:**
```json
{
  "success": true,
  "message": { ... }
}
```

### Mark All Messages as Read
```http
PATCH /api/messages/match/:matchId/read-all
```

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "updated_count": 5
}
```

### Get Unread Message Count
```http
GET /api/messages/unread/:userId
```

**Response:**
```json
{
  "success": true,
  "unread_count": 12,
  "by_match": {
    "match-uuid-1": 5,
    "match-uuid-2": 7
  }
}
```

### Delete Message
```http
DELETE /api/messages/:messageId
```

---

## Achievements

### Create Achievement
```http
POST /api/achievements
```

**Request Body:**
```json
{
  "userId": "uuid",
  "badgeName": "First Session",
  "points": 50,
  "description": "Completed your first learning session"
}
```

**Response:**
```json
{
  "success": true,
  "achievement": {
    "id": "uuid",
    "user_id": "uuid",
    "badge_name": "First Session",
    "points": 50,
    "description": "...",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### Get User's Achievements
```http
GET /api/achievements/user/:userId
```

**Response:**
```json
{
  "success": true,
  "achievements": [...],
  "count": 5,
  "total_points": 250
}
```

### Get Leaderboard
```http
GET /api/achievements/leaderboard
```

**Query Parameters:**
- `limit` (optional): Number of users (default: 10)

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "user_id": "uuid",
      "name": "John Doe",
      "total_points": 500,
      "badges_count": 10
    }
  ],
  "count": 10
}
```

### Award Predefined Achievement
```http
POST /api/achievements/award
```

**Request Body:**
```json
{
  "userId": "uuid",
  "achievementType": "first_match" // first_profile, first_match, first_session, five_sessions, teacher, legacy_builder, helpful
}
```

**Response:**
```json
{
  "success": true,
  "achievement": { ... }
}
```

**Available Achievement Types:**
- `first_profile`: Profile Creator (10 points)
- `first_match`: Connected (25 points)
- `first_session`: Learner (50 points)
- `five_sessions`: Dedicated (100 points)
- `teacher`: Teacher (75 points)
- `legacy_builder`: Legacy Builder (150 points)
- `helpful`: Helpful (50 points)

### Delete Achievement
```http
DELETE /api/achievements/:achievementId
```

---

## AI

### Generate Learning Plan
```http
POST /api/ai/learning-plan
```

**Request Body:**
```json
{
  "teacherSkills": [
    {
      "name": "Python",
      "proficiency": "advanced",
      "category": "technical"
    }
  ],
  "learnerGoals": [
    {
      "name": "Python",
      "proficiency": "beginner",
      "category": "technical"
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
      "title": "Introduction to Python",
      "topics": ["Variables", "Data types"],
      "exercises": ["Hello World", "Calculator"],
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
  "sessionNotes": "Covered variables, functions, and loops. Student completed 3 exercises.",
  "participantEngagement": "high" // low, medium, high
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "summary": "Comprehensive session covering Python fundamentals",
    "achievements": [
      "Mastered variable declarations",
      "Completed all exercises"
    ],
    "improvements": [
      "Practice more complex loops"
    ],
    "motivation": "Great progress! Keep it up!",
    "next_steps": [
      "Review list comprehensions",
      "Practice writing functions"
    ]
  }
}
```

### Generate Motivational Nudge
```http
POST /api/ai/nudge
```

**Request Body:**
```json
{
  "context": "low_engagement", // low_engagement, missed_session, milestone, stagnant, consistent
  "userProgress": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "nudge": "Don't give up! Every expert was once a beginner.",
  "context": "low_engagement"
}
```

---

## Embeddings

### Generate Embeddings
```http
POST /api/embeddings/generate
```

**Request Body:**
```json
{
  "text": "I'm a software engineer passionate about Python and machine learning"
}
```

**Response:**
```json
{
  "success": true,
  "embedding": [0.123, 0.456, ...],
  "dimension": 1536
}
```

---

## Health Check

### Check API Status
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "SkillSwap API is running",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `500`: Internal Server Error

---

## Notes

1. **Authentication**: Most endpoints require authentication via Bearer token in the Authorization header
2. **Pagination**: Use `limit` and `offset` query parameters for paginated endpoints
3. **Embeddings**: The API uses Gemini's embedding model with 768 dimensions (check actual dimension based on model)
4. **Real-time**: For real-time chat, consider using Supabase's real-time subscriptions on the frontend
5. **Rate Limiting**: Consider implementing rate limiting for production use
6. **CORS**: CORS is enabled for all origins in development

---

## Example Integration

```javascript
// Frontend example
const API_BASE_URL = 'http://localhost:3001/api'

// Sign up
const signup = async (email, password, name, bio) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, bio })
  })
  return response.json()
}

// Get matches
const getMatches = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/matching/find/${userId}?limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}

// Send message
const sendMessage = async (matchId, senderId, content, token) => {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ matchId, senderId, content })
  })
  return response.json()
}
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0
