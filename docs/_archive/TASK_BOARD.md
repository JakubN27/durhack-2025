# SkillSwap - Task Assignment Board

## 🎯 Quick Reference - Who Does What

**Team:** 3 Developers + 1 Designer

---

## 🎨 Designer: UX/UI Lead & Presentation
**Your Mission:** Create beautiful, cohesive design and lead presentation

### Phase 1 (Hours 0-8) - CRITICAL ⚡
```
[ ] Create design system (colors, fonts, spacing)
[ ] Design Home/Login page (high-fidelity)
[ ] Design Profile page with skill display
[ ] Design Dashboard layout
[ ] Create component library (buttons, cards, inputs)
[ ] Export assets and design tokens
[ ] Design Matches page
[ ] Design Chat interface
[ ] Design badge/achievement displays
[ ] Design skill legacy graph concept
```

### Phase 2 (Hours 8-20)
```
[ ] Review implementations with Dev 2
[ ] Create micro-interaction specs
[ ] Design empty/error states
[ ] Design loading animations
[ ] Create icon set
[ ] Design achievement badges (assets)
[ ] Create graph styling/themes
[ ] Design notification UI
[ ] Create marketing assets
```

### Phase 3 (Hours 20-32)
```
[ ] Review all implementations
[ ] Create presentation slides
[ ] Design demo flow visuals
[ ] Final UI tweaks with Dev 2
[ ] Create promotional graphics
[ ] Screenshot all features
[ ] Design pitch deck
[ ] Prepare demo script visuals
```

### Phase 4 (Hours 32-36)
```
[ ] Finalize presentation deck
[ ] Practice demo narration
[ ] Lead presentation rehearsal
[ ] Prepare talking points
[ ] Time the presentation
```

**Files:** `design/**`, `frontend/public/assets/**`, `docs/presentation/**`

## 👤 Developer 1: Backend & AI + Matching Lead
**Your Mission:** Build the brain of SkillSwap + matching algorithm

### Phase 1 (Hours 0-8) - CRITICAL ⚡
```
[ ] Set up Express backend server
[ ] Integrate Gemini AI
[ ] Create /api/skills/extract endpoint
[ ] Create /api/embeddings/generate endpoint
[ ] Test with sample bios
[ ] Implement matching algorithm
[ ] Create /api/matching/find/:userId endpoint
[ ] Build reciprocal score calculation
```

### Phase 2 (Hours 8-20)
```
[ ] Create /api/ai/learning-plan endpoint
[ ] Create /api/ai/session-summary endpoint
[ ] Add AI nudges/motivations
[ ] Optimize performance
[ ] Add error handling
[ ] Help team with API integration
```

### Phase 3 (Hours 20-32)
```
[ ] Add rate limiting
[ ] Optimize database queries
[ ] Add request validation
[ ] Error logging
[ ] Create demo data
[ ] API documentation
[ ] Performance monitoring
```

**Files:** `backend/**`, all backend services and routes

---

## 👤 Developer 2: Frontend Lead (Full-Stack Frontend)
**Your Mission:** Implement designer's vision across all pages

### Phase 1 (Hours 0-8) - CRITICAL ⚡
```
[x] Auth flow (DONE)
[ ] Wait for Designer's system (Hour 2)
[ ] Implement design system in Tailwind
[ ] Build reusable components from design
[ ] Rebuild Profile page to match designs
[ ] Connect Profile to AI API
[ ] Display extracted skills beautifully
[ ] Build Dashboard layout from designs
[ ] Create Matches page UI
```

### Phase 2 (Hours 8-20)
```
[ ] Display AI-generated learning plans
[ ] Build session history view
[ ] Create progress tracking UI
[ ] Implement Designer's refinements
[ ] Dashboard statistics with real data
[ ] Profile editing improvements
[ ] Settings page
[ ] Connect Matches page to API
[ ] Responsive design
[ ] Animation implementation
```

### Phase 3 (Hours 20-32)
```
[ ] Implement Designer's final tweaks
[ ] Add micro-interactions
[ ] Loading skeletons
[ ] Error/empty states from designs
[ ] Responsive fixes
[ ] Accessibility improvements
[ ] Animation polish
[ ] Session management UI
```

**Files:** `frontend/src/pages/**`, `frontend/src/components/**`

---

## 👤 Developer 3: Real-time & Gamification Lead
**Your Mission:** Enable communication and show impact

### Phase 1 (Hours 0-8)
```
[ ] Research Supabase Realtime docs
[ ] Plan chat architecture
[ ] Research D3.js/React Flow
[ ] Wait for Designer's chat mockup (Hour 4)
[ ] Build Chat UI from designs
[ ] Set up Supabase Realtime
[ ] Implement message sending/receiving
[ ] Start Skill Legacy Graph
```

### Phase 2 (Hours 8-20) - CRITICAL ⚡
```
[ ] Complete chat functionality
[ ] Build interactive graph visualization
[ ] Track skill propagation
[ ] Create Badge components from designs
[ ] Build Points tracking system
[ ] Achievement display UI
[ ] Typing indicators
[ ] Read receipts
[ ] Unread badges
[ ] Notifications
```

### Phase 3 (Hours 20-32)
```
[ ] Session creation flow
[ ] Session scheduling
[ ] Session notes/progress
[ ] AI session summaries display
[ ] Badge auto-awarding
[ ] Leaderboard sorting
[ ] Achievement notifications
[ ] Celebration animations
[ ] Graph polish
```

**Files:** `frontend/src/pages/Chat.jsx`, `frontend/src/components/SkillGraph.jsx`, `frontend/src/services/`

---

## 📊 Progress Tracking

### Hour 2 Checkpoint:
- [ ] Designer: Initial designs ready
- [ ] Dev 1: Backend setup started
- [ ] Dev 2: Ready to implement designs
- [ ] Dev 3: Architecture planned

### Hour 4 Checkpoint:
- [ ] Designer: Core screens complete
- [ ] Dev 1: AI extraction working
- [ ] Dev 2: Profile page in progress
- [ ] Dev 3: Chat UI started

### Hour 8 Checkpoint:
- [ ] Designer: All screens designed
- [ ] Dev 1: All AI endpoints working + matching
- [ ] Dev 2: Dashboard complete
- [ ] Dev 3: Chat + graph prototypes ready

### Hour 16 Checkpoint:
- [ ] Designer: Assets exported, reviewing implementations
- [ ] Dev 1: API stable and documented
- [ ] Dev 2: All pages functional
- [ ] Dev 3: Chat working, gamification integrated

### Hour 24 Checkpoint:
- [ ] All integrations complete
- [ ] Bug fixing only from here

### Hour 32 Checkpoint:
- [ ] Demo ready
- [ ] Presentation prepared
- [ ] Designer leading rehearsal

---

## 🔥 Priority Matrix

### MUST HAVE (P0):
1. Auth (DONE) ✅
2. Design System (Designer) - Hour 0-2
3. AI Skill Extraction (Dev 1)
4. Profile with Skills (Dev 2)
5. Matching System (Dev 1)
6. Basic Chat (Dev 3)
7. Skill Legacy Graph (Dev 3)
8. Presentation (Designer)

### SHOULD HAVE (P1):
- Learning plans (Dev 1)
- Dashboard stats (Dev 2)
- Session tracking (Dev 3)
- Points system (Dev 3)
- Polished UI (Dev 2 + Designer)

### NICE TO HAVE (P2):
- AI nudges (Dev 1)
- Micro-animations (Dev 2)
- Typing indicators (Dev 3)
- Leaderboard (Dev 3)

---

## 🚨 Blockers & Dependencies

### Designer blocks until:
- Nothing! Can start immediately

### Dev 2 partially blocked until:
- Designer finishes initial designs (Hour 2)
- Dev 1 finishes AI extraction API (Hour 4)

### Dev 1 independent:
- Can start backend immediately

### Dev 3 blocked until:
- Designer provides chat/graph mockups (Hour 4)
- Dev 1 finishes AI API (Hour 4)

---

## 💡 Quick Tips

### Designer:
- Design system first - this guides everything!
- Export assets in multiple formats
- Create component specs for developers
- Think about animations and micro-interactions early

### Dev 1:
- Start with backend ASAP - others depend on you!
- Test AI API early to avoid rate limits
- Document your API endpoints clearly
- Use mock data for testing

### Dev 2:
- Wait for design system before building UI
- Use Tailwind to match designs exactly
- Build reusable components
- Focus on responsive design from the start

### Dev 3:
- Most complex features - start planning early
- Supabase Realtime docs are your friend
- React Flow is easier than D3.js for graphs
- Test real-time features early

---

## 📞 When to Ask for Help

### Ask Designer if:
- Need clarification on designs
- Component behavior unclear
- Color/spacing questions
- Animation specifications needed

### Ask Dev 1 if:
- API endpoint not working
- Need different API response format
- AI extraction not accurate
- Matching algorithm questions

### Ask Dev 2 if:
- Need new UI component
- Styling questions
- Responsive design help
- Component integration

### Ask Dev 3 if:
- Real-time chat issues
- Graph visualization problems
- Gamification logic questions
- Performance optimization

---

## 🎬 Demo Script (Hour 32+)

### All Team Participates - Designer Leads:

**Demo Flow (5-7 minutes):**
1. **Designer:** Introduce the vision and problem (30 sec)
2. **Dev 2:** Show landing page, sign up (30 sec)
3. **Dev 2:** Create profile with bio (30 sec)
4. **Dev 1:** AI extracts skills - explain the tech (45 sec)
5. **Dev 1:** Show matches page with reciprocal scoring (45 sec)
6. **Dev 3:** Connect with a match, show chat (45 sec)
7. **Dev 3:** Show skill legacy graph - visual impact (60 sec)
8. **Dev 3:** Show badges earned (30 sec)
9. **Dev 1:** Show AI-generated learning plan (45 sec)
10. **Designer:** Closing remarks and impact (30 sec)

**Roles:**
- **Designer:** Narration & slides
- **Dev 2:** Screen control & clicking
- **Dev 1:** Technical explanations
- **Dev 3:** Feature demonstrations

---

**Print this and put it on your desk! 📋**

*Remember: Communication is key. Update the team every 2 hours!*
