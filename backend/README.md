# SkillSwap Backend

Backend API for SkillSwap - AI-powered peer-to-peer learning platform.

---

## Quick Start

```bash
# Install dependencies (from root)
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Seed database with test data
npm run seed
```

---

## Available Scripts

### Development

```bash
npm start        # Start server (production mode)
npm run dev      # Start server with auto-reload (development)
```

### Database Seeding

```bash
npm run seed              # Create 30 users with 1-5 connections each
npm run seed:clear        # Clear database and create fresh data
npm run seed:large        # Create 50 users with 2-8 connections (demo mode)
```

### Custom Seeding

```bash
# Create 100 users with 3-10 connections
node seed.js --users 100 --min-connections 3 --max-connections 10 --clear

# Create 20 users, keep existing data
node seed.js --users 20 --min-connections 1 --max-connections 3
```

See [docs/SEEDING.md](../docs/SEEDING.md) for detailed seed script documentation.

---

## Environment Variables

Required variables in `.env`:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_key

# Server
PORT=3000
```

---

## API Endpoints

### User Management
- `POST /api/users` - Create user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Skills & Matching
- `POST /api/extract-skills` - Extract skills from text (AI)
- `POST /api/match` - Find compatible matches
- `GET /api/matches/:userId` - Get user's matches

### Learning Plans
- `POST /api/learning-plan` - Generate AI learning plan

See [docs/API_REFERENCE.md](../docs/API_REFERENCE.md) for complete API documentation.

---

## Project Structure

```
backend/
├── config/
│   ├── gemini.js        # Gemini AI configuration
│   └── supabase.js      # Supabase client setup
├── routes/
│   ├── userRoutes.js    # User CRUD endpoints
│   ├── matchRoutes.js   # Matching endpoints
│   └── chatRoutes.js    # Chat/conversation endpoints
├── services/
│   ├── matchingService.js   # Matching algorithm
│   ├── skillService.js      # Skill extraction (AI)
│   └── learningPlanService.js  # Learning plan generation (AI)
├── middleware/
│   └── errorHandler.js  # Global error handling
├── seed.js              # Database seeding script
├── server.js            # Express app entry point
└── package.json
```

---

## Key Features

### 🤖 AI-Powered
- **Skill Extraction:** Automatically extract skills from text descriptions
- **Smart Matching:** Personality + skill compatibility analysis
- **Learning Plans:** Personalized step-by-step learning roadmaps

### 🎯 Matching Algorithm
- Reciprocal skill matching (A teaches B, B teaches A)
- Personality compatibility scoring
- AI-enhanced bio analysis (6 dimensions)
- Category-based partial matching

### 📊 Data Generation
- Realistic test users with 70+ skills across 5 categories
- Diverse personality profiles
- Automatic match creation based on compatibility

---

## Technology Stack

- **Runtime:** Node.js 22+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini (gemini-pro, embedding-001)
- **Dependencies:**
  - `@supabase/supabase-js` - Database client
  - `@google/generative-ai` - AI features
  - `express` - Web framework
  - `cors` - CORS middleware
  - `dotenv` - Environment variables

---

## Development

### Adding New Endpoints

1. Create route handler in `routes/`
2. Add business logic to `services/`
3. Register route in `server.js`
4. Document in `docs/API_REFERENCE.md`

### Testing

```bash
# Start server
npm run dev

# Test endpoint with curl
curl http://localhost:3000/api/users

# Or use the frontend (port 5173)
cd ../frontend && npm run dev
```

---

## Troubleshooting

### Port 3000 already in use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Supabase connection errors

Check:
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Supabase project is active
- Network connectivity

### Gemini API errors

Check:
- `GEMINI_API_KEY` is valid
- API quota not exceeded
- Model names are correct (`gemini-pro`, `embedding-001`)

### Seed script issues

- **No matches created:** Skills don't overlap, try more users
- **Embedding errors:** Gemini quota exceeded, script continues without embeddings
- **Duplicate errors:** Use `npm run seed:clear` to start fresh

---

## Documentation

- [**Complete Docs**](../docs/) - All documentation
- [**Setup Guide**](../docs/SETUP.md) - Environment setup
- [**API Reference**](../docs/API_REFERENCE.md) - All endpoints
- [**Database Schema**](../docs/DATABASE_SCHEMA.md) - Database structure
- [**Seeding Guide**](../docs/SEEDING.md) - Test data generation
- [**Gemini Integration**](../docs/GEMINI_INTEGRATION.md) - AI features
- [**Matching Algorithm**](../docs/MATCHING_ALGORITHM.md) - How matching works

---

## License

Built for DurHack 2025 🚀
