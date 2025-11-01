# SkillSwap Development Plan

This markdown file outlines a step-by-step plan for developing SkillSwap, your AI-powered skill exchange app. Follow along using GitHub Copilot or other tools for guidance.

---

## 1. Setup & Project Initialization

1. **Create a new GitHub repository**
   ```bash
   git init skillswap
   cd skillswap
   ```
2. **Initialize frontend and backend**
   - Frontend: React + TailwindCSS
     ```bash
     npx create-react-app frontend
     cd frontend
     npm install tailwindcss
     ```
   - Backend: Supabase + pgvector
     ```bash
     # Create Supabase project
     # Enable pgvector extension
     ```
3. **Setup environment variables**
   - Supabase URL & Key
   - AI API keys (Gemini / OpenAI)

---

## 2. Database Design

Tables:
- `users` (id, name, bio, teach_skills, learn_skills, embeddings)
- `matches` (id, user_a_id, user_b_id, score, mutual_skills)
- `sessions` (id, match_id, date, notes, progress)
- `achievements` (id, user_id, badge_name, points)

Notes:
- Use pgvector for embeddings storage for AI matching.

---

## 3. Skill Profile & AI Extraction

1. **Frontend input**: Free-text user bio and skills
2. **Backend**: Send bio to AI model to extract structured skills + proficiency
3. **Store** structured data in `users` table
4. **Generate embeddings** for matching

Copilot Tip: Use AI to suggest skill parsing and JSON formatting.

---

## 4. Matching System

1. **Reciprocal Matching Logic**
   - Compute cosine similarity between `teach_skills` of user A and `learn_skills` of user B, and vice versa
   - Compute `reciprocal_score = (score_ab + score_ba)/2`
2. **Query top matches from database**
3. **Display matches on frontend**

Copilot Tip: Implement the similarity calculation as a helper function in Python/TypeScript.

---

## 5. Chat System

1. **Implement internal messaging** using Supabase Realtime or WebSocket
2. **Store messages** in `sessions` table or a separate `messages` table
3. **Link chats to matches**

Copilot Tip: Generate React components for chat UI and WebSocket hooks.

---

## 6. AI Middleman / Embedded Guidance

1. **Session analysis**:
   - Detect engagement/motivation cues from messages or activity
2. **Generate nudges**:
   - "Your buddy seems discouraged, consider suggesting a small exercise"
3. **Learning plan generation**:
   - Multi-session roadmap JSON: topics per week, exercises, milestones
4. **Session summaries**:
   - AI-generated brief recap after each session

Copilot Tip: Write prompts for AI summarization and plan generation; structure outputs as JSON.

---

## 7. Skill Legacy Visualization

1. **Build graph**:
   - Nodes: users
   - Edges: skill exchanges
   - Edge weight: number of sessions / skill impact
2. **Interactive features**:
   - Click node to see user skills and badges
   - Zoom/pan view
3. **Metrics**:
   - Total learners reached
   - Skills propagated

Copilot Tip: Use D3.js or React Flow for interactive graph generation.

---

## 8. Gamification

1. **Points System**:
   - Earn points for teaching, completing sessions, achieving milestones
2. **Badges & Achievements**:
   - Assign badges when specific conditions met
   - Example: "Legacy Builder" badge when skills reach 5 learners
3. **Levels / Progress**:
   - Track mastery per skill
4. **AI Suggestions**:
   - Recommend next badge / goal to achieve

Copilot Tip: Use backend triggers or server-side functions to update points/badges automatically.

---

## 9. Frontend Dashboard

Components:
- User profile & skills
- Suggested matches
- Chat with skill buddy
- Learning plan & session summaries
- Skill legacy graph
- Points & badges display

Copilot Tip: Generate reusable React components for profile, cards, lists, and graphs.

---

## 10. Demo Setup

1. **Create two demo users** with complementary skills
2. **Run a mock session**:
   - Show AI nudge, learning plan, session summary
3. **Display skill legacy graph**
4. **Show gamification rewards & badges**

---

## 11. Optional Bonus Features

- AI-generated resource suggestions
- Cultural or domain crossover highlights
- Leaderboard of top contributors
- Learning style recommendations

---

## 12. Hackathon Timeline (36–48h)

**Day 1:**
- Setup project & database
- Implement skill profile input & AI extraction
- Implement basic matching system
- Build chat system

**Day 2:**
- Integrate AI middleman (nudges, plans, summaries)
- Add skill legacy visualization
- Add gamification (points, badges)
- Polish frontend UI
- Prepare demo flow & slides

---

## 13. Notes & Copilot Tips

- Use Copilot for:
  - Generating database schema migration scripts
  - AI prompts and JSON output parsing
  - React component scaffolding
  - Helper functions for vector similarity and scoring
- Focus on **embedded AI**, not chatbots, for polish and originality.

---

*End of SkillSwap Development Plan.*

