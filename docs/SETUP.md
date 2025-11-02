# SkillSwap - Complete Setup Guide

> Step-by-step instructions to get SkillSwap running locally

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 22+** (or 20.19+) - [Download](https://nodejs.org/)
- **npm** or **pnpm** - Package manager
- **Git** - Version control
- **Code Editor** - VS Code recommended
- **Supabase Account** - [Sign up free](https://supabase.com)
- **TalkJS Account** - [Sign up free](https://talkjs.com)
- **Gemini API Key** (optional) - [Get key](https://makersuite.google.com/app/apikey)

---

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/JakubN27/durhack-2025.git
cd durhack-2025
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your credentials (see detailed setup below)
```

### 4. Start Development Servers
```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:3001).

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Set a strong database password
5. Select region closest to you
6. Wait for project to be ready (~2 minutes)

### Step 2: Get Credentials
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (starts with eyJ)
   - **service_role key**: `eyJhbG...` (different from anon)

### Step 3: Run Database Migrations

#### Option A: Using Supabase SQL Editor (Recommended)
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Run each migration file in order:

**Migration 1: Create Tables**
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  skills_to_learn JSONB DEFAULT '[]'::jsonb,
  skills_to_teach JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  talkjs_conversation_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_pair UNIQUE (user1_id, user2_id)
);

-- Create matches table (optional, for tracking)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score INTEGER DEFAULT 0,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_match UNIQUE (user_id, matched_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_id, matched_user_id);
```

**Migration 2: Enable Row Level Security**
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Conversations: Users can see conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Matches: Users can see their matches
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Migration 3: Create Functions**
```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### Option B: Using Migration Files
If you have the migration files in `supabase/migrations/`:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 4: Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL** to `http://localhost:5173`
5. Add `http://localhost:5173/**` to **Redirect URLs**

---

## 💬 TalkJS Setup

### Step 1: Create TalkJS Account
1. Go to [talkjs.com](https://talkjs.com)
2. Sign up for free account
3. Create a new application

### Step 2: Get Credentials
1. Go to **Settings** → **API Keys**
2. Copy:
   - **App ID**: Your application ID
   - **Secret Key**: Your API secret key

### Step 3: Configure TalkJS
1. In TalkJS dashboard, go to **Roles**
2. Ensure "default" role exists with message permissions
3. Go to **Themes** and customize if desired (optional)

---

## 🤖 Gemini AI Setup (Optional)

### Step 1: Get API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

### Step 2: Enable API
The Gemini API is automatically enabled when you create a key.

**Note**: Gemini features are optional. The app works without it, but you'll miss:
- AI skill extraction
- Learning plan generation
- Smart match sorting

---

## ⚙️ Environment Configuration

### Backend Configuration (`backend/.env`)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# TalkJS
TALKJS_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Gemini AI (Optional)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX

# Server
PORT=3001
NODE_ENV=development
```

### Frontend Configuration (`frontend/.env`)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# TalkJS
VITE_TALKJS_APP_ID=tXXXXXXX

# API
VITE_API_URL=http://localhost:3001
```

**Important Notes**:
- Never commit `.env` files to git
- Use `.env.example` as template
- Frontend vars must start with `VITE_`
- Keep `service_role` key secret (backend only)
- Use `anon` key in frontend

---

## 🧪 Verify Setup

### 1. Check Backend
```bash
cd backend
npm run dev

# Should see:
# ✅ Server running on http://localhost:3001
# ✅ Connected to Supabase
```

Visit http://localhost:3001/health - should return `{"status":"ok"}`

### 2. Check Frontend
```bash
cd frontend
npm run dev

# Should see:
# ➜  Local:   http://localhost:5173/
```

Visit http://localhost:5173 - should see login page

### 3. Test Complete Flow
1. **Sign Up**: Create a new account
2. **Create Profile**: Add skills to learn/teach
3. **View Matches**: Should see potential matches
4. **Search**: Try searching for a skill
5. **Chat**: Click chat with a match

---

## 🐛 Common Setup Issues

### Database Connection Failed
**Problem**: Backend can't connect to Supabase
**Solution**:
- Check `SUPABASE_URL` is correct (includes https://)
- Verify `SUPABASE_SERVICE_KEY` is the service role key (not anon)
- Ensure project is not paused in Supabase dashboard

### TalkJS Not Loading
**Problem**: Chat container shows error
**Solution**:
- Verify `VITE_TALKJS_APP_ID` in frontend .env
- Check `TALKJS_SECRET_KEY` in backend .env
- Ensure TalkJS account is active
- Check browser console for specific errors

### Port Already in Use
**Problem**: `Error: listen EADDRINUSE: address already in use`
**Solution**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port in backend/.env
PORT=3002
```

### Authentication Not Working
**Problem**: Can't sign up or login
**Solution**:
- Check Supabase Auth is enabled
- Verify email provider is configured
- Check Site URL and Redirect URLs in Supabase
- Ensure RLS policies are created
- Check browser console for errors

### No Matches Showing
**Problem**: Matches page is empty
**Solution**:
- Create multiple test accounts with different skills
- Ensure profiles have both skills_to_learn and skills_to_teach
- Check backend logs for errors
- Verify database has profiles table with data

---

## 🔄 Development Workflow

### Running Both Servers
```bash
# From project root
npm run dev

# Or separately:
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2
```

### Making Changes

**Frontend Changes**:
- Edit files in `frontend/src/`
- Hot reload works automatically
- Check browser console for errors

**Backend Changes**:
- Edit files in `backend/`
- Server auto-restarts with nodemon
- Check terminal for errors

**Database Changes**:
- Create migration file in `supabase/migrations/`
- Run in Supabase SQL Editor
- Test with sample data

### Testing Changes
1. Make your changes
2. Save files (auto-reload)
3. Test in browser
4. Check console/terminal for errors
5. Commit when working

---

## 📦 Production Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy `dist/` folder
3. Set environment variables in platform
4. Update Supabase redirect URLs

### Backend Deployment (Railway/Heroku)
1. Set environment variables
2. Deploy from git repository
3. Update frontend API URL
4. Enable CORS for your domain

### Database
- Supabase handles scaling automatically
- Enable Point-in-Time Recovery for production
- Set up regular backups

---

## 🔐 Security Checklist

Before deploying:
- [ ] Change all default passwords
- [ ] Use strong, unique API keys
- [ ] Enable RLS on all tables
- [ ] Set appropriate CORS origins
- [ ] Use HTTPS in production
- [ ] Enable Supabase 2FA
- [ ] Never commit `.env` files
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring/alerts

---

## 📚 Next Steps

After setup:
1. Read `ARCHITECTURE.md` to understand the system
2. Check `TROUBLESHOOTING.md` for common issues
3. See `DEVELOPMENT.md` for contribution guidelines
4. Explore the codebase
5. Create test accounts and try features

---

## 🆘 Getting Help

If you're stuck:
1. Check `TROUBLESHOOTING.md`
2. Review setup steps carefully
3. Check browser/terminal console
4. Search existing GitHub issues
5. Create new issue with:
   - What you tried
   - Error messages
   - Environment details
   - Steps to reproduce

---

**Setup Version**: 1.0.0  
**Last Updated**: November 2025  
**Estimated Time**: 15-30 minutes
