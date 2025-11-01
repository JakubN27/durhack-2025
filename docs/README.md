# SkillSwap 🎓✨

**AI-Powered Peer-to-Peer Learning Platform** - Learn from others, teach what you know.

Built for DurHack 2025 🚀

---

## 🌟 Features

- **🎯 Smart Matching** - Reciprocal skill-based matching algorithm
- **🔍 Search & Discovery** - Find learning partners by specific skills
- **👤 Profile Management** - Organize skills by category and proficiency
- **💬 Real-time Chat** - Integrated TalkJS chat for matched users
- **📬 Conversations Inbox** - View and manage all your chats in one place
- **🤝 Mutual Skills Display** - See what you can learn from each other
- **🤖 AI Features** - Skill extraction and learning plans with Gemini
- **📊 Match Scores** - See compatibility percentage with each match

---

## 🏗️ Tech Stack

**Frontend:**
- React 19 + Vite
- TailwindCSS for styling
- React Router for navigation
- React Hot Toast for notifications
- TalkJS for real-time chat

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL + Auth)
- Google Gemini AI

**Database:**
- PostgreSQL with Supabase
- JSONB for flexible skill storage
- Row Level Security (RLS)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (or 20.19+)
- npm or pnpm
- Supabase account
- Gemini API key (optional)

### 1. Install Dependencies

```bash
# Install all dependencies using npm workspaces (single command!)
npm install
```

This installs all dependencies for the root, backend, and frontend in a shared `node_modules` directory.

### 2. Configure Environment

**Backend** (`backend/.env`):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key (optional)
PORT=3000
```

**Frontend** (`frontend/.env.local`):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000
VITE_TALKJS_APP_ID=your_talkjs_app_id
VITE_GEMINI_API_KEY=your_gemini_key (optional)
```

> **Note**: Get your TalkJS App ID from [TalkJS Dashboard](https://talkjs.com/dashboard)

### 3. Setup Database

Run the migration in Supabase SQL Editor:
```bash
# Copy contents of supabase/migrations/20251101000000_initial_schema.sql
# Paste into Supabase SQL Editor and run
```

### 4. Seed Test Data

```bash
# From project root
npm run seed --workspace=backend

# Or
cd backend && npm run seed
```

This creates 6 test users with perfect reciprocal matches.

### 5. Start Development

```bash
# From project root
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📖 Usage

### Test Users

Login with any of these (any password works):
- **alice@test.com** - React/JS expert ↔ wants Python/ML
- **bob@test.com** - Python/ML expert ↔ wants React
- **carol@test.com** - iOS expert ↔ wants Android/Node.js
- **david@test.com** - Node.js expert ↔ wants iOS/Android
- **emma@test.com** - Designer ↔ wants JavaScript
- **frank@test.com** - DevOps ↔ wants Python/ML

### Getting Started

1. **Sign up** or use a test account
2. **Complete your profile** - Add skills you can teach and want to learn
3. **Find matches** - Click "Find New Matches" on dashboard
4. **Browse matches** - Search for specific skills
5. **Connect** - Click "Connect & Start Chat" on a match
6. **Chat** - Start learning together in real-time!
7. **Manage conversations** - View all chats in the Conversations page

---

## � How Matching Works

The matching algorithm calculates **reciprocal scores**:

1. **Score A→B**: How well User A can teach what User B wants to learn
2. **Score B→A**: How well User B can teach what User A wants to learn  
3. **Match Score**: Average of both directions (0-100%)

**Scoring:**
- Exact skill name match: 100% weight
- Category match: 30% weight
- Partial name match: 70% weight

**Example:**
- Alice teaches React → Bob wants React ✅
- Bob teaches Python → Alice wants Python ✅
- **Match Score: 95%** 🎉

---

## 📁 Project Structure

```
durhack-2025/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Dashboard, Profile, Matches, etc.
│   │   ├── components/   # Reusable components
│   │   └── lib/          # Supabase client
│   └── package.json
├── backend/              # Express API
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic (matching, AI)
│   ├── config/          # Supabase & Gemini setup
│   └── scripts/         # Database seeding
├── supabase/            # Database migrations
└── docs/                # Documentation
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `DELETE /api/users/:id` - Delete user

### Matching
- `GET /api/matching/find/:userId?limit=10` - Find matches
- `POST /api/matching/create` - Create match
- `GET /api/matching/user/:userId` - Get user's matches
- `GET /api/matching/:matchId` - Get match details

### AI (if Gemini configured)
- `POST /api/ai/skill-extraction` - Extract skills from bio
- `POST /api/ai/learning-plan` - Generate learning plan
- `POST /api/ai/session-summary` - Session summary
- `POST /api/ai/motivational-nudge` - Get motivation

See `backend/API_DOCUMENTATION.md` for full details.

---

## �️ Development

### Available Scripts

```bash
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only
npm run install:all      # Install all dependencies
npm run build            # Build frontend for production
npm run clean            # Remove all node_modules
npm run fresh-install    # Clean reinstall
```

### Backend Scripts

```bash
# From project root:
npm run seed --workspace=backend   # Seed test data

# Or from backend directory:
cd backend
npm run seed             # Seed test data
npm run dev              # Start with hot reload
npm start                # Production mode
```

---

## 📚 Documentation

- `QUICK_START.md` - Getting started guide
- `PROJECT_STRUCTURE.md` - Architecture explanation
- `MATCHING_SYSTEM_GUIDE.md` - Matching algorithm details
- `CHAT_FEATURE_GUIDE.md` - Real-time chat documentation
- `WORKSPACE_SETUP.md` - npm workspaces guide
- `backend/API_DOCUMENTATION.md` - API reference
- `backend/TESTING_GUIDE.md` - Testing guide
- `backend/SETUP.md` - Backend setup

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project was created for DurHack 2025.

---

## 👥 Team

- 3 Developers
- 1 Designer

---

## 🙏 Acknowledgments

- DurHack 2025 organizers
- Supabase for the awesome backend
- Google Gemini for AI capabilities

---

**Made with ❤️ at DurHack 2025**
npm install
```

2. **Configure environment:**
```bash
cp frontend/.env.example frontend/.env.local
# Edit .env.local with your Supabase and Gemini credentials
```

3. **Run the app:**
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📚 Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running
- **[Development Log](docs/DEVLOG.md)** - Progress tracking
- **[Database Setup](docs/01_database_setup.md)** - Schema details
- **[Frontend Setup](docs/03_frontend_setup.md)** - App structure

---

## 🎯 Current Status

✅ **Completed:**
- Database schema with pgvector
- Frontend with auth & routing
- Profile management
- Basic UI/UX

🚧 **In Progress:**
- AI skill extraction
- Matching algorithm
- Real-time chat

📋 **Planned:**
- AI middleman features
- Skill legacy visualization
- Gamification system

---

## 🏆 Hackathon Goals

Built in 36-48 hours for DurHack 2025, focusing on:
- Innovative use of embedded AI (not chatbots)
- Reciprocal skill matching
- Social impact through knowledge sharing

---

## 📄 License

MIT License - DurHack 2025

---

*Happy skill swapping! 🎓✨*