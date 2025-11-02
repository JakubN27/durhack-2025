# SkillSwap Documentation Hub

**Last Updated:** November 2, 2025

---

## 📚 Essential Documentation

This folder contains all the core documentation for the SkillSwap project. Everything you need to understand, set up, and develop the platform.

### 🚀 Quick Start
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes

### 📖 Core Guides
- **[OVERVIEW.md](./OVERVIEW.md)** - Project overview, features, tech stack
- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and data flow
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow and guidelines

### 🔧 Technical References
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API documentation
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure and relationships
- **[GEMINI_INTEGRATION.md](./GEMINI_INTEGRATION.md)** - AI features and setup

### 🎯 Feature Guides
- **[MATCHING_ALGORITHM.md](./MATCHING_ALGORITHM.md)** - How matching works
- **[CHAT_SYSTEM.md](./CHAT_SYSTEM.md)** - Chat implementation guide
- **[PROFILE_SYSTEM.md](./PROFILE_SYSTEM.md)** - User profiles and avatars

### 🐛 Support
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## 📁 Documentation Structure

```
docs/
├── README.md                    ← You are here
│
├── QUICKSTART.md               ← Start here for setup
├── OVERVIEW.md                  ← Project overview
├── SETUP.md                     ← Detailed setup guide
├── ARCHITECTURE.md              ← System architecture
├── DEVELOPMENT.md               ← Development workflow
│
├── API_REFERENCE.md             ← Complete API docs
├── DATABASE_SCHEMA.md           ← Database structure
├── GEMINI_INTEGRATION.md        ← AI features
│
├── MATCHING_ALGORITHM.md        ← Matching system
├── CHAT_SYSTEM.md               ← Chat implementation
├── PROFILE_SYSTEM.md            ← Profile features
│
└── TROUBLESHOOTING.md           ← Problem solving
```

---

## 🎯 What This Project Does

**SkillSwap** is a platform that connects people who want to exchange skills and knowledge. Think "language exchange" but for any skill.

### Core Features
1. **Smart Matching** - AI-powered algorithm finds compatible learning partners
2. **Real-time Chat** - Built-in messaging with TalkJS
3. **Profile System** - Skills, bio, personality traits, and avatars
4. **Session Tracking** - Track learning progress and completed sessions

---

## 🛠 Tech Stack

**Frontend:** React + Vite + TailwindCSS  
**Backend:** Node.js + Express  
**Database:** Supabase (PostgreSQL)  
**AI:** Google Gemini  
**Chat:** TalkJS  
**Auth:** Supabase Auth  

---

## 🚀 Quick Setup (30 seconds)

```bash
# 1. Clone and install
git clone <repo>
cd durhack-2025
npm install

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both files with your API keys

# 3. Run database migrations
cd supabase
# Apply migrations to your Supabase project

# 4. Start development servers
npm run dev
```

Visit http://localhost:5174 (frontend) and backend runs on port 3000.

---

## 📊 Key Information

### Database Tables
- `users` - User profiles, skills, personality
- `matches` - Skill exchange pairs
- `conversations` - Chat conversations
- `messages` - Chat message history (TalkJS)

### Main API Endpoints
- `POST /api/auth/signup` - Create account
- `GET /api/matching/user/:id` - Get matches
- `POST /api/matching/create` - Create match
- `GET /api/chat/:matchId` - Get chat details

### Environment Variables
**Backend (.env):**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
PORT=3000
```

**Frontend (.env.local):**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TALKJS_APP_ID=
```

---

## 🎓 How It Works

1. **User signs up** → Creates profile with skills
2. **AI analyzes profile** → Extracts skills, generates embeddings
3. **Matching algorithm runs** → Finds compatible partners
4. **Users connect** → Create match and start chatting
5. **Track progress** → Sessions, achievements, growth

### Matching Formula (with AI)
```
40% Skill reciprocity (A teaches B, B teaches A)
15% Bio compatibility (AI analysis)
15% Learning style match (AI analysis)
10% Basic personality traits
10% AI personality synergy
5%  Communication compatibility
5%  Motivation alignment
```

---

## 📝 For Developers

### Project Structure
```
durhack-2025/
├── backend/          # Express API server
├── frontend/         # React + Vite app
├── supabase/         # Database migrations
└── docs/             # This documentation
```

### Development Workflow
1. Create feature branch
2. Develop and test locally
3. Run migrations if needed
4. Create pull request
5. Merge to main

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🐛 Common Issues

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Supabase connection error?**
- Check environment variables
- Verify API keys are correct
- Ensure migrations are applied

**Gemini API errors?**
- Check API key is valid
- Verify rate limits (60 req/min free tier)
- App works without Gemini (degraded matching)

---

## 📞 Need Help?

1. Check **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**
2. Review **[ARCHITECTURE.md](./ARCHITECTURE.md)** for system design
3. See **[API_REFERENCE.md](./API_REFERENCE.md)** for endpoint details

---

## 📅 Version History

- **v1.0** (Nov 2025) - Initial release with all core features
- **v1.1** (Nov 2025) - Improved AI matching algorithm
- **v1.2** (Nov 2025) - Profile picture upload feature

---

**Status:** ✅ Production Ready  
**Last Tested:** November 2, 2025  
**Maintainer:** DurHack 2025 Team
