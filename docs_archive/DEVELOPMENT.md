# SkillSwap Development Guide

> **Complete guide for SkillSwap development workflow, team organization, and contribution guidelines.**

## Table of Contents
1. [Team Structure](#team-structure)
2. [Development Workflow](#development-workflow)
3. [Git & Version Control](#git--version-control)
4. [Project Structure](#project-structure)
5. [Development Phases](#development-phases)
6. [Task Management](#task-management)
7. [Code Standards](#code-standards)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Team Structure

### Team Size
**3 Developers + 1 Designer**

### Roles & Responsibilities

#### 🎨 Designer: UX/UI Lead & Presentation
**Focus:** Design System, Mockups, User Flows, Branding, Presentation

**Key Responsibilities:**
- Create and maintain design system
- Design all user interfaces and flows
- Produce high-fidelity mockups
- Create visual assets and icons
- Lead presentation and demo
- Create pitch deck and marketing materials

**Tools:** Figma, Sketch, Adobe XD

---

#### 👤 Developer 1: Backend & AI Lead
**Focus:** AI Services, Database, API Endpoints, Matching Algorithm

**Key Responsibilities:**
- Backend API server (Express.js)
- Gemini AI integration
- Skill extraction and embedding generation
- Matching algorithm implementation
- Database schema and migrations
- API documentation

**Tech Stack:**
- Node.js + Express
- Supabase (PostgreSQL)
- Google Gemini AI
- pgvector for embeddings

**Files:**
- `backend/**`
- `supabase/migrations/**`

---

#### 👤 Developer 2: Frontend Lead
**Focus:** UI Implementation, Components, Profile, Dashboard, Integration

**Key Responsibilities:**
- Implement design system in code
- Build all pages and components
- Connect frontend to backend APIs
- State management
- Responsive design
- Animation implementation

**Tech Stack:**
- React 18
- React Router
- TailwindCSS
- Vite

**Files:**
- `frontend/src/pages/**`
- `frontend/src/components/**`
- `frontend/src/styles/**`

---

#### 👤 Developer 3: Real-time & Gamification Lead
**Focus:** Real-time Chat, Skill Legacy Graph, Points/Badges

**Key Responsibilities:**
- TalkJS chat integration
- Real-time features with Supabase Realtime
- Skill legacy graph visualization
- Gamification system (badges, points)
- Achievement tracking
- Notifications

**Tech Stack:**
- TalkJS SDK
- Supabase Realtime
- D3.js or React Flow
- React

**Files:**
- `frontend/src/pages/Chat.jsx`
- `frontend/src/pages/Conversations.jsx`
- `frontend/src/components/achievements/**`
- `frontend/src/components/graph/**`

---

## Development Workflow

### Daily Standup (15 minutes)
**When:** Start of each development session

**Format:**
1. What did you complete?
2. What are you working on now?
3. Any blockers?

**Goal:** Keep team aligned and unblock issues quickly

---

### Branch Strategy

#### Main Branches
```
main          - Production-ready code
development   - Integration branch
feature/*     - Individual features
fix/*         - Bug fixes
docs/*        - Documentation updates
```

#### Branch Naming Convention
```
feature/chat-integration
feature/ai-skill-extraction
fix/profile-500-error
docs/api-documentation
```

---

### Development Cycle

#### 1. Pick a Task
- Check `TASK_BOARD.md` for your role
- Assign task to yourself
- Move to "In Progress"

#### 2. Create Branch
```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

#### 3. Develop & Commit
```bash
# Make changes
git add .
git commit -m "feat: add chat container component"

# Push to remote
git push origin feature/your-feature-name
```

#### 4. Test Locally
```bash
# Run full stack
npm run dev

# Test your feature
# Check for errors in console/logs
```

#### 5. Create Pull Request
- Open PR from your branch to `development`
- Fill PR template with:
  - What changed
  - Why it changed
  - How to test
  - Screenshots (if UI)

#### 6. Code Review
- At least one team member reviews
- Address feedback
- Merge when approved

#### 7. Integration Testing
- Test on `development` branch
- Verify integration with other features

#### 8. Deploy to Main
- When development is stable
- Merge development → main
- Deploy to production

---

## Git & Version Control

### Commit Message Format

Use conventional commits:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```bash
git commit -m "feat(chat): add TalkJS integration"
git commit -m "fix(profile): handle missing user data"
git commit -m "docs: update API documentation"
git commit -m "refactor(matching): optimize algorithm performance"
```

---

### Merge Conflict Resolution

#### When Conflicts Occur:
```bash
# Update your branch with latest development
git checkout development
git pull origin development
git checkout your-feature-branch
git rebase development

# If conflicts, resolve manually
# Edit conflicted files
git add .
git rebase --continue

# Force push (your branch only!)
git push origin your-feature-branch --force
```

#### For package-lock.json Conflicts:
```bash
# Use the newer version (usually from development)
git checkout --theirs package-lock.json
git add package-lock.json

# Or regenerate
rm package-lock.json
npm install
git add package-lock.json
```

---

## Project Structure

```
durhack-2025/
├── backend/                    # Backend API server
│   ├── routes/                # API route handlers
│   │   ├── users.js          # User endpoints
│   │   ├── matching.js       # Matching endpoints
│   │   ├── chat.js           # Chat endpoints
│   │   └── notifications.js  # Notification endpoints
│   ├── services/             # Business logic
│   │   ├── matchingService.js
│   │   └── aiService.js
│   ├── middleware/           # Express middleware
│   ├── server.js             # Entry point
│   └── .env                  # Environment variables
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Matches.jsx
│   │   │   ├── Conversations.jsx
│   │   │   └── Chat.jsx
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── ProfileForm.jsx
│   │   │   └── MatchCard.jsx
│   │   ├── lib/              # Utilities
│   │   │   └── supabase.js
│   │   ├── styles/           # CSS files
│   │   └── App.jsx           # Root component
│   ├── public/               # Static assets
│   └── .env                  # Environment variables
│
├── supabase/                  # Database
│   └── migrations/           # SQL migrations
│       └── *.sql
│
├── scripts/                   # Utility scripts
│   └── setup-chat-db.sh
│
├── docs/                      # Documentation
│   ├── OVERVIEW.md           # Project overview
│   ├── SETUP.md              # Setup guide
│   ├── ARCHITECTURE.md       # Technical architecture
│   ├── TROUBLESHOOTING.md    # Issue resolution
│   ├── DEVELOPMENT.md        # This file
│   └── [legacy docs]         # Original documentation
│
├── package.json              # Root package file
└── README.md                 # Project readme
```

---

## Development Phases

### Phase 1: Foundation (Hours 0-8) 🚀

#### Designer Priority (CRITICAL)
- [ ] Create design system (colors, typography, spacing)
- [ ] Design Home/Login page (high-fidelity)
- [ ] Design Profile page with skill display
- [ ] Design Dashboard layout
- [ ] Create component library (buttons, cards, inputs)
- [ ] Export assets and design tokens

#### Developer 1 (Backend & AI)
- [x] Database schema (DONE)
- [x] Supabase configuration (DONE)
- [ ] Set up backend API server (Express)
- [ ] Implement Gemini AI integration
- [ ] Create skill extraction endpoint
- [ ] Create embedding generation endpoint
- [ ] Implement matching algorithm
- [ ] Build reciprocal score calculation

#### Developer 2 (Frontend)
- [x] React app setup (DONE)
- [x] Authentication flow (DONE)
- [x] Home/Login page (DONE)
- [ ] Implement design system (Tailwind config)
- [ ] Build reusable components from design
- [ ] Rebuild Profile page to match designs
- [ ] Connect Profile to AI extraction API
- [ ] Build Dashboard layout
- [ ] Create Matches page UI

#### Developer 3 (Real-time & Gamification)
- [ ] Research Supabase Realtime
- [ ] Plan chat architecture
- [ ] Research D3.js/React Flow for graphs
- [ ] Design badge data structure
- [ ] Build Chat UI from designs
- [ ] Set up Supabase Realtime subscriptions

---

### Phase 2: Core Features (Hours 8-20) ⚡

#### Designer
- [ ] Review implemented designs
- [ ] Create micro-interaction specs
- [ ] Design empty states
- [ ] Design error states
- [ ] Design loading animations
- [ ] Create icon set
- [ ] Design achievement badges (visual assets)
- [ ] Create graph styling/themes

#### Developer 1
- [ ] Create AI learning plan endpoint
- [ ] Create AI session summary endpoint
- [ ] Add AI nudges/motivations
- [ ] Optimize performance
- [ ] Add error handling
- [ ] Help team with API integration

#### Developer 2
- [ ] Display AI-generated learning plans
- [ ] Build session history view
- [ ] Create progress tracking UI
- [ ] Implement designer's refinements
- [ ] Dashboard statistics with real data
- [ ] Profile editing improvements
- [ ] Connect Matches page to API

#### Developer 3
- [ ] Complete real-time chat
- [ ] Implement message sending/receiving
- [ ] Build Skill Legacy Graph
- [ ] Create interactive visualization
- [ ] Create Badge components
- [ ] Build Points tracking system
- [ ] Achievement display UI

---

### Phase 3: Polish & Integration (Hours 20-32) ✨

#### Designer
- [ ] Review all implementations
- [ ] Create presentation slides
- [ ] Design demo flow visuals
- [ ] Final UI tweaks
- [ ] Create promotional graphics
- [ ] Screenshot all features
- [ ] Design pitch deck

#### Developer 1
- [ ] Add rate limiting
- [ ] Optimize database queries
- [ ] Add request validation
- [ ] Error logging
- [ ] Create demo data
- [ ] API documentation
- [ ] Performance monitoring

#### Developer 2
- [ ] Implement final tweaks
- [ ] Add micro-interactions
- [ ] Loading skeletons
- [ ] Error/empty states
- [ ] Responsive fixes
- [ ] Accessibility improvements
- [ ] Animation polish

#### Developer 3
- [ ] Chat polish (read receipts, typing indicators)
- [ ] Graph animations and interactions
- [ ] Notification system polish
- [ ] Achievement unlock animations
- [ ] Integration testing

---

### Phase 4: Testing & Presentation (Hours 32-36) 🎯

#### Whole Team
- [ ] End-to-end testing
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] Presentation rehearsal
- [ ] Demo script preparation
- [ ] Create demo accounts
- [ ] Record demo video (backup)
- [ ] Final polish

#### Designer
- [ ] Finalize presentation deck
- [ ] Practice demo narration
- [ ] Lead presentation rehearsal
- [ ] Prepare talking points

---

## Task Management

### Using TASK_BOARD.md

The `TASK_BOARD.md` file is your daily reference. It breaks down tasks by:
- Role (Designer, Dev 1, Dev 2, Dev 3)
- Phase (1-4)
- Priority (🔥 Critical, ⚡ High, 📌 Medium)

**Workflow:**
1. Open `TASK_BOARD.md`
2. Find your role section
3. Work through tasks in order of priority
4. Check off completed tasks
5. Update at end of each session

---

### Task States

```
[ ] Not Started
[.] In Progress
[x] Complete
[-] Blocked
[?] Needs Clarification
```

---

### Dependency Management

**Critical Path:**
1. Designer creates designs → Dev 2 implements
2. Dev 1 creates APIs → Dev 2 & 3 integrate
3. Database migrations → Backend restart → Frontend testing

**Parallel Work:**
- Designer & Dev 1 can work simultaneously
- Dev 2 & Dev 3 can work on different features
- Documentation can happen alongside development

---

## Code Standards

### JavaScript/React Style

#### Component Structure
```javascript
// 1. Imports
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// 2. Component Definition
export default function ComponentName() {
  // 3. State
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // 4. Effects
  useEffect(() => {
    fetchData()
  }, [])
  
  // 5. Functions
  const fetchData = async () => {
    // Implementation
  }
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

#### Naming Conventions
```javascript
// Components: PascalCase
ProfileForm.jsx
MatchCard.jsx

// Functions: camelCase
fetchUserData()
calculateMatchScore()

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000'

// Files: kebab-case for utilities
skill-extraction.js
match-algorithm.js
```

---

### API Design

#### Endpoint Structure
```
GET    /api/resource          # List all
GET    /api/resource/:id      # Get one
POST   /api/resource          # Create
PUT    /api/resource/:id      # Update
DELETE /api/resource/:id      # Delete
```

#### Response Format
```javascript
// Success
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "Error message",
  "details": "Additional context"
}
```

---

### Error Handling

#### Backend
```javascript
try {
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) throw error
  
  res.json({ success: true, data })
} catch (error) {
  console.error('[Users] Error:', error)
  res.status(500).json({
    success: false,
    error: error.message
  })
}
```

#### Frontend
```javascript
try {
  const response = await fetch('/api/users')
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error)
  }
  
  setUsers(data.data)
} catch (error) {
  console.error('[Users] Error:', error)
  setError(error.message)
}
```

---

### Console Logging

Use consistent prefixes for debugging:
```javascript
// Component name in brackets
console.log('[Profile] Loading user data...')
console.log('[Chat] Initializing TalkJS...')
console.error('[Matches] Failed to fetch:', error)

// Use emojis for visibility
console.log('✅ Chat initialized successfully!')
console.error('❌ Failed to load profile')
console.warn('⚠️ Using cached data')
```

---

## Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Sign up with new email
- [ ] Sign in with existing email
- [ ] Log out
- [ ] Protected routes redirect to login

#### Profile
- [ ] Create new profile
- [ ] Update existing profile
- [ ] Add skills (teach/learn)
- [ ] Save profile
- [ ] Profile persists after refresh

#### Matching
- [ ] Find matches
- [ ] View match details
- [ ] Create match
- [ ] Match appears in conversations

#### Chat
- [ ] Open conversation
- [ ] Send message
- [ ] Receive message (test with 2 users)
- [ ] Messages persist
- [ ] Unread count updates

#### Edge Cases
- [ ] Empty states (no matches, no conversations)
- [ ] Error states (API failure, network error)
- [ ] Loading states
- [ ] Very long text in messages/bios
- [ ] Special characters in input

---

### Testing Tools

```bash
# Backend testing
curl http://localhost:3000/api/users/USER_ID

# Frontend console
console.log('Test:', data)

# Network tab (F12)
# Check API calls and responses

# React DevTools
# Inspect component state and props
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Documentation updated
- [ ] Demo data prepared

### Environment Setup

#### Production Environment Variables
```bash
# Backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
TALKJS_APP_ID=your-talkjs-app-id
TALKJS_SECRET_KEY=your-talkjs-secret-key

# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_TALKJS_APP_ID=your-talkjs-app-id
VITE_API_URL=https://your-backend.com
```

### Build Commands

```bash
# Build frontend
cd frontend
npm run build

# Build backend (if applicable)
cd backend
npm run build

# Deploy
# Follow your hosting provider's instructions
```

---

## Best Practices

### Code Review Checklist

#### Reviewer
- [ ] Code follows style guide
- [ ] No console.logs in production code
- [ ] Error handling present
- [ ] Comments explain complex logic
- [ ] Tests pass
- [ ] No breaking changes

#### Author
- [ ] Self-review before requesting review
- [ ] Update documentation if needed
- [ ] Test locally
- [ ] Include screenshots for UI changes
- [ ] Link related issues/tasks

---

### Communication

#### Daily Updates
Post in team chat:
- What you completed
- What you're working on
- Any blockers
- ETA for current task

#### Asking for Help
Include:
- What you're trying to do
- What you've tried
- Error messages/screenshots
- Relevant code snippets

#### Pair Programming
- Schedule 30-60 minute sessions
- Great for complex features
- Knowledge sharing
- Faster debugging

---

## Quick Reference

### Common Commands
```bash
# Start development
npm run dev

# Backend only
cd backend && npm start

# Frontend only
cd frontend && npm run dev

# Database migration
./scripts/setup-chat-db.sh

# Kill stuck processes
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend

# Git shortcuts
git status                      # Check changes
git add .                       # Stage all
git commit -m "message"         # Commit
git push                        # Push to remote
git pull origin development     # Update branch
```

### Useful Links
- Supabase Dashboard: https://supabase.com/dashboard
- TalkJS Dashboard: https://talkjs.com/dashboard
- Figma Designs: [Your Figma Link]
- GitHub Repo: [Your GitHub Link]
- API Documentation: http://localhost:3000/

---

**Last Updated:** January 2025  
**Maintained By:** SkillSwap Development Team  
**Questions?** Check `TROUBLESHOOTING.md` or ask in team chat
