# SkillSwap 🎓

> **AI-Powered Peer-to-Peer Learning Platform** - Learn from others, teach what you know.

Built for **DurHack 2025** 🚀

[![Built with React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)](https://nodejs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![AI by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev/)

---

## 🌟 What is SkillSwap?

SkillSwap is a **reciprocal learning platform** that connects people who want to exchange skills and knowledge. Think "language exchange" but for **any skill** - programming, design, music, languages, cooking, and more!

### ✨ Key Features

- 🤝 **Smart Reciprocal Matching** - AI-powered algorithm finds partners where you can teach each other
- 💬 **Real-Time Chat** - Instant messaging with integrated TalkJS
- 🎯 **Personalized Dashboard** - Track your progress, goals, and weekly focus
- 🤖 **AI-Enhanced Learning** - Gemini-powered skill extraction and learning plans
- 📊 **Progress Tracking** - Monitor your learning streaks and achievements
- 🔍 **Skill Discovery** - Browse and search for specific skills to learn

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier works)
- **Google Gemini API** key (optional, for AI features)
- **TalkJS** account (for chat functionality)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/durhack-2025.git
cd durhack-2025

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your credentials

# 4. Set up the database
# Go to your Supabase project dashboard
# Run the migrations from supabase/migrations/

# 5. (Optional) Seed the database with test data
npm run seed

# 6. Start development servers
npm run dev
```

Visit:
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:3000

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **TalkJS** - Real-time chat infrastructure

### Backend
- **Node.js 22** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - PostgreSQL database with auth

### AI & Services
- **Google Gemini** - AI-powered features (skill extraction, learning plans)
- **TalkJS** - Chat infrastructure
- **Supabase Auth** - User authentication

---

## 📋 Environment Variables

### Backend (`backend/.env`)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# TalkJS
VITE_TALKJS_APP_ID=your-talkjs-app-id

# Optional: Google Gemini (if using client-side AI)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Getting Your Keys:**
- **Supabase**: [Dashboard](https://app.supabase.com) → Project Settings → API
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **TalkJS**: [Dashboard](https://talkjs.com/dashboard)

---

## 🎯 How It Works

### 1. **Sign Up & Create Profile**
Users create an account and add:
- Skills they can **teach** (e.g., React, Python, Guitar)
- Skills they want to **learn** (e.g., UI Design, French, Cooking)

### 2. **AI-Powered Matching**
The matching algorithm finds compatible partners based on:
- **40%** Skill reciprocity (mutual teaching/learning)
- **15%** Bio compatibility (AI analysis)
- **15%** Learning style match
- **10%** Personality traits
- **10%** AI personality synergy
- **10%** Communication & motivation alignment

### 3. **Connect & Learn**
- View your matches with compatibility scores
- Start conversations via integrated chat
- Track your learning progress on the dashboard

### 4. **Track Progress**
- Monitor weekly chat activity and learning streaks
- Set and achieve daily goals (2+ chat interactions per day)
- View progress highlights and achievements

---

## 📁 Project Structure

```
durhack-2025/
├── backend/                 # Express API server
│   ├── config/             # Configuration (database, Gemini)
│   ├── routes/             # API routes
│   ├── services/           # Business logic (matching, chat)
│   └── server.js           # Main server file
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utilities (Supabase client)
│   │   ├── pages/          # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Matches.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Conversations.jsx
│   │   └── App.jsx         # Root component
│   └── index.html
│
├── supabase/               # Database migrations
│   └── migrations/         # SQL migration files
│
├── scripts/                # Utility scripts
│   └── seed.js            # Database seeding
│
└── package.json            # Workspace configuration
```

---

## 🔑 Key Features Explained

### Dashboard
- **Real-time metrics**: Active matches, skills teaching/learning, conversation count
- **Weekly Focus**: Visual tracker for daily chat goals with status indicators
- **Progress Highlights**: AI-generated insights about your learning journey
- **Quick Actions**: Jump to profile editing, find matches, or start conversations

### Matching System
- **Reciprocal matching**: Finds partners where you both benefit
- **Match scores**: 0-100% compatibility rating
- **Skill visualization**: Interactive force-directed graph showing skill relationships
- **AI enhancements**: Gemini analyzes profiles for deeper compatibility

### Chat & Conversations
- **Integrated TalkJS**: Professional chat experience
- **Conversation management**: See all active chats in one inbox
- **Match context**: View skills you're exchanging in each conversation
- **Activity tracking**: Monitor last interaction times

### Profile Management
- **Skill management**: Add/remove skills you teach or want to learn
- **Profile picture**: Upload custom avatar (Supabase Storage)
- **Bio & interests**: Share your learning goals and personality
- **Availability**: Set your preferred communication times

---

## 🗄️ Database Schema

The application uses **Supabase (PostgreSQL)** with the following main tables:

### `users`
User profiles and authentication data
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- bio (text)
- teach_skills (jsonb) -- Skills user can teach
- learn_skills (jsonb) -- Skills user wants to learn
- profile_picture_url (text)
- created_at (timestamp)
```

### `matches`
Skill exchange partnerships
```sql
- id (uuid, primary key)
- user_a (uuid, foreign key)
- user_b (uuid, foreign key)
- score (numeric) -- Compatibility score 0-1
- status (text) -- pending, active, accepted
- created_at (timestamp)
```

### `conversations`
Chat conversation metadata
```sql
- id (uuid, primary key)
- match_id (uuid, foreign key)
- conversation_id (text) -- TalkJS conversation ID
- created_at (timestamp)
- last_message_at (timestamp)
```

---

## 🤖 AI Features (Google Gemini)

### Skill Extraction
Automatically extracts skills from free-text descriptions:
```javascript
"I love building web apps with React and designing UIs"
→ ["React", "Web Development", "UI Design"]
```

### Learning Plan Generation
Creates personalized learning roadmaps based on:
- Current skill level
- Learning goals
- Time availability
- Learning style preferences

### Match Optimization
AI analyzes user bios and personalities to:
- Improve match quality beyond basic skill overlap
- Identify communication style compatibility
- Suggest conversation starters

---

## 🧪 Development

### Available Scripts

```bash
# Start both frontend and backend
npm run dev

# Start individually
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build

# Seed database with test data
npm run seed

# Clean install (if dependencies get messy)
npm run fresh-install
```

### Database Seeding

The seed script creates realistic test data:
- 20 diverse user profiles
- 70+ skills across 5 categories
- Matches with realistic compatibility scores
- Sample conversations

```bash
npm run seed -- --users 20 --clear
```

Options:
- `--users <n>` - Number of users to create (default: 20)
- `--clear` - Clear existing data first
- `--matches` - Generate matches after creating users

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5174 (frontend)
lsof -ti:5174 | xargs kill -9
```

### Supabase Connection Issues
1. Verify your `SUPABASE_URL` and keys in `.env` files
2. Check that migrations have been applied
3. Ensure Row Level Security (RLS) policies are correct

### Chat Not Working
1. Verify `VITE_TALKJS_APP_ID` is set correctly
2. Check TalkJS dashboard for account status
3. Ensure conversations are being created in the database

### Gemini API Errors
- Check API key validity
- Verify rate limits (60 requests/min on free tier)
- App works without Gemini (with reduced matching quality)

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku/Railway/Render)
```bash
# Ensure environment variables are set
# Deploy from the root directory
```

### Database
- Supabase is production-ready out of the box
- Apply migrations before going live
- Set up RLS policies for security

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use **ESLint** and **Prettier** for consistent formatting
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 API Reference

### Authentication
```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/user
```

### Users
```http
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Matching
```http
GET  /api/matching/user/:userId     # Get user's matches
POST /api/matching/find/:userId     # Find new matches
POST /api/matching/create           # Create a match
```

### Conversations
```http
GET  /api/chat/conversations/:userId      # Get all conversations
POST /api/chat/conversation              # Create conversation
GET  /api/chat/conversation/:matchId     # Get specific conversation
```

### AI Features
```http
POST /api/ai/extract-skills    # Extract skills from text
POST /api/ai/learning-plan     # Generate learning plan
```

---

## 📊 Performance

- **Frontend bundle size**: ~150KB gzipped
- **API response times**: <100ms average
- **Database queries**: Optimized with indexes
- **Real-time updates**: Via Supabase subscriptions
- **Chat latency**: <50ms (TalkJS CDN)

---

## 🔐 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Row Level Security**: Postgres RLS for data protection
- **API Keys**: Never committed to version control
- **Input Validation**: Server-side validation on all endpoints
- **CORS**: Configured for frontend domain only

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by the DurHack 2025 Team

---

## 🙏 Acknowledgments

- **DurHack 2025** - For the amazing hackathon experience
- **Supabase** - For the excellent backend infrastructure
- **Google Gemini** - For powering our AI features
- **TalkJS** - For seamless chat integration
- **React & Vite** - For the amazing developer experience

---

## 📞 Support

Need help? Here's where to look:

1. **Documentation**: See `docs_archive/` for detailed technical docs
2. **Issues**: [GitHub Issues](https://github.com/yourusername/durhack-2025/issues)
3. **Discussions**: [GitHub Discussions](https://github.com/yourusername/durhack-2025/discussions)

---

## 🎯 Roadmap

### Completed ✅
- User authentication and profiles
- AI-powered matching algorithm
- Real-time chat integration
- Dashboard with progress tracking
- Weekly focus and goal tracking
- Profile picture upload
- Database seeding

### Coming Soon 🚀
- Video call integration
- Mobile app (React Native)
- Advanced learning analytics
- Skill verification system
- Community forums
- Achievement badges
- Email notifications

---

**Status:** ✅ Production Ready  
**Version:** 1.2.0  
**Last Updated:** November 2, 2025

**Made with ❤️ for DurHack 2025**
