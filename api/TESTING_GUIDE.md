# Backend Testing Guide

This guide covers how to test all SkillSwap backend endpoints.

## Prerequisites

1. **Environment Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Fill in your Supabase and Gemini API keys in .env
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:3001/health
   ```

## Testing Tools

### Option 1: cURL (Command Line)
```bash
# All examples below use cURL
```

### Option 2: Postman/Insomnia
Import the endpoints from `API_DOCUMENTATION.md`

### Option 3: VS Code REST Client
Create a `.http` file and use the REST Client extension

---

## Test Flow

### 1. Authentication Flow

#### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "bio": "I am a software engineer with 5 years of Python experience. I want to learn guitar and Japanese."
  }'
```

**Save the `access_token` from the response for subsequent requests.**

#### Sign In
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get Current User
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2. User Management

#### Get All Users
```bash
curl "http://localhost:3001/api/users?limit=10&offset=0"
```

#### Get User Profile
```bash
curl http://localhost:3001/api/users/USER_ID
```

#### Update User Profile
```bash
curl -X PUT http://localhost:3001/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "bio": "Updated bio text"
  }'
```

#### Get User Stats
```bash
curl http://localhost:3001/api/users/USER_ID/stats
```

---

### 3. Skill Extraction

#### Extract Skills from Bio
```bash
curl -X POST http://localhost:3001/api/skills/extract \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I am a software engineer with 5 years of Python experience. I want to learn guitar and Japanese.",
    "userId": "USER_ID"
  }'
```

This will:
1. Use Gemini AI to extract skills
2. Generate embeddings for the bio
3. Update the user profile with extracted skills
4. Return the extracted skills and embedding dimension

#### Update Skills Manually
```bash
curl -X POST http://localhost:3001/api/skills/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "teachSkills": [
      {"name": "Python", "proficiency": "advanced", "category": "technical"}
    ],
    "learnSkills": [
      {"name": "Guitar", "proficiency": "beginner", "category": "creative"}
    ]
  }'
```

---

### 4. Matching

#### Find Matches for User
```bash
curl "http://localhost:3001/api/matching/find/USER_ID?limit=10"
```

This returns:
- Reciprocal matching scores
- Mutual skills
- Match quality indicators

#### Create a Match
```bash
curl -X POST http://localhost:3001/api/matching/create \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "USER_A_ID",
    "userBId": "USER_B_ID",
    "score": 0.85,
    "mutualSkills": [
      {
        "skill": "Python",
        "teacher": "User A",
        "learner": "User B",
        "direction": "A→B"
      }
    ]
  }'
```

#### Get User's Matches
```bash
curl http://localhost:3001/api/matching/user/USER_ID
```

#### Update Match Status
```bash
curl -X PATCH http://localhost:3001/api/matching/MATCH_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

**Valid statuses:** `pending`, `active`, `completed`

---

### 5. Sessions

#### Create a Session
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "MATCH_ID",
    "date": "2025-01-15T14:00:00Z",
    "notes": "Covered Python basics - variables, functions, loops",
    "progress": {
      "topics_covered": ["variables", "functions", "loops"],
      "exercises_completed": 3,
      "engagement": "high"
    }
  }'
```

#### Get Sessions for a Match
```bash
curl http://localhost:3001/api/sessions/match/MATCH_ID
```

#### Get Session by ID
```bash
curl http://localhost:3001/api/sessions/SESSION_ID
```

#### Update Session
```bash
curl -X PUT http://localhost:3001/api/sessions/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated session notes",
    "progress": {
      "topics_covered": ["variables", "functions"],
      "exercises_completed": 5
    }
  }'
```

#### Get User's Sessions
```bash
curl http://localhost:3001/api/sessions/user/USER_ID
```

---

### 6. Messages

#### Send a Message
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "MATCH_ID",
    "senderId": "USER_ID",
    "content": "Hey! Ready for our session tomorrow?"
  }'
```

#### Get Messages for a Match
```bash
curl "http://localhost:3001/api/messages/match/MATCH_ID?limit=50&offset=0"
```

#### Mark Message as Read
```bash
curl -X PATCH http://localhost:3001/api/messages/MESSAGE_ID/read
```

#### Mark All Messages as Read
```bash
curl -X PATCH http://localhost:3001/api/messages/match/MATCH_ID/read-all \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID"
  }'
```

#### Get Unread Message Count
```bash
curl http://localhost:3001/api/messages/unread/USER_ID
```

---

### 7. Achievements

#### Create Achievement
```bash
curl -X POST http://localhost:3001/api/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "badgeName": "First Session",
    "points": 50,
    "description": "Completed your first learning session"
  }'
```

#### Award Predefined Achievement
```bash
curl -X POST http://localhost:3001/api/achievements/award \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "achievementType": "first_match"
  }'
```

**Available achievement types:**
- `first_profile` (10 points)
- `first_match` (25 points)
- `first_session` (50 points)
- `five_sessions` (100 points)
- `teacher` (75 points)
- `legacy_builder` (150 points)
- `helpful` (50 points)

#### Get User's Achievements
```bash
curl http://localhost:3001/api/achievements/user/USER_ID
```

#### Get Leaderboard
```bash
curl "http://localhost:3001/api/achievements/leaderboard?limit=10"
```

---

### 8. AI Features

#### Generate Learning Plan
```bash
curl -X POST http://localhost:3001/api/ai/learning-plan \
  -H "Content-Type: application/json" \
  -d '{
    "teacherSkills": [
      {"name": "Python", "proficiency": "advanced", "category": "technical"}
    ],
    "learnerGoals": [
      {"name": "Python", "proficiency": "beginner", "category": "technical"}
    ],
    "sessionCount": 6
  }'
```

#### Generate Session Summary
```bash
curl -X POST http://localhost:3001/api/ai/session-summary \
  -H "Content-Type: application/json" \
  -d '{
    "sessionNotes": "Covered variables, functions, and loops. Student completed 3 exercises successfully.",
    "participantEngagement": "high"
  }'
```

#### Generate Motivational Nudge
```bash
curl -X POST http://localhost:3001/api/ai/nudge \
  -H "Content-Type: application/json" \
  -d '{
    "context": "low_engagement",
    "userProgress": {}
  }'
```

---

### 9. Embeddings

#### Generate Embeddings
```bash
curl -X POST http://localhost:3001/api/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am a software engineer passionate about Python and machine learning"
  }'
```

---

## Complete Test Scenario

Here's a complete end-to-end test scenario:

```bash
# 1. Create two users
USER_A=$(curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice",
    "bio": "Python expert with 10 years experience. Want to learn guitar."
  }' | jq -r '.user.id')

USER_B=$(curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "password123",
    "name": "Bob",
    "bio": "Professional guitarist for 15 years. Want to learn Python programming."
  }' | jq -r '.user.id')

# 2. Extract skills for both users
curl -X POST http://localhost:3001/api/skills/extract \
  -H "Content-Type: application/json" \
  -d "{\"bio\": \"Python expert with 10 years experience. Want to learn guitar.\", \"userId\": \"$USER_A\"}"

curl -X POST http://localhost:3001/api/skills/extract \
  -H "Content-Type: application/json" \
  -d "{\"bio\": \"Professional guitarist for 15 years. Want to learn Python programming.\", \"userId\": \"$USER_B\"}"

# 3. Find matches for Alice
curl "http://localhost:3001/api/matching/find/$USER_A?limit=5"

# 4. Create a match
MATCH=$(curl -X POST http://localhost:3001/api/matching/create \
  -H "Content-Type: application/json" \
  -d "{
    \"userAId\": \"$USER_A\",
    \"userBId\": \"$USER_B\",
    \"score\": 0.95,
    \"mutualSkills\": [
      {\"skill\": \"Python\", \"teacher\": \"Alice\", \"learner\": \"Bob\", \"direction\": \"A→B\"},
      {\"skill\": \"Guitar\", \"teacher\": \"Bob\", \"learner\": \"Alice\", \"direction\": \"B→A\"}
    ]
  }" | jq -r '.match.id')

# 5. Update match status to active
curl -X PATCH "http://localhost:3001/api/matching/$MATCH/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# 6. Generate learning plan
curl -X POST http://localhost:3001/api/ai/learning-plan \
  -H "Content-Type: application/json" \
  -d '{
    "teacherSkills": [{"name": "Python", "proficiency": "advanced", "category": "technical"}],
    "learnerGoals": [{"name": "Python", "proficiency": "beginner", "category": "technical"}],
    "sessionCount": 6
  }'

# 7. Create a session
SESSION=$(curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d "{
    \"matchId\": \"$MATCH\",
    \"date\": \"2025-01-15T14:00:00Z\",
    \"notes\": \"First Python session - covered variables and functions\",
    \"progress\": {\"topics\": [\"variables\", \"functions\"], \"completed\": 3}
  }" | jq -r '.session.id')

# 8. Generate AI summary for the session
SUMMARY=$(curl -X POST http://localhost:3001/api/ai/session-summary \
  -H "Content-Type: application/json" \
  -d '{
    "sessionNotes": "First Python session - covered variables and functions. Student completed 3 exercises.",
    "participantEngagement": "high"
  }' | jq -r '.summary')

# 9. Update session with AI summary
curl -X PUT "http://localhost:3001/api/sessions/$SESSION" \
  -H "Content-Type: application/json" \
  -d "{\"ai_summary\": \"$SUMMARY\"}"

# 10. Award achievements
curl -X POST http://localhost:3001/api/achievements/award \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_A\", \"achievementType\": \"first_match\"}"

curl -X POST http://localhost:3001/api/achievements/award \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_B\", \"achievementType\": \"first_session\"}"

# 11. Send messages
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d "{\"matchId\": \"$MATCH\", \"senderId\": \"$USER_A\", \"content\": \"Great session today!\"}"

curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d "{\"matchId\": \"$MATCH\", \"senderId\": \"$USER_B\", \"content\": \"Thanks! Looking forward to the next one.\"}"

# 12. Get chat history
curl "http://localhost:3001/api/messages/match/$MATCH"

# 13. Get user stats
curl "http://localhost:3001/api/users/$USER_A/stats"

# 14. Get leaderboard
curl "http://localhost:3001/api/achievements/leaderboard?limit=10"
```

---

## Expected Responses

### Successful Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

---

## Testing Checklist

- [ ] Health check works
- [ ] User signup and signin work
- [ ] Skill extraction works with Gemini AI
- [ ] Embeddings generation works
- [ ] Matching algorithm returns reciprocal matches
- [ ] Sessions can be created and updated
- [ ] Messages can be sent and retrieved
- [ ] Achievements can be awarded
- [ ] AI learning plan generation works
- [ ] AI session summary generation works
- [ ] Leaderboard displays correctly
- [ ] All CRUD operations work for each entity
- [ ] Error handling returns appropriate messages
- [ ] Pagination works for list endpoints

---

## Common Issues

### 1. Missing Environment Variables
**Error:** `Missing Supabase environment variables` or `Missing GEMINI_API_KEY`

**Solution:** Ensure `.env` file exists and contains:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
PORT=3001
```

### 2. Supabase RLS Issues
**Error:** `new row violates row-level security policy`

**Solution:** Backend uses service key which bypasses RLS. Make sure you're using `SUPABASE_SERVICE_KEY` not `SUPABASE_ANON_KEY`.

### 3. Gemini API Rate Limits
**Error:** `429 Too Many Requests`

**Solution:** Implement rate limiting or request throttling for AI endpoints.

### 4. Invalid UUID
**Error:** `invalid input syntax for type uuid`

**Solution:** Ensure you're passing valid UUIDs from the database, not placeholder strings.

---

## Performance Testing

Test with multiple users and concurrent requests:

```bash
# Install Apache Bench
brew install httpd  # macOS

# Test health endpoint
ab -n 1000 -c 10 http://localhost:3001/health

# Test user profile endpoint
ab -n 100 -c 5 http://localhost:3001/api/users/USER_ID
```

---

## Next Steps

1. **Integration Testing**: Test with frontend
2. **E2E Testing**: Full user journey from signup to session completion
3. **Load Testing**: Test with realistic user loads
4. **Security Testing**: Test authentication and authorization
5. **Error Handling**: Test edge cases and error scenarios

---

**Last Updated**: January 2025
