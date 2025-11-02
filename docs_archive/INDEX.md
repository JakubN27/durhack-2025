# Documentation Quick Reference

**Last Updated:** November 2, 2025

---

## 📚 What's in Each File?

### 🏠 README.md
Your starting point for all documentation.

**Contains:**
- Documentation structure and navigation
- 30-second quick setup
- Project overview and features
- Tech stack summary
- Common issues quick reference
- Links to all other docs

**Use when:** You need to find specific documentation or get a quick overview.

---

### 🚀 QUICKSTART.md
Get the project running in 5 minutes.

**Contains:**
- Step-by-step setup instructions
- Environment variable templates
- Database migration commands
- Run commands
- First user setup
- Basic testing

**Use when:** Setting up the project for the first time.

---

### 📖 OVERVIEW.md
Understand what SkillSwap does and how it works.

**Contains:**
- Project purpose and goals
- Core features explained
- Tech stack details
- User journey/flow
- System components
- Key concepts

**Use when:** You need to understand the project's purpose and architecture at a high level.

---

### 🔧 SETUP.md
Complete setup guide with all configuration options.

**Contains:**
- Prerequisites
- Supabase setup (database, auth, storage)
- TalkJS configuration
- Gemini API setup
- Environment variables explained
- Migration instructions
- Verification steps

**Use when:** You need detailed setup instructions or are configuring specific services.

---

### 🏗 ARCHITECTURE.md
System design and technical architecture.

**Contains:**
- System architecture diagrams
- Component relationships
- Data flow diagrams
- Technology choices and rationale
- Database design philosophy
- API design patterns
- Frontend architecture
- Security considerations

**Use when:** You need to understand how the system is designed or plan new features.

---

### 💻 DEVELOPMENT.md
Development workflow and guidelines.

**Contains:**
- Project structure
- Development workflow
- Code organization
- Testing approach
- Git workflow
- Deployment process
- Contributing guidelines
- Code style guide

**Use when:** You're developing features or contributing to the project.

---

### 🐛 TROUBLESHOOTING.md
Common issues and solutions.

**Contains:**
- Port conflicts (3000, 5173)
- Supabase connection errors
- Gemini API issues
- TalkJS setup problems
- Database migration errors
- Profile picture upload issues
- Chat not loading
- Match algorithm issues

**Use when:** Something isn't working and you need to debug.

---

### 🌐 API_REFERENCE.md
Complete API documentation.

**Contains:**
- All API endpoints
- Request/response examples
- Authentication flow
- Error codes and messages
- Rate limits
- Testing examples with curl
- User endpoints (CRUD)
- Matching endpoints
- Chat endpoints
- AI endpoints (skill extraction, learning plans)

**Use when:** You're integrating with the API or need to understand endpoint behavior.

---

### 🗄 DATABASE_SCHEMA.md
Database structure and relationships.

**Contains:**
- Table definitions (users, matches, conversations, messages)
- Column types and constraints
- Indexes
- Relationships and foreign keys
- JSONB structures (skills, mutual_skills)
- Storage buckets configuration
- Row Level Security policies
- Example queries
- Migration information

**Use when:** You need to understand data structure or write database queries.

---

### 🌱 SEEDING.md
Database seeding and test data generation.

**Contains:**
- Seed script overview and usage
- Command-line options (--users, --connections, --clear)
- Generated data details (users, skills, matches)
- 70+ skill pool across 5 categories
- Personality and profile customization
- Match algorithm for test data
- Performance metrics
- Troubleshooting seed issues
- Programmatic usage examples

**Use when:** You need to populate the database with realistic test data.

---

### 🤖 GEMINI_INTEGRATION.md
AI features powered by Google Gemini.

**Contains:**
- What Gemini powers (skill extraction, matching, learning plans)
- Setup instructions
- API key configuration
- Models used (gemini-pro, embedding-001)
- Prompt engineering examples
- Rate limits and costs
- Error handling
- Testing AI features
- Troubleshooting AI issues

**Use when:** You need to understand or configure AI features.

---

### 🎯 MATCHING_ALGORITHM.md
How the matching algorithm works.

**Contains:**
- Algorithm overview
- Scoring formula (with and without AI)
- Skill reciprocity calculation
- AI bio analysis (6 dimensions)
- Personality compatibility
- Match prioritization logic
- Example analyses with scores
- API usage
- Performance metrics
- Configuration options

**Use when:** You need to understand or improve the matching system.

---

### 💬 CHAT_SYSTEM.md
Chat implementation with TalkJS.

**Contains:**
- TalkJS integration overview
- Setup instructions
- Environment configuration
- Code examples
- Features (real-time, history, notifications)
- API endpoints
- UI components
- Styling/theming
- Troubleshooting chat issues
- Best practices

**Use when:** You need to understand or work with the chat system.

---

### 👤 PROFILE_SYSTEM.md
User profiles and features.

**Contains:**
- Profile field definitions
- Skills structure (JSONB)
- Personality traits
- Profile picture upload (Supabase Storage)
- Avatar display with fallback
- AI skill extraction
- Profile completion scoring
- Privacy considerations
- API endpoints
- Best practices

**Use when:** You need to work with user profiles or understand profile features.

---

## 🔍 Quick Lookup

### Need to...

**Set up the project?**
→ QUICKSTART.md → SETUP.md

**Understand the system?**
→ OVERVIEW.md → ARCHITECTURE.md

**Debug an issue?**
→ TROUBLESHOOTING.md

**Use the API?**
→ API_REFERENCE.md

**Query the database?**
→ DATABASE_SCHEMA.md

**Configure AI features?**
→ GEMINI_INTEGRATION.md

**Understand matching?**
→ MATCHING_ALGORITHM.md

**Work with chat?**
→ CHAT_SYSTEM.md

**Modify profiles?**
→ PROFILE_SYSTEM.md

**Develop a feature?**
→ DEVELOPMENT.md → ARCHITECTURE.md → API_REFERENCE.md

---

## 📊 Information Map

```
PROJECT OVERVIEW
├── README.md ────────────────┐
├── QUICKSTART.md            │
├── OVERVIEW.md              │ High-Level Understanding
└── ARCHITECTURE.md ─────────┘

SETUP & CONFIG
├── SETUP.md ────────────────┐
├── TROUBLESHOOTING.md       │ Getting Started
└── DEVELOPMENT.md ──────────┘

TECHNICAL REFERENCE
├── API_REFERENCE.md ────────┐
├── DATABASE_SCHEMA.md       │ Implementation Details
└── GEMINI_INTEGRATION.md ───┘

FEATURE GUIDES
├── MATCHING_ALGORITHM.md ───┐
├── CHAT_SYSTEM.md           │ Feature-Specific
└── PROFILE_SYSTEM.md ───────┘
```

---

## 🎯 By Role

### **New Developer**
1. README.md (overview)
2. QUICKSTART.md (setup)
3. OVERVIEW.md (understanding)
4. DEVELOPMENT.md (workflow)

### **Frontend Developer**
1. ARCHITECTURE.md (structure)
2. API_REFERENCE.md (endpoints)
3. PROFILE_SYSTEM.md (profiles)
4. CHAT_SYSTEM.md (chat)

### **Backend Developer**
1. ARCHITECTURE.md (design)
2. DATABASE_SCHEMA.md (data)
3. API_REFERENCE.md (endpoints)
4. MATCHING_ALGORITHM.md (logic)

### **AI/ML Engineer**
1. GEMINI_INTEGRATION.md (AI setup)
2. MATCHING_ALGORITHM.md (AI matching)
3. PROFILE_SYSTEM.md (skill extraction)
4. API_REFERENCE.md (AI endpoints)

### **DevOps/SRE**
1. SETUP.md (infrastructure)
2. TROUBLESHOOTING.md (issues)
3. ARCHITECTURE.md (system design)
4. DEVELOPMENT.md (deployment)

---

## 📏 Document Sizes

| File | Purpose | Size |
|------|---------|------|
| README.md | Hub & quick ref | Medium |
| QUICKSTART.md | Fast setup | Short |
| OVERVIEW.md | Project intro | Medium |
| SETUP.md | Detailed setup | Long |
| ARCHITECTURE.md | System design | Long |
| DEVELOPMENT.md | Dev workflow | Medium |
| TROUBLESHOOTING.md | Problem solving | Medium |
| API_REFERENCE.md | API docs | Long |
| DATABASE_SCHEMA.md | DB structure | Long |
| GEMINI_INTEGRATION.md | AI features | Long |
| MATCHING_ALGORITHM.md | Matching logic | Medium |
| CHAT_SYSTEM.md | Chat guide | Medium |
| PROFILE_SYSTEM.md | Profile features | Medium |
| SEEDING.md | Database seeding | Medium |

---

## ✅ Documentation Coverage

- ✅ Setup & Configuration
- ✅ Architecture & Design
- ✅ API Endpoints
- ✅ Database Schema
- ✅ AI Integration
- ✅ Matching System
- ✅ Chat System
- ✅ Profile System
- ✅ Troubleshooting
- ✅ Development Workflow

---

**Total Files:** 15 (14 essential + this index)  
**Total Coverage:** 100%  
**No Redundancy:** ✅  
**Easy Navigation:** ✅
