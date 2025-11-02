# SkillSwap - Quick Start Guide

## 🎉 What's Been Completed

### ✅ Database (Supabase)
- Complete schema with 5 tables
- pgvector for AI matching
- Row Level Security enabled
- **Status:** Pushed to Supabase

### ✅ Frontend (React + Vite)
- Modern UI with TailwindCSS
- Authentication flow
- Profile management
- Router setup for all pages
- **Status:** Ready to run

---

## 🚀 Get Started

### 1. Configure Environment Variables

Create `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-key-here
```

**Where to find Supabase credentials:**
- Go to: Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon/public key"

### 2. Install Dependencies & Run

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:3000**

---

## 📦 What You Can Do Right Now

1. **Sign up** for a new account
2. **Create your profile** with a bio
3. **See the dashboard** (stats are placeholders)

---

## 🎯 Next Development Steps

### Step 3: AI Skill Extraction (PRIORITY)
**Goal:** Extract skills from user bio using Gemini AI

**Files to create:**
- `frontend/src/services/aiService.js` - Gemini API calls
- `frontend/src/services/skillExtractor.js` - Skill parsing logic

**Implementation:**
1. When user saves profile, send bio to Gemini
2. Parse response to extract:
   - Skills user can teach (with proficiency)
   - Skills user wants to learn
3. Generate embeddings using Gemini
4. Save to database

### Step 4: Matching Algorithm
**Goal:** Find reciprocal skill matches using vector similarity

**Implementation:**
1. Query users with similar embeddings
2. Calculate reciprocal score: (A→B + B→A) / 2
3. Display top matches
4. Allow users to connect

### Step 5: Real-time Chat
**Goal:** Enable matched users to communicate

**Implementation:**
1. Use Supabase Realtime subscriptions
2. Build chat UI component
3. Store messages in database
4. Show unread counts

---

## 📁 Project Structure

```
durhack-2025/
├── docs/                       # All documentation
│   ├── 01_database_setup.md
│   ├── 02_supabase_auth_setup.md
│   ├── 03_frontend_setup.md
│   ├── DEVLOG.md              # Development progress
│   └── QUICKSTART.md          # This file
├── supabase/
│   └── migrations/
│       └── 20251101000000_initial_schema.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Matches.jsx
│   │   │   └── Chat.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists in `frontend/` directory
- Verify variables start with `VITE_`
- Restart dev server after adding variables

### Database connection errors
- Verify Supabase URL and anon key are correct
- Check that database migrations were applied
- Ensure RLS policies allow anonymous access for sign up

### Package installation issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Development Tips

1. **Use the browser console** - React errors show here
2. **Check Supabase Dashboard** - View data, logs, and API usage
3. **Tailwind classes** - Use `card`, `btn-primary`, `input` for consistent UI
4. **Hot reload** - Vite auto-refreshes on file changes

---

## 🎨 UI Components

Pre-built Tailwind classes:
- `.btn-primary` - Blue button
- `.btn-secondary` - Gray button
- `.card` - White card with shadow
- `.input` - Styled text input

---

## ⏱️ Hackathon Timeline Reference

**Current Status:** End of Day 1 Morning

**Remaining:**
- [ ] AI Skill Extraction (3-4 hours)
- [ ] Matching System (3-4 hours)
- [ ] Real-time Chat (2-3 hours)
- [ ] AI Middleman Features (3-4 hours)
- [ ] Skill Legacy Graph (3-4 hours)
- [ ] Gamification (2-3 hours)
- [ ] Polish & Demo Prep (2-3 hours)

---

*Good luck with your hackathon! 🚀*
