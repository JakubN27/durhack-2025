# SkillSwap - Project Overview

> AI-Powered Peer-to-Peer Learning Platform - Learn from others, teach what you know.

**Built for DurHack 2025** 🚀

---

## 🌟 What is SkillSwap?

SkillSwap is a reciprocal learning platform that connects people who want to learn skills with those who can teach them. Unlike traditional learning platforms, SkillSwap focuses on mutual exchange - you teach something you know, and learn something you want to know.

### Core Concept
- **Reciprocal Matching**: Find partners where you can teach each other
- **Skill-Based Discovery**: Search for specific skills you want to learn
- **Real-Time Communication**: Chat with matches instantly
- **AI-Enhanced**: Get skill suggestions and personalized learning plans

---

## ✨ Key Features

### 🎯 Smart Matching System
- **Reciprocal Algorithm**: Matches based on mutual skill exchange
- **Match Scoring**: See compatibility percentage (0-100%)
- **Skill Categories**: Organized by programming, design, languages, etc.
- **Proficiency Levels**: Beginner, Intermediate, Advanced, Expert

### 💬 Chat & Conversations
- **Real-Time Messaging**: Powered by TalkJS
- **Conversations Inbox**: All your chats in one place
- **Automatic Creation**: Conversations created when you match
- **Mutual Skills Display**: See what you can learn from each other

### 👤 Profile Management
- **Skills to Learn**: Add skills you want to acquire
- **Skills to Teach**: Share your expertise
- **Profile Editing**: Update anytime
- **Skill Categories**: Programming, Design, Languages, Business, etc.

### 🔍 Discovery & Search
- **Search by Skill**: Find people teaching specific skills
- **View Matches**: See all your compatible learning partners
- **Match Details**: View mutual learning opportunities

### 🤖 AI Features (Gemini)
- **Skill Extraction**: AI extracts skills from text descriptions
- **Learning Plans**: Get personalized learning roadmaps
- **Match Optimization**: AI-powered sorting and ranking

---

## 🏗️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Hot Toast** - Beautiful notifications
- **TalkJS** - Real-time chat infrastructure

### Backend
- **Node.js 22** - JavaScript runtime
- **Express** - Web application framework
- **Supabase Client** - Database and auth client
- **Google Gemini AI** - Generative AI for features

### Database & Auth
- **Supabase (PostgreSQL)** - Modern Postgres platform
  - PostgreSQL 15+
  - Built-in authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - RESTful API
- **JSONB Storage** - Flexible skill data structure

### External Services
- **TalkJS** - Chat infrastructure
- **Google Gemini** - AI capabilities
- **GitHub** - Version control and collaboration

---

## 📊 System Architecture

### High-Level Overview
```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │
       ├──────────┐
       │          │
       v          v
┌──────────┐  ┌──────────┐
│ Backend  │  │ TalkJS   │
│ (Express)│  │ (Chat)   │
└────┬─────┘  └──────────┘
     │
     v
┌──────────────┐
│   Supabase   │
│ (PostgreSQL) │
└──────────────┘
     │
     v
┌──────────────┐
│  Gemini AI   │
└──────────────┘
```

### Data Flow
1. **User Actions** → Frontend (React)
2. **API Requests** → Backend (Express)
3. **Data Operations** → Supabase (PostgreSQL)
4. **AI Features** → Gemini API
5. **Chat Messages** → TalkJS
6. **Real-time Updates** → Supabase Realtime

---

## 🎯 Core Workflows

### User Registration & Setup
1. User signs up via Supabase Auth
2. Creates profile with skills to learn/teach
3. System creates user record in database
4. Profile becomes searchable

### Finding Matches
1. User views Matches page
2. Backend queries compatible users:
   - Find users teaching what you want to learn
   - Find users learning what you can teach
3. Calculate match scores (0-100%)
4. Return sorted list of matches

### Starting Conversations
1. User clicks "Chat" on a match
2. Backend creates conversation record
3. Backend creates TalkJS conversation
4. Frontend initializes TalkJS chat
5. Users can message in real-time

### Searching for Skills
1. User enters skill name in search
2. Backend searches profiles for skill
3. Returns users teaching that skill
4. User can view profiles and chat

---

## 📁 Project Structure

```
durhack-2025/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utilities (TalkJS, Supabase)
│   │   └── App.jsx     # Main app component
│   └── public/         # Static assets
│
├── backend/            # Express API server
│   ├── routes/         # API endpoints
│   │   ├── auth.js     # Authentication
│   │   ├── profile.js  # Profile management
│   │   ├── matching.js # Matching logic
│   │   └── chat.js     # Chat integration
│   ├── services/       # Business logic
│   │   └── matchingService.js
│   └── config/         # Configuration
│       ├── supabase.js
│       └── gemini.js
│
├── supabase/           # Database migrations
│   └── migrations/     # SQL migration files
│
└── docs/              # Documentation
    ├── OVERVIEW.md    # This file
    ├── SETUP.md       # Setup instructions
    ├── ARCHITECTURE.md # Technical details
    ├── TROUBLESHOOTING.md
    └── DEVELOPMENT.md
```

---

## 🔐 Security Features

### Authentication
- **Supabase Auth** - Secure email/password authentication
- **JWT Tokens** - Stateless authentication
- **Session Management** - Automatic token refresh

### Database Security
- **Row Level Security (RLS)** - Users can only access their own data
- **Secure Queries** - Parameterized queries prevent SQL injection
- **Environment Variables** - Sensitive data in .env files

### API Security
- **CORS Configuration** - Controlled cross-origin requests
- **Input Validation** - Server-side validation of all inputs
- **Error Handling** - Generic error messages to clients

---

## 🎨 Design Principles

### User Experience
- **Intuitive Navigation** - Clear, simple menu structure
- **Responsive Design** - Works on desktop and mobile
- **Fast Feedback** - Toast notifications for all actions
- **Loading States** - Visual feedback during operations

### Code Quality
- **Component-Based** - Reusable React components
- **Separation of Concerns** - Frontend/backend separation
- **Error Handling** - Comprehensive try-catch blocks
- **Consistent Styling** - TailwindCSS utility classes

### Performance
- **Lazy Loading** - Components loaded on demand
- **Optimistic Updates** - UI updates before server confirmation
- **Caching** - Minimize redundant API calls
- **Efficient Queries** - Optimized database queries

---

## 📈 Future Enhancements

### Planned Features
- [ ] Video chat integration
- [ ] Skill verification system
- [ ] Rating and review system
- [ ] Group learning sessions
- [ ] Progress tracking
- [ ] Certificates/badges
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Learning resources library

### Technical Improvements
- [ ] GraphQL API
- [ ] Redis caching
- [ ] WebSocket for real-time features
- [ ] Automated testing (Jest, Cypress)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Monitoring and analytics

---

## 👥 Team & Contributions

### Built For
- **DurHack 2025** - Durham University Hackathon
- **Theme**: Education & Learning Technology

### Development Team
- Team collaboration via GitHub
- Modular development approach
- Feature branch workflow

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. See DEVELOPMENT.md for details

---

## 📚 Additional Resources

- **Setup Guide**: See `SETUP.md` for installation instructions
- **Architecture**: See `ARCHITECTURE.md` for technical details
- **Troubleshooting**: See `TROUBLESHOOTING.md` for common issues
- **Development**: See `DEVELOPMENT.md` for contribution guidelines

---

## 📞 Support

For issues or questions:
1. Check `TROUBLESHOOTING.md` first
2. Review existing GitHub issues
3. Create a new issue with details
4. Tag appropriate team members

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Active Development
