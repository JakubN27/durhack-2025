# Database Schema Reference

**Last Updated:** November 2, 2025

---

## Overview

SkillSwap uses **Supabase (PostgreSQL)** with the following extensions:
- `uuid-ossp` - UUID generation
- `pgvector` - Vector embeddings for AI matching

---

## Tables

### `users`

Stores user profiles, skills, and personality data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  
  -- Skills (JSONB arrays)
  teach_skills JSONB DEFAULT '[]'::jsonb,
  learn_skills JSONB DEFAULT '[]'::jsonb,
  
  -- AI Embeddings
  embeddings vector(768),
  
  -- Personality & Preferences
  personality_type TEXT CHECK (personality_type IN ('introvert', 'extrovert')),
  daily_rhythm TEXT CHECK (daily_rhythm IN ('early_bird', 'night_owl')),
  spirit_animal TEXT,
  favorite_ice_cream TEXT,
  personal_color TEXT,
  
  -- Legacy personality traits (optional)
  personality_traits JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_embeddings ON users USING ivfflat (embeddings vector_cosine_ops);
```

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "bio": "Passionate Python developer",
  "avatar_url": "https://supabase.../avatars/uuid.jpg",
  "teach_skills": [
    {"name": "Python", "proficiency": "advanced", "category": "Programming Languages"}
  ],
  "learn_skills": [
    {"name": "Japanese", "proficiency": "beginner", "category": "Language"}
  ],
  "embeddings": [0.123, 0.456, ...], // 768-dim vector
  "personality_type": "introvert",
  "daily_rhythm": "early_bird",
  "spirit_animal": "Owl",
  "favorite_ice_cream": "Vanilla",
  "created_at": "2025-11-01T12:00:00Z"
}
```

---

### `matches`

Stores skill exchange pairs between users.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Matching scores
  score FLOAT DEFAULT 0,
  mutual_skills JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  
  -- Chat
  chat_enabled BOOLEAN DEFAULT true,
  conversation_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id != user_b_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_matches_user_a ON matches(user_a_id);
CREATE INDEX idx_matches_user_b ON matches(user_b_id);
CREATE INDEX idx_matches_status ON matches(status);
```

**Example Row:**
```json
{
  "id": "match-uuid",
  "user_a_id": "uuid-1",
  "user_b_id": "uuid-2",
  "score": 0.87,
  "mutual_skills": [
    {
      "skill": "Python",
      "direction": "you_teach",
      "teacher": "Jane",
      "learner": "John"
    }
  ],
  "status": "active",
  "chat_enabled": true,
  "conversation_id": "match-uuid-1-uuid-2",
  "created_at": "2025-11-01T12:00:00Z",
  "last_message_at": "2025-11-02T10:00:00Z"
}
```

---

### `conversations`

Links matches to TalkJS conversations.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  talkjs_conversation_id TEXT UNIQUE,
  participants UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_conversations_match ON conversations(match_id);
CREATE INDEX idx_conversations_talkjs ON conversations(talkjs_conversation_id);
```

---

### `messages` (Optional - TalkJS handles this)

If storing messages locally (TalkJS already handles this):

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Storage Buckets

### `avatars`

Stores user profile pictures.

**Configuration:**
```javascript
{
  public: true,
  fileSizeLimit: 2097152, // 2MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}
```

**Policies:**
```sql
-- Anyone can view avatars
CREATE POLICY "Public avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**File Structure:**
```
avatars/
  ├── {user_id}/
  │   └── avatar.jpg
  ├── {user_id_2}/
  │   └── avatar.png
  ...
```

---

## Relationships

```
users (1) ←→ (N) matches.user_a_id
users (1) ←→ (N) matches.user_b_id
matches (1) ←→ (1) conversations
conversations (1) ←→ (N) messages
```

**Diagram:**
```
┌─────────┐
│  users  │
└────┬────┘
     │
     ├──→ matches.user_a_id (FK)
     │
     └──→ matches.user_b_id (FK)
          │
          └──→ conversations.match_id (FK)
               │
               └──→ messages.conversation_id (FK)
```

---

## Data Types

### Skills (JSONB)
```json
[
  {
    "name": "Python",
    "proficiency": "advanced" | "intermediate" | "beginner" | "expert",
    "category": "Programming Languages" | "Web Development" | ...
  }
]
```

### Mutual Skills (JSONB)
```json
[
  {
    "skill": "Python",
    "direction": "you_teach" | "they_teach",
    "teacher": "Name",
    "learner": "Name",
    "teacherId": "uuid",
    "learnerId": "uuid"
  }
]
```

### Embeddings (vector)
- Dimension: 768 (from Gemini embedding-001 model)
- Used for semantic similarity matching
- Generated from user bio + skills

---

## Migrations

All migrations are in `/supabase/migrations/`

**Key migrations:**
1. `20251101000000_initial_schema.sql` - Initial tables
2. `20251101000001_add_personality_fields.sql` - Personality traits
3. `20251101120000_comprehensive_profile_schema.sql` - Profile fields
4. `20251101000002_add_avatar_storage.sql` - Avatar storage

**Apply migrations:**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
-- Copy and paste migration SQL
```

---

## Queries

### Get User with Skills
```sql
SELECT * FROM users WHERE id = 'uuid';
```

### Find Potential Matches
```sql
SELECT u.*
FROM users u
WHERE u.id != 'current_user_id'
  AND (
    -- Has skills I want to learn
    u.teach_skills @> '[{"name": "Python"}]'::jsonb
    OR
    -- Wants to learn skills I teach
    u.learn_skills @> '[{"name": "Japanese"}]'::jsonb
  );
```

### Get User's Matches
```sql
SELECT m.*, 
       ua.name as user_a_name,
       ub.name as user_b_name
FROM matches m
JOIN users ua ON m.user_a_id = ua.id
JOIN users ub ON m.user_b_id = ub.id
WHERE m.user_a_id = 'uuid' OR m.user_b_id = 'uuid'
ORDER BY m.created_at DESC;
```

### Vector Similarity Search
```sql
SELECT u.*, 
       1 - (u.embeddings <=> target_embedding) as similarity
FROM users u
WHERE u.id != 'current_user_id'
ORDER BY u.embeddings <=> target_embedding
LIMIT 10;
```

---

## Row Level Security (RLS)

### Users Table
```sql
-- Users can read all profiles
CREATE POLICY "Public profiles" ON users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Matches Table
```sql
-- Users can see matches they're part of
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

-- Users can create matches
CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );
```

---

## Performance Tips

1. **Indexes are critical** - All FK columns are indexed
2. **Use JSONB queries carefully** - Can be slow on large datasets
3. **Vector search** - Use `ivfflat` index for fast similarity search
4. **Pagination** - Always use LIMIT/OFFSET for large result sets
5. **Connection pooling** - Use Supabase connection pooler in production

---

## Backup & Recovery

Supabase handles automatic backups. Manual backup:

```bash
# Export schema
pg_dump -U postgres -h db.xxx.supabase.co -s > schema.sql

# Export data
pg_dump -U postgres -h db.xxx.supabase.co -a > data.sql
```

---

## Related Documentation

- [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [SETUP.md](./SETUP.md) - Database setup instructions

---

**Schema Version:** 1.2  
**Last Updated:** November 2, 2025
