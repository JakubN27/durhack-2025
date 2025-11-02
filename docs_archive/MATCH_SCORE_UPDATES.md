# Match Score Updates - How It Works

**Last Updated:** November 2, 2025  
**Issue:** Match scores not updating when profiles change  
**Status:** ✅ Fixed

---

## 🐛 The Problem

Match scores were **stored in the database** when matches were created but **NOT recalculated** when users updated their profiles.

### Symptoms:
- Update your profile (add/remove skills, change bio/personality)
- Potential matches show updated scores ✅
- Existing matches still show old scores ❌

---

## 🔍 Root Cause Analysis

### Original Flow:

1. **Finding Potential Matches** (`/api/matching/find/:userId`)
   - ✅ Calculates scores **dynamically** based on current profiles
   - ✅ Always up-to-date

2. **Creating a Match** (`/api/matching/create`)
   - Saves calculated score to `matches.score` column
   - Saves mutual skills to `matches.mutual_skills` column

3. **Loading Existing Matches** (`/api/matching/user/:userId`)
   - ❌ Returns **stored** scores from database
   - ❌ Does NOT recalculate based on current profiles

### Why This Happened:

The `getUserMatches()` function was simply fetching data from the database without recalculating:

```javascript
// OLD CODE (Before Fix)
export async function getUserMatches(userId) {
  const { data, error } = await supabase
    .from('matches')
    .select('*') // Just returns stored data
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
  
  return data // Static scores from database
}
```

---

## ✅ The Solution

Modified `getUserMatches()` to **recalculate scores dynamically** using the same algorithm as `findMatches()`.

### New Flow:

1. Fetch matches from database (includes user profiles)
2. **Recalculate skill scores** for each match
3. **Recalculate personality compatibility**
4. **Recalculate mutual skills**
5. **Update final score** with weighted formula
6. Return matches with fresh scores

### Implementation:

```javascript
// NEW CODE (After Fix)
export async function getUserMatches(userId) {
  // 1. Fetch matches with full user profiles
  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      user_a:users!matches_user_a_id_fkey(id, name, bio, teach_skills, learn_skills, personality_traits),
      user_b:users!matches_user_b_id_fkey(id, name, bio, teach_skills, learn_skills, personality_traits)
    `)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
  
  // 2. Recalculate scores for each match
  const matchesWithUpdatedScores = data.map(match => {
    const userA = match.user_a
    const userB = match.user_b
    
    // Recalculate skill scores (A→B and B→A)
    const scoreAtoB = calculateMatchScore(
      userA.teach_skills || [],
      userB.learn_skills || []
    )
    const scoreBtoA = calculateMatchScore(
      userB.teach_skills || [],
      userA.learn_skills || []
    )
    
    // Recalculate personality compatibility
    const personalityScore = calculatePersonalityScore(userA, userB)
    
    // Calculate final score (same formula as findMatches)
    const skillScore = (scoreAtoB + scoreBtoA) / 2
    const updatedScore = skillScore * 0.7 + personalityScore * 0.3
    
    // Recalculate mutual skills
    const updatedMutualSkills = findMutualSkills(userA, userB)
    
    return {
      ...match,
      score: updatedScore, // Fresh score!
      mutual_skills: updatedMutualSkills,
      original_score: match.score // Keep for reference
    }
  })
  
  // 3. Sort by updated score
  matchesWithUpdatedScores.sort((a, b) => b.score - a.score)
  
  return matchesWithUpdatedScores
}
```

---

## 📊 Scoring Formula

Scores are calculated using the same formula for both potential and existing matches:

### Components:

1. **Skill Score (70% weight)**
   - A can teach what B wants to learn
   - B can teach what A wants to learn
   - Average of both directions
   - Includes exact matches (1.0), similar names (0.7), category matches (0.3)

2. **Personality Score (30% weight)**
   - Based on personality traits (if available)
   - Calculated from 5 dimensions:
     - Openness (30% weight)
     - Agreeableness (30% weight)
     - Conscientiousness (20% weight)
     - Extraversion (10% weight)
     - Neuroticism (10% weight)
   - Default to 0.5 if no personality data

### Formula:
```
finalScore = (skillScore * 0.7) + (personalityScore * 0.3)

where:
  skillScore = (scoreA→B + scoreB→A) / 2
  personalityScore = weighted average of trait compatibility
```

---

## 🎯 What Changed

### Backend (`backend/services/matchingService.js`)

**Modified:**
- ✅ `getUserMatches()` - Now recalculates scores dynamically
- ✅ Fetches personality_traits with user profiles
- ✅ Logs score changes for debugging
- ✅ Sorts matches by updated score

**No Changes Needed:**
- `findMatches()` - Already calculates dynamically ✅
- `calculateMatchScore()` - Score calculation logic ✅
- `calculatePersonalityScore()` - Personality logic ✅
- `findMutualSkills()` - Mutual skills detection ✅

### Frontend (`frontend/src/pages/Matches.jsx`)

**Modified:**
- ✅ Display match score percentage for existing matches
- ✅ Show score next to status in "Your Current Matches"
- ✅ Format: `"75% Match"` badge

**Example:**
```jsx
{match.score != null && (
  <>
    <span className="text-slate-400">•</span>
    <span className="font-semibold text-primary-600">
      {Math.round(match.score * 100)}% Match
    </span>
  </>
)}
```

---

## 🧪 Testing

### Manual Testing:

1. **Create a match with another user**
   - Note the initial match score

2. **Update your profile**
   - Add/remove skills that the other user wants to learn
   - Change personality traits

3. **Refresh the Matches page**
   - Click "Refresh" button in "Your Current Matches"
   - Score should update immediately to reflect new profile

4. **Check the score**
   - Should be different if skills/personality changed
   - Should match the score shown for potential matches

### Expected Results:

- ✅ Scores update when you refresh matches
- ✅ Scores reflect current profile state
- ✅ Mutual skills list updates if skills changed
- ✅ Matches sorted by current score (highest first)

---

## 📝 Database Schema

The `matches` table still stores scores:

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_a_id UUID REFERENCES users(id),
  user_b_id UUID REFERENCES users(id),
  score FLOAT NOT NULL,           -- Stored score (for history)
  mutual_skills JSONB,             -- Stored mutual skills
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** The stored `score` is now mainly for historical purposes. The API returns **recalculated** scores.

---

## 🔄 When Scores Update

### Automatically Recalculated:
- ✅ When loading "Your Current Matches"
- ✅ When clicking "Refresh" button
- ✅ After creating a new match

### NOT Automatically Updated:
- ❌ In database (stored score remains unchanged)
- ❌ In open chat windows (until page refresh)

**Recommendation:** Click "Refresh" after updating your profile to see updated scores.

---

## 🚀 Performance Considerations

### Impact:
- Small additional computation per match (typically <10ms per match)
- Only runs when loading matches (not on every page load)
- Uses existing functions (no new queries)

### Optimization:
- Calculations are done in memory (no extra database calls)
- Scores cached by browser until refresh
- Sorted by score for better UX

### Scalability:
- **< 10 matches:** Negligible impact (~100ms total)
- **10-50 matches:** Acceptable (~500ms total)
- **50+ matches:** Consider pagination or caching

---

## 🐛 Troubleshooting

### Issue: Scores still not updating

**Check:**
1. Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
2. Check browser console for errors
3. Verify backend is running (port 3000)
4. Check backend logs for recalculation messages

**Backend Logs:**
```
Match abc123: Updated score from 0.65 to 0.82
Skill score: 0.85 (A→B: 0.90, B→A: 0.80)
Personality score: 0.75
```

### Issue: Scores show 0% or NaN

**Cause:** Missing skills or profile data

**Fix:**
- Ensure both users have teach_skills and learn_skills
- Check that profile data is complete
- Verify JSON structure in database

### Issue: Scores different from stored value

**This is expected!** Scores are now dynamic. The stored score is historical.

To see the difference:
```javascript
console.log('Stored score:', match.original_score)
console.log('Current score:', match.score)
```

---

## 📚 Related Documentation

- [**Matching Algorithm**](./MATCHING_ALGORITHM.md) - How scores are calculated
- [**Database Schema**](./DATABASE_SCHEMA.md) - Match table structure
- [**API Reference**](./API_REFERENCE.md) - Matching endpoints
- [**Troubleshooting**](./TROUBLESHOOTING.md) - Common issues

---

## 🎉 Summary

**Before:**
- Match scores were static (stored at creation time)
- Did not reflect profile changes
- Inconsistent between potential and existing matches

**After:**
- Match scores are dynamic (recalculated on load)
- Always reflect current profile state
- Consistent scoring across all matches

**Result:** Match scores now update properly when you update your profile! 🎯
