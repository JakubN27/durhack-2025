# Matching Algorithm Guide

**Last Updated:** November 2, 2025

---

## Overview

SkillSwap uses an **AI-powered matching algorithm** to find compatible learning partners based on skills, personality, and bio analysis.

---

## How It Works

### 1. Skill Reciprocity (40%)

Matches users where:
- User A can teach what User B wants to learn
- User B can teach what User A wants to learn

**Scoring:**
- Exact skill match: 1.0
- Similar skill (contains): 0.7
- Category match: 0.3

**Example:**
```
User A: Teaches [Python, Django] | Learns [Japanese]
User B: Teaches [Japanese, React] | Learns [Python, Backend]

Match: Python ↔ Japanese (reciprocal) = HIGH SCORE
```

### 2. AI Bio Analysis (30%)

Gemini AI analyzes six compatibility dimensions:

**a) Bio Compatibility (15%)**
- Writing style and communication approach
- Values and interests expressed
- Life experiences and cultural references

**b) Learning Style Match (15%)**
- Pace and depth preferences
- Teaching approach compatibility
- Knowledge sharing style

**c) Personality Synergy (10%)**
- Collaboration potential
- Complementary traits
- Working style compatibility

**d) Communication (5%)**
- Communication style alignment
- Clarity and respect indicators

**e) Motivation (5%)**
- Goal alignment
- Learning aspirations
- Sustained engagement potential

**f) Cultural Overlap (tracked, not weighted)**
- Shared interests
- Hobbies and activities
- Community overlap

### 3. Basic Personality (10%)

Analyzes profile fields:
- **Personality Type:** Introvert/Extrovert (0.7-0.9)
- **Daily Rhythm:** Early bird/Night owl (0.4 or 1.0) ← Critical for scheduling!
- **Spirit Animal:** Fun personality indicator (0.6-0.8)
- **Ice Cream:** Lighthearted compatibility (0.6-0.7)
- **Bio Detail:** Engagement level (0.5-1.0)

---

## Scoring Formula

### With AI (Recommended)
```
Final Score = 
  Skill Match           × 0.40 +
  AI Bio Compatibility  × 0.15 +
  AI Learning Style     × 0.15 +
  Basic Personality     × 0.10 +
  AI Personality        × 0.10 +
  AI Communication      × 0.05 +
  AI Motivation         × 0.05
```

### Without AI (Fallback)
```
Final Score = 
  Skill Match       × 0.70 +
  Basic Personality × 0.30
```

---

## Match Prioritization

Matches are sorted by:

1. ⭐ **AI "strong" recommendations** - Bumped to top
2. 🤝 **Mutual skills present** - Reciprocal learning
3. 📈 **Highest compatibility score**
4. 🎯 **More mutual skills** - Richer exchange
5. 💡 **Higher skill match** - Tie-breaker

---

## AI Insights

Each match includes:

**✨ Compatibility Insights** (2-3 specific observations)
```
• Perfect reciprocal skill exchange (Python ↔ Japanese)
• Matching schedules enable consistent sessions
• Both show strong teaching motivation in bios
```

**⚠️ Potential Challenges** (1-2 areas to consider)
```
• Different native languages may require patience initially
```

**📊 Recommendation Strength**
- `strong` - Highly compatible, prioritized
- `moderate` - Good match, normal priority
- `weak` - Lower compatibility

---

## Example Analysis

### Input Profiles

**User A:**
```
Bio: "Senior Python developer with 10 years experience. Love teaching!"
Teaches: Python (expert), Django (advanced)
Learns: Japanese (beginner)
Personality: Introvert, Early bird
Spirit Animal: Owl
```

**User B:**
```
Bio: "Native Japanese speaker, software engineer. Want to improve Python!"
Teaches: Japanese (native), React (advanced)
Learns: Python (intermediate), Backend (beginner)
Personality: Introvert, Early bird
Spirit Animal: Cat
```

### AI Analysis Result

```json
{
  "bio_compatibility": 0.88,
  "learning_style_match": 0.85,
  "personality_synergy": 0.95,
  "communication_compatibility": 0.90,
  "motivation_alignment": 0.92,
  "cultural_overlap": 0.75,
  
  "insights": [
    "Perfect reciprocal match: Python ↔ Japanese exchange",
    "Both introverts with early bird schedule - excellent for consistent sessions",
    "Strong teaching motivation evident in both bios"
  ],
  
  "challenges": [
    "Proficiency gap in Python may require adjusted teaching approach"
  ],
  
  "recommendation": "strong"
}
```

### Score Breakdown

```
Skill Match:        0.90 × 0.40 = 0.360
AI Bio:             0.88 × 0.15 = 0.132
AI Learning:        0.85 × 0.15 = 0.128
Basic Personality:  0.95 × 0.10 = 0.095
AI Personality:     0.95 × 0.10 = 0.095
AI Communication:   0.90 × 0.05 = 0.045
AI Motivation:      0.92 × 0.05 = 0.046
─────────────────────────────────
Final Score:                0.901 (90%)
Recommendation: STRONG ✅
```

---

## API Usage

### Find Matches
```javascript
GET /api/matching/user/:userId?search=Python

Response:
{
  "success": true,
  "matches": [
    {
      "user_id": "uuid",
      "user_name": "John",
      "reciprocal_score": 0.87,
      "compatibility_breakdown": {
        "skill_match": 0.82,
        "ai_bio_compatibility": 0.85,
        "ai_learning_style": 0.78,
        "insights": [...],
        "challenges": [...],
        "recommendation": "strong"
      },
      "mutual_skills": [...]
    }
  ],
  "count": 1
}
```

---

## Performance

- **With AI:** 2-5 seconds for 10 matches (parallel processing)
- **Without AI:** ~100-200ms (instant fallback)
- **Rate Limits:** Gemini free tier = 60 requests/minute
- **Optimization:** All matches analyzed in parallel with `Promise.all()`

---

## Configuration

### Enable/Disable AI
Set in `/backend/.env`:
```bash
# With AI
GEMINI_API_KEY=AIzaSy...

# Without AI (comment out or remove)
# GEMINI_API_KEY=
```

### Adjust Weights
Edit `/backend/services/matchingService.js`:
```javascript
finalScore = (
  skillScore * 0.40 +              // Adjust these
  aiCompatibility.bio * 0.15 +     // weights as
  aiCompatibility.learning * 0.15 + // needed
  personalityScore * 0.10 +
  aiCompatibility.personality * 0.10 +
  aiCompatibility.communication * 0.05 +
  aiCompatibility.motivation * 0.05
)
```

---

## Troubleshooting

**AI not working?**
- Check `GEMINI_API_KEY` is set
- Verify rate limits (60 req/min)
- App automatically falls back to basic matching

**Low match scores?**
- Users need detailed bios
- More skills = better matching
- Complete personality questions

**Slow matching?**
- AI analysis takes 2-5 seconds
- Show loading spinner to users
- Consider caching (future enhancement)

---

## Future Enhancements

1. **Caching** - Cache AI analyses for 24 hours
2. **Feedback Loop** - Learn from successful matches
3. **ML Model** - Train custom model on match data
4. **Real-time Updates** - Re-score when profiles change
5. **Advanced Filters** - Filter by AI recommendation strength

---

## Related Files

- `/backend/services/matchingService.js` - Core algorithm
- `/backend/routes/matching.js` - API endpoints
- `/frontend/src/pages/Matches.jsx` - UI display

---

**Algorithm Version:** 2.0 (AI-Enhanced)  
**Last Updated:** November 2, 2025
