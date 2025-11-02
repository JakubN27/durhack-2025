# SkillSwap - System Architecture

> Technical deep-dive into how SkillSwap works

---

## 📐 Architecture Overview

SkillSwap follows a **three-tier architecture**:
1. **Presentation Layer** - React frontend
2. **Application Layer** - Express backend
3. **Data Layer** - Supabase (PostgreSQL)

Plus two external services:
- **TalkJS** - Real-time chat
- **Gemini AI** - AI features

---

## 🗄️ Database Schema

### Tables

#### `profiles`
Stores user profile information and skills.

```sql
profiles (
  id UUID PRIMARY KEY,              -- FK to auth.users
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  skills_to_learn JSONB DEFAULT '[]',
  skills_to_teach JSONB DEFAULT '[]',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Skills Structure** (JSONB):
```json
[
  {
    "id": "uuid-here",
    "name": "React",
    "category": "programming",
    "proficiency": "intermediate"
  }
]
```

**Categories**: programming, design, languages, business, creative, academic, sports, music, other

**Proficiency Levels**: beginner, intermediate, advanced, expert

#### `conversations`
Tracks chat conversations between users.

```sql
conversations (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL,           -- FK to profiles
  user2_id UUID NOT NULL,           -- FK to profiles
  talkjs_conversation_id TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT unique_user_pair UNIQUE (user1_id, user2_id)
)
```

**Important**: The `unique_user_pair` constraint ensures only one conversation per user pair.

#### `matches` (Optional)
Stores match information for analytics/caching.

```sql
matches (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,            -- FK to profiles
  matched_user_id UUID NOT NULL,    -- FK to profiles
  match_score INTEGER DEFAULT 0,
  conversation_id UUID,              -- FK to conversations
  created_at TIMESTAMP,
  CONSTRAINT unique_match UNIQUE (user_id, matched_user_id)
)
```

### Indexes
```sql
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_matches_users ON matches(user_id, matched_user_id);
```

### Row Level Security (RLS)

**Profiles**:
- Read: Anyone can view all profiles
- Write: Users can only update their own profile

**Conversations**:
- Read: Users can only see conversations they're part of
- Write: Users can create conversations they're part of

**Matches**:
- Read: Users can see matches where they're involved
- Write: Users can create matches for themselves

---

## 🔄 Data Models & Relationships

### Entity Relationship Diagram
```
┌──────────────┐
│  auth.users  │ (Supabase Auth)
└──────┬───────┘
       │ 1:1
       v
┌──────────────┐
│   profiles   │
└──────┬───────┘
       │
       │ 1:N              ┌───────────────┐
       ├─────────────────>│ conversations │
       │                  └───────────────┘
       │                         ^
       │ 1:N                     │ N:1
       └─────────────────>┌──────┴────┐
                          │  matches  │
                          └───────────┘
```

### Relationships

**User → Profile** (1:1)
- One auth user has exactly one profile
- Created automatically on signup
- Profile ID matches auth user ID

**User → Conversations** (1:N)
- One user can have many conversations
- Each conversation involves exactly 2 users
- Bi-directional relationship

**User → Matches** (1:N)
- One user can have many matches
- Matches are uni-directional (user_id → matched_user_id)
- Match score calculated based on skills

### Data Flow Example: Creating a Match

```
1. User views Matches page
   └─> Frontend calls GET /api/matches

2. Backend queries database:
   └─> Find users teaching user's desired skills
   └─> Find users learning user's teaching skills
   └─> Calculate match scores
   └─> Sort by score

3. User clicks "Chat" on a match
   └─> Frontend calls POST /api/chat/conversation

4. Backend creates conversation:
   └─> Check if conversation exists
   └─> If not, create in conversations table
   └─> Create TalkJS conversation
   └─> Return conversation ID

5. Frontend initializes TalkJS:
   └─> Load TalkJS SDK
   └─> Create session
   └─> Load conversation
   └─> Display chat UI
```

---

## 🔌 API Architecture

### RESTful Endpoints

#### Authentication (`/api/auth`)
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - End session
- `GET /auth/me` - Get current user

#### Profiles (`/api/profile`)
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update profile
- `GET /profile/search?skill=X` - Search by skill

#### Matching (`/api/matching`)
- `GET /matches` - Get compatible matches
- `GET /matches/:id` - Get specific match details
- `POST /matches` - Create match record

#### Chat (`/api/chat`)
- `GET /conversations` - Get all conversations
- `POST /conversation` - Create/get conversation
- `GET /conversation/:id` - Get conversation details

### Request/Response Flow

**Example: Getting Matches**

Request:
```http
GET /api/matches HTTP/1.1
Authorization: Bearer <jwt-token>
```

Backend Processing:
```javascript
1. Extract user ID from JWT
2. Query profiles table:
   - Find skills_to_learn from user profile
   - Find all users with those skills in skills_to_teach
   - Find skills_to_teach from user profile
   - Find all users with those skills in skills_to_learn
3. Calculate match scores for each user
4. Sort by score (highest first)
5. Limit results to top 50
```

Response:
```json
{
  "matches": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "matchScore": 85,
      "mutualSkills": {
        "theyTeach": ["React", "Node.js"],
        "youTeach": ["Python", "Django"]
      },
      "bio": "Full-stack developer..."
    }
  ]
}
```

---

## 🎯 Matching Algorithm

### Core Logic

The matching algorithm finds users based on **reciprocal skill exchange**:

```javascript
function calculateMatchScore(userProfile, otherProfile) {
  let score = 0;
  const maxScore = 100;
  
  // Skills they can teach me (40 points)
  const teachScore = calculateSkillOverlap(
    userProfile.skills_to_learn,
    otherProfile.skills_to_teach
  ) * 40;
  
  // Skills I can teach them (40 points)
  const learnScore = calculateSkillOverlap(
    userProfile.skills_to_teach,
    otherProfile.skills_to_learn
  ) * 40;
  
  // Proficiency compatibility (20 points)
  const proficiencyScore = calculateProficiencyMatch(
    userProfile,
    otherProfile
  ) * 20;
  
  score = teachScore + learnScore + proficiencyScore;
  return Math.min(Math.round(score), maxScore);
}
```

### Skill Overlap Calculation

```javascript
function calculateSkillOverlap(wantedSkills, availableSkills) {
  if (wantedSkills.length === 0) return 0;
  
  let matches = 0;
  for (const wanted of wantedSkills) {
    const hasSkill = availableSkills.some(
      skill => skill.name.toLowerCase() === wanted.name.toLowerCase()
    );
    if (hasSkill) matches++;
  }
  
  return matches / wantedSkills.length;
}
```

### Match Score Interpretation

- **90-100**: Perfect match - Both can teach each other desired skills
- **70-89**: Excellent match - Strong skill alignment
- **50-69**: Good match - Some skill overlap
- **30-49**: Fair match - Limited skill overlap
- **0-29**: Poor match - Minimal alignment

### Sorting & Ranking

Matches are sorted by:
1. **Match Score** (primary) - Highest first
2. **Profile Completeness** (secondary) - Users with bio/more skills ranked higher
3. **Recent Activity** (tertiary) - Recently updated profiles ranked higher

With Gemini AI enabled, additional sorting factors:
- Skill relevance (AI determines if skills are closely related)
- Learning path compatibility
- Complementary skill sets

---

## 💬 Chat Architecture (TalkJS Integration)

### How TalkJS Works

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       │ 1. Request conversation
       v
┌──────────────┐
│   Backend    │
│  (Express)   │
└──────┬───────┘
       │
       │ 2. Create conversation
       │    if doesn't exist
       v
┌──────────────┐       3. Create TalkJS
│   Database   │◄──────   conversation
│  (Supabase)  │       ┌──────────────┐
└──────────────┘       │   TalkJS     │
       │               │     API      │
       │ 4. Return     └──────────────┘
       │    conversation ID
       v
┌─────────────┐        5. Initialize
│   Frontend  │───────>    chat UI
└─────────────┘
```

### Conversation Creation Flow

1. **User clicks "Chat" button**
2. **Frontend sends request** to backend:
   ```javascript
   POST /api/chat/conversation
   {
     "otherUserId": "uuid-of-other-user"
   }
   ```

3. **Backend checks database**:
   ```javascript
   // Check if conversation exists
   const existing = await supabase
     .from('conversations')
     .select('*')
     .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
     .or(`user1_id.eq.${otherUserId},user2_id.eq.${otherUserId}`)
     .single();
   ```

4. **If doesn't exist, create**:
   ```javascript
   // Create conversation record
   const { data: conversation } = await supabase
     .from('conversations')
     .insert({
       user1_id: userId,
       user2_id: otherUserId,
       talkjs_conversation_id: `conv_${userId}_${otherUserId}`
     })
     .single();
   
   // Create TalkJS conversation
   await fetch('https://api.talkjs.com/v1/conversations', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${TALKJS_SECRET_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       id: conversation.talkjs_conversation_id,
       participants: [userId, otherUserId]
     })
   });
   ```

5. **Return conversation ID** to frontend

6. **Frontend initializes TalkJS**:
   ```javascript
   const session = new Talk.Session({
     appId: VITE_TALKJS_APP_ID,
     me: currentUser
   });
   
   const conversation = session.getOrCreateConversation(conversationId);
   conversation.setParticipant(currentUser);
   conversation.setParticipant(otherUser);
   
   const chatbox = session.createChatbox(conversation);
   chatbox.mount(document.getElementById('chat-container'));
   ```

### TalkJS Data Model

**User Object**:
```javascript
{
  id: "user-uuid",
  name: "John Doe",
  email: "john@example.com",
  photoUrl: "https://...",
  role: "default"
}
```

**Conversation Object**:
```javascript
{
  id: "conv_user1_user2",
  participants: {
    "user1-uuid": { access: "ReadWrite" },
    "user2-uuid": { access: "ReadWrite" }
  },
  subject: "Chat with John Doe",
  photoUrl: "https://...",
  welcomeMessages: []
}
```

### Message Persistence

- Messages are stored in TalkJS servers
- Not duplicated in our database
- Accessible through TalkJS API if needed
- Retained according to TalkJS plan

---

## 🤖 AI Integration (Gemini)

### Features Powered by Gemini

1. **Skill Extraction**
   - Input: Free text description
   - Output: Structured skill objects

2. **Learning Plan Generation**
   - Input: Skill name + user level
   - Output: Step-by-step learning plan

3. **Match Optimization**
   - Input: User profile + potential matches
   - Output: Re-ranked matches with relevance scores

### API Usage

**Skill Extraction**:
```javascript
const extractSkills = async (text) => {
  const prompt = `
    Extract skills from this text and categorize them:
    "${text}"
    
    Return as JSON array with format:
    [{"name": "skill", "category": "programming|design|..."}]
  `;
  
  const response = await gemini.generateContent(prompt);
  return JSON.parse(response.text());
};
```

**Learning Plan Generation**:
```javascript
const generateLearningPlan = async (skill, level) => {
  const prompt = `
    Create a learning plan for "${skill}" at ${level} level.
    Include:
    1. Foundational concepts
    2. Key resources
    3. Practice projects
    4. Estimated timeline
  `;
  
  const response = await gemini.generateContent(prompt);
  return response.text();
};
```

### Rate Limiting & Costs

- **Gemini Free Tier**: 60 requests/minute
- **Cost**: Free for moderate usage
- **Fallback**: If API fails, features gracefully degrade
- **Caching**: Results cached to minimize API calls

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User submits credentials
   └─> POST /api/auth/login

2. Backend validates with Supabase
   └─> Supabase.auth.signInWithPassword()

3. Supabase returns JWT
   └─> Contains user ID, expiry, etc.

4. Frontend stores JWT
   └─> In memory (not localStorage for security)

5. Subsequent requests include JWT
   └─> Authorization: Bearer <token>

6. Backend validates JWT
   └─> Extracts user ID
   └─> Proceeds with request
```

### Row Level Security (RLS)

RLS ensures users can only access authorized data:

```sql
-- Example: Profiles policy
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Benefits**:
- Protection at database level
- Even if backend is compromised, data is safe
- SQL injection protection
- Automatic enforcement

### API Security

**Request Validation**:
```javascript
// Every protected route
const validateRequest = async (req, res, next) => {
  try {
    // Extract JWT from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Validate with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error) return res.status(401).json({ error: 'Unauthorized' });
    
    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**CORS Configuration**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**Input Sanitization**:
- All inputs validated on backend
- SQL injection prevented by Supabase client
- XSS prevented by React's escaping
- CSRF tokens for state-changing operations

---

## 🚀 Performance Optimizations

### Frontend

**Code Splitting**:
```javascript
// Lazy load pages
const Matches = lazy(() => import('./pages/Matches'));
const Chat = lazy(() => import('./pages/Chat'));
```

**Memoization**:
```javascript
// Prevent unnecessary re-renders
const MemoizedMatchCard = memo(MatchCard);

// Memoize expensive calculations
const sortedMatches = useMemo(
  () => matches.sort((a, b) => b.matchScore - a.matchScore),
  [matches]
);
```

**Optimistic Updates**:
```javascript
// Update UI before server confirms
const updateProfile = async (data) => {
  setProfile(data); // Update immediately
  try {
    await api.put('/profile', data);
  } catch (err) {
    setProfile(oldProfile); // Rollback on error
  }
};
```

### Backend

**Database Indexes**:
- Indexes on frequently queried columns
- Composite indexes for common joins
- Partial indexes for filtered queries

**Query Optimization**:
```javascript
// Efficient match query
const matches = await supabase
  .from('profiles')
  .select('id, name, email, skills_to_teach, skills_to_learn, bio')
  .neq('id', userId)
  .limit(50); // Limit results
```

**Caching**:
- Profile data cached for 5 minutes
- Match scores cached per user
- AI responses cached indefinitely

### Database

**Connection Pooling**:
- Supabase handles automatically
- Optimal pool size based on plan

**Query Planning**:
- EXPLAIN ANALYZE for slow queries
- Optimize based on execution plan
- Add indexes where needed

---

## 📊 Monitoring & Logging

### Application Logging

**Backend**:
```javascript
// Structured logging
logger.info('User login', { userId, timestamp });
logger.error('Database error', { error, query, userId });
logger.warn('High match score', { userId, matchScore });
```

**Frontend**:
```javascript
// Error tracking
console.error('Failed to load matches:', error);

// Performance tracking
console.time('loadMatches');
await loadMatches();
console.timeEnd('loadMatches');
```

### Metrics to Monitor

**Application**:
- API response times
- Error rates by endpoint
- Active users count
- Match success rate

**Database**:
- Query execution time
- Connection pool usage
- Table sizes
- Index usage

**External Services**:
- TalkJS message volume
- Gemini API usage
- API error rates

---

## 🔄 State Management

### Frontend State

**Global State** (Context):
- Current user profile
- Authentication status
- Theme preferences

**Local State** (useState):
- Form inputs
- UI toggles
- Loading states

**Server State** (React Query pattern):
- Matches data
- Conversations list
- Profile data

### State Flow Example

```javascript
// 1. Component mounts
useEffect(() => {
  loadMatches();
}, []);

// 2. Fetch from API
const loadMatches = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/matches');
    const data = await res.json();
    setMatches(data.matches);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// 3. Render based on state
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
return <MatchList matches={matches} />;
```

---

## 🧪 Testing Strategy

### Unit Tests
- Individual functions
- Component logic
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- External service integration

### End-to-End Tests
- User flows
- Critical paths
- Cross-browser compatibility

---

## 📈 Scalability Considerations

### Current Limits
- ~1000 concurrent users (estimated)
- 50 matches per request
- 100 messages/second (TalkJS limit)

### Scaling Strategies

**Horizontal Scaling**:
- Multiple backend instances
- Load balancer in front
- Stateless design enables easy scaling

**Database Scaling**:
- Read replicas for queries
- Connection pooling
- Query optimization

**Caching**:
- Redis for session data
- CDN for static assets
- API response caching

---

**Architecture Version**: 1.0.0  
**Last Updated**: November 2025  
**Complexity**: Intermediate
