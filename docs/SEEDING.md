# Database Seeding Guide

**Last Updated:** November 2, 2025

---

## Overview

The database seed script (`backend/seed.js`) generates realistic test data for SkillSwap, including:

- **Users** with diverse skills, personalities, and profiles
- **Matches** based on skill compatibility
- **Conversations** for each match
- **AI Embeddings** (if Gemini API is configured)

---

## Quick Start

### Basic Seed (30 users, 1-5 connections each)

```bash
cd backend
npm run seed
```

### Clear & Reseed

```bash
npm run seed:clear
```

### Large Dataset (50 users, 2-8 connections)

```bash
npm run seed:large
```

---

## Custom Configuration

### Command Line Options

```bash
node seed.js [options]
```

**Options:**
- `--users <number>` - Number of users to create (default: 30)
- `--min-connections <number>` - Minimum connections per user (default: 1)
- `--max-connections <number>` - Maximum connections per user (default: 5)
- `--clear` - Clear existing data before seeding

**Examples:**

```bash
# Create 100 users with 3-10 connections each
node seed.js --users 100 --min-connections 3 --max-connections 10 --clear

# Create 20 users with 1-3 connections (small test dataset)
node seed.js --users 20 --min-connections 1 --max-connections 3

# Create 50 users and keep existing data
node seed.js --users 50
```

---

## Generated Data

### Users

Each user has:

- **Basic Info:**
  - Random name (first + last from pool of 30 each)
  - Generated email (`firstname.lastname[number]@domain.com`)
  - AI-generated avatar URL (UI Avatars)
  - Bio based on skills

- **Skills:**
  - 1-5 teaching skills (intermediate/advanced/expert)
  - 1-4 learning skills (beginner/intermediate)
  - Categories: Programming, Music & Arts, Business, Languages, Other
  - 70+ unique skills across all categories

- **Personality:**
  - Type: `introvert` or `extrovert`
  - Daily rhythm: `early_bird` or `night_owl`
  - Spirit animal (15 options)
  - Favorite ice cream (10 flavors)
  - Personal color (10 colors)

- **AI Embeddings:**
  - 768-dimensional vectors generated from bio + skills
  - Used for semantic matching (requires Gemini API)

### Skills Pool

**Programming Languages (25):**
Python, JavaScript, TypeScript, React, Node.js, Django, Flask, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Azure, Git, Machine Learning, Data Science, DevOps, GraphQL, REST API, Vue.js, Angular, Next.js, Express, Redis, Microservices

**Music & Arts (15):**
Guitar, Piano, Photography, Video Editing, Graphic Design, UI/UX Design, Drawing, Painting, Digital Art, Animation, Music Production, Singing, Dancing, Writing, Creative Writing

**Business & Marketing (15):**
Marketing, Sales, Project Management, Leadership, Public Speaking, Negotiation, Business Strategy, Finance, Accounting, Entrepreneurship, Product Management, Agile, Scrum, Analytics, SEO

**Languages (12):**
Spanish, French, German, Mandarin, Japanese, Korean, Italian, Portuguese, Russian, Arabic, Hindi, English

**Other (11):**
Cooking, Baking, Yoga, Fitness, Running, Swimming, Chess, Meditation, Gardening, Woodworking, Knitting

### Matches

The script creates matches between users based on:

1. **Skill Compatibility**
   - User A teaches what User B wants to learn
   - User B teaches what User A wants to learn
   - Category matches (partial score)

2. **Personality Compatibility**
   - Same personality type (+0.2)
   - Same daily rhythm (+0.3)

3. **Match Status**
   - 75% probability of `active` status
   - 25% probability of `pending` status

4. **Mutual Skills**
   - Automatically detected and stored as JSONB
   - Includes teacher/learner info and direction

### Conversations

- Created automatically for each match
- Linked via `match_id`
- Empty by default (no sample messages)
- TalkJS conversation ID: `match-{match_id}`

---

## Output Example

```
🌱 Starting database seed...
📊 Configuration:
   - Users: 30
   - Connections per user: 1-5
   - Clear existing data: true

🗑️  Clearing existing data...
✓ Database cleared

👥 Creating users...
✓ Created user: Emma Smith
✓ Created user: Liam Johnson
✓ Created user: Olivia Williams
...
✓ Created 30 users

📊 Creating matches...
✓ Created match: Emma Smith ↔ Liam Johnson (82%)
✓ Created match: Olivia Williams ↔ Noah Brown (67%)
...
✓ Created 78 matches

📈 Seed Statistics:
   - Total users: 30
   - Total matches: 78
   - Active matches: 59
   - Pending matches: 19

   Connection Distribution:
   - 1 connection: 2 users
   - 2 connections: 5 users
   - 3 connections: 8 users
   - 4 connections: 10 users
   - 5 connections: 5 users

✅ Seed completed successfully!
```

---

## Technical Details

### Matching Algorithm

```javascript
function calculateMatchScore(userA, userB) {
  let score = 0
  
  // Perfect skill match: +1.0
  // Category match: +0.3
  // Personality type match: +0.2
  // Daily rhythm match: +0.3
  
  // Normalized to 0-1 range
  return Math.min(score / maxPossibleScore, 1.0)
}
```

### Connection Distribution

The script ensures:
- Each user gets between `minConnections` and `maxConnections` matches
- Matches are created based on compatibility score (highest first)
- Only mutual skill matches are created
- No duplicate matches

### Performance

- **30 users:** ~5-10 seconds (with AI embeddings)
- **50 users:** ~10-20 seconds
- **100 users:** ~30-60 seconds

*Note: AI embedding generation adds ~100ms per user*

---

## Troubleshooting

### No matches created

**Problem:** All users have 0 connections

**Solution:** Skills don't overlap. The script ensures mutual skills exist before creating matches. Try:
- Increasing user count
- Lowering `minConnections`
- Checking skill pools have variety

### Embedding errors

**Problem:** `Could not generate embedding for User X`

**Solution:** Gemini API issue. Check:
- `GEMINI_API_KEY` in `.env`
- API quota/rate limits
- Network connectivity

The script continues without embeddings if API fails.

### Duplicate key errors

**Problem:** `23505` error during seeding

**Solution:** User emails or matches already exist. Use:
```bash
npm run seed:clear  # Clear before seeding
```

### Slow performance

**Problem:** Seed takes too long

**Solution:**
- Reduce user count
- Disable AI embeddings (comment out `generateEmbedding` calls)
- Check network/database latency

---

## Integration with Application

After seeding:

1. **Login** - Use any generated email (no passwords in seed data - use Supabase auth)
2. **Matches Page** - See all generated matches with AI compatibility scores
3. **Profile Page** - View user skills, personality, and profile customization
4. **Chat** - Start conversations with matched users

---

## Programmatic Usage

```javascript
import { seed, generateUser, createUser, createMatch } from './seed.js'

// Full seed
await seed({
  userCount: 50,
  minConnections: 2,
  maxConnections: 8,
  clearFirst: true
})

// Create single user
const userData = generateUser(0)
const user = await createUser(userData)

// Create match between two users
const match = await createMatch(userA, userB)
```

---

## Best Practices

1. **Development:** Use small datasets (20-30 users)
2. **Testing:** Clear before each seed to ensure consistent state
3. **Demo:** Use large datasets (50-100 users) with high connections
4. **Production:** Never run seed script on production database!

---

## See Also

- [Database Schema](./DATABASE_SCHEMA.md) - Full schema reference
- [Matching Algorithm](./MATCHING_ALGORITHM.md) - How matches are scored
- [Gemini Integration](./GEMINI_INTEGRATION.md) - AI embedding details
- [Setup Guide](./SETUP.md) - Environment configuration
