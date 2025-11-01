# SkillSwap 🎓

**AI-Powered Skill Exchange Platform** - Learn from others, teach what you know.

Built for DurHack 2025 🚀

---

## 🌟 Features

- **🎯 AI-Powered Matching** - Smart reciprocal skill pairing using vector embeddings
- **🤖 AI Skill Extraction** - Automatically extract skills from user bios with Gemini
- **💬 Real-time Chat** - Connect and learn from your matches
- **🌱 Skill Legacy** - Visualize how skills spread through the network
- **🏆 Gamification** - Earn points, badges, and achievements
- **📊 Learning Plans** - AI-generated roadmaps for skill development

---

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS
- React Router

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- pgvector for similarity search

**AI:**
- Google Gemini for skill extraction & embeddings
- Vector similarity for matching

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Gemini API key

### Setup

1. **Clone and install:**
```bash
git clone <repo-url>
cd durhack-2025
cd frontend
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