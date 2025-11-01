# 🚀 Quick Start Guide - SkillSwap

## Current Status: ✅ Ready to Run!

All components are in place:
- ✅ Backend API with matching system
- ✅ Frontend with login, dashboard, profile, and matches pages
- ✅ Database seeded with 6 test users
- ✅ Environment variables configured
- ✅ Toast notifications implemented
- ✅ TalkJS chat integration
- ✅ Unified workspace with shared node_modules

## Prerequisites

Make sure you have configured your environment variables:
- **Backend**: `.env` file in the backend directory with `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `GEMINI_API_KEY`
- **Frontend**: `.env.local` file in the frontend directory with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`, and `VITE_TALKJS_APP_ID`

## Start the Application

### 1. Install Dependencies (First Time Only)
```bash
npm install
```

This will install all dependencies for the root, frontend, and backend using npm workspaces.

### 2. Start Both Servers
```bash
npm run dev
```

This will start:
- 🔵 **Backend**: http://localhost:3000
- 🟣 **Frontend**: http://localhost:5173

### 2. Open Your Browser
Go to: http://localhost:5173

### 3. Test the App

#### Option A: Use Test Users
Sign in with any of these test accounts (any password works):
- alice@test.com - React/JS expert wants Python/ML
- bob@test.com - Python/ML expert wants React
- carol@test.com - iOS expert wants Android/Node.js
- david@test.com - Node.js expert wants iOS/Android
- emma@test.com - UI/UX designer wants JavaScript
- frank@test.com - DevOps expert wants Python/ML

#### Option B: Create Your Own Account
1. Click "Get Started" or "Sign In"
2. Switch to "Sign up"
3. Enter your name, email, and password
4. Confirm your email (check Supabase for confirmation)
5. Complete your profile

## User Flow

### 1. Complete Your Profile
- Go to Profile page
- Add your name and bio
- Add skills you can teach (e.g., React, Python)
- Add skills you want to learn
- Click "Save Profile"

### 2. Find Matches
- Go to Dashboard
- Click "Find New Matches"
- Or go directly to Matches page

### 3. Browse Matches
- See your match score (0-100%)
- View mutual skills
- Search for specific skills
- Click "Connect & Start Learning"

### 4. Perfect Match Examples
Try these test users to see high match scores:
- **Alice + Bob**: 95%+ match (React ↔ Python exchange)
- **Carol + David**: 90%+ match (iOS ↔ Node.js exchange)
- **Emma + Alice**: Good match (Design + Frontend)

## Pages Overview

### 🏠 Home (`/`)
- Beautiful landing page
- Feature showcase
- Call-to-action buttons

### 🔐 Login (`/login`)
- Sign in / Sign up
- Email + password auth
- Toast notifications

### 📊 Dashboard (`/dashboard`)
- Stats overview
- Your teach/learn skills
- Quick actions
- Recent matches

### 👤 Profile (`/profile`)
- Edit name and bio
- Add/remove teach skills
- Add/remove learn skills
- Organized by category and proficiency

### 🎯 Matches (`/matches`)
- Search by skill
- Browse potential matches
- Match score percentage
- Mutual skills display
- Connect button

## API Endpoints (Backend)

All running on http://localhost:3000/api/

### Users
- GET `/users` - List all users
- GET `/users/:id` - Get user profile
- POST `/users` - Create user
- PUT `/users/:id` - Update user

### Matching
- GET `/matching/find/:userId` - Find matches
- POST `/matching/create` - Create match
- GET `/matching/user/:userId` - Get user's matches

### AI (if Gemini key is set)
- POST `/ai/skill-extraction` - Extract skills from bio
- POST `/ai/learning-plan` - Generate learning plan
- POST `/ai/session-summary` - Summarize session
- POST `/ai/motivational-nudge` - Get motivation

## Troubleshooting

### Backend won't start?
```bash
# Check .env file exists
cd backend
cat .env

# Should show your Supabase credentials
```

### Frontend shows errors?
```bash
# Check .env.local
cd frontend
cat .env.local

# Restart dev server
npm run dev
```

### No matches found?
1. Make sure you have skills added to your profile
2. Try with test users first (they have perfect matches)
3. Check backend is running on port 3000

### Database connection issues?
1. Verify Supabase URL and keys in .env files
2. Check Supabase dashboard is accessible
3. Make sure you ran the seed script: `cd backend && npm run seed`

## What's Working

✅ User registration and login
✅ Profile management with skills
✅ Matching algorithm (reciprocal skill matching)
✅ Search functionality
✅ Toast notifications
✅ Responsive design
✅ Protected routes
✅ Backend API
✅ Database with test data

## Next Steps (Future Features)

🔜 Chat system between matched users
🔜 Session scheduling and tracking
🔜 Achievement system and badges
🔜 Skill legacy visualization
🔜 AI-powered learning plans
🔜 Real-time notifications

## Support

If something isn't working:
1. Check both servers are running (backend + frontend)
2. Check browser console for errors (F12)
3. Check terminal for backend errors
4. Verify .env files are configured correctly

---

**You're all set! Enjoy matching and learning! 🎓✨**
