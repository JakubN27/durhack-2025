import { supabase } from '../config/supabase.js'
import { textModel } from '../config/gemini.js'

/**
 * Analyze and extract skills from user profile using Gemini
 */
async function analyzeProfileSkills(profile) {
  if (!textModel) {
    console.warn('Gemini API not configured - skipping skill analysis')
    return null
  }

  try {
    const prompt = `
    Analyze the following user profile and extract relevant skills for a skill-sharing platform:
    Bio: ${profile.bio || ''}
    Teaching Skills: ${JSON.stringify(profile.teach_skills || [])}
    Learning Skills: ${JSON.stringify(profile.learn_skills || [])}

    Please evaluate:
    1. The depth of expertise in teaching skills (score 0-1)
    2. The clarity of learning goals (score 0-1)
    3. The potential for reciprocal learning relationships
    
    Return the analysis in JSON format.
    `

    const result = await textModel.generateContent(prompt)
    const response = await result.response
    const analysis = JSON.parse(response.text())
    
    return {
      teaching_expertise: analysis.teaching_expertise || 0,
      learning_clarity: analysis.learning_clarity || 0,
      reciprocal_potential: analysis.reciprocal_potential || []
    }
  } catch (error) {
    console.error('Error analyzing profile with Gemini:', error)
    return null
  }
}

/**
 * Analyze compatibility between two users using Gemini AI
 * Considers bio, personality traits, and behavioral patterns
 */
async function analyzeCompatibilityWithAI(userA, userB) {
  if (!textModel) {
    console.warn('Gemini API not configured - skipping AI compatibility analysis')
    return null
  }

  try {
    const prompt = `
You are an expert matchmaking AI analyzing compatibility between two users on a skill-sharing platform.

USER A PROFILE:
Name: ${userA.name || 'User A'}
Bio: ${userA.bio || 'No bio provided'}
Teaching Skills: ${JSON.stringify(userA.teach_skills || [])}
Learning Skills: ${JSON.stringify(userA.learn_skills || [])}
Personality: ${userA.personality_type || 'not specified'}
Daily Rhythm: ${userA.daily_rhythm || 'not specified'}
Spirit Animal: ${userA.spirit_animal || 'not specified'}
Favorite Ice Cream: ${userA.favorite_ice_cream || 'not specified'}

USER B PROFILE:
Name: ${userB.name || 'User B'}
Bio: ${userB.bio || 'No bio provided'}
Teaching Skills: ${JSON.stringify(userB.teach_skills || [])}
Learning Skills: ${JSON.stringify(userB.learn_skills || [])}
Personality: ${userB.personality_type || 'not specified'}
Daily Rhythm: ${userB.daily_rhythm || 'not specified'}
Spirit Animal: ${userB.spirit_animal || 'not specified'}
Favorite Ice Cream: ${userB.favorite_ice_cream || 'not specified'}

Analyze the following aspects and provide scores from 0 to 1:

1. **Bio Compatibility** (0-1): Analyze writing style, communication approach, interests, and values expressed in the bios. Look for complementary perspectives, shared passions, or mutual interests that would facilitate learning together.

2. **Learning Style Match** (0-1): Based on the bios and personality traits, assess whether their learning and teaching styles would complement each other. Consider pace, depth, and approach to knowledge sharing.

3. **Personality Synergy** (0-1): Evaluate how well their personality traits (introvert/extrovert) and daily rhythms (early bird/night owl) align for productive collaboration. Note: similar personalities can work well, and complementary personalities can also be highly compatible.

4. **Communication Compatibility** (0-1): Assess how well they would communicate based on their bios, personality types, and expressed interests. Look for indicators of clear communication, mutual respect, and collaborative potential.

5. **Motivation Alignment** (0-1): Evaluate whether their goals, aspirations, and reasons for learning (as expressed in bios) are compatible and would support sustained engagement.

6. **Cultural and Interest Overlap** (0-1): Analyze any shared interests, cultural references, hobbies, or life experiences mentioned in their bios that could strengthen their connection.

Additionally provide:
- **compatibility_insights**: Array of 2-3 specific observations about why they would (or wouldn't) work well together
- **potential_challenges**: Array of 1-2 potential challenges in their learning partnership
- **recommendation_strength**: "strong", "moderate", or "weak"

Return ONLY a valid JSON object in this exact format:
{
  "bio_compatibility": 0.85,
  "learning_style_match": 0.78,
  "personality_synergy": 0.92,
  "communication_compatibility": 0.88,
  "motivation_alignment": 0.75,
  "cultural_overlap": 0.70,
  "compatibility_insights": ["insight 1", "insight 2"],
  "potential_challenges": ["challenge 1"],
  "recommendation_strength": "strong"
}
    `.trim()

    const result = await textModel.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()
    
    // Handle markdown code blocks
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '')
    }
    
    const analysis = JSON.parse(text)
    
    // Validate and ensure all required fields exist
    return {
      bio_compatibility: analysis.bio_compatibility || 0.5,
      learning_style_match: analysis.learning_style_match || 0.5,
      personality_synergy: analysis.personality_synergy || 0.5,
      communication_compatibility: analysis.communication_compatibility || 0.5,
      motivation_alignment: analysis.motivation_alignment || 0.5,
      cultural_overlap: analysis.cultural_overlap || 0.5,
      compatibility_insights: analysis.compatibility_insights || [],
      potential_challenges: analysis.potential_challenges || [],
      recommendation_strength: analysis.recommendation_strength || 'moderate'
    }
  } catch (error) {
    console.error('Error analyzing compatibility with Gemini:', error)
    return null
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Find reciprocal matches for a user
 * Match users where A can teach what B wants to learn, and vice versa
 * Enhanced with personality compatibility and skill analysis
 */
export async function findMatches(userId, limit = 10, searchSkill = null) {
  try {
    // Get the user's profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }

    if (!user) {
      console.warn(`[Matching] No profile row for user ${userId}; returning empty matches`)
      return []
    }
    
    // Get all other users (don't require embeddings)
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', userId)
    
    if (usersError) throw usersError
    if (!allUsers || allUsers.length === 0) {
      return []
    }
    
    // Filter by search skill if provided
    let filteredUsers = allUsers
    if (searchSkill) {
      const searchLower = searchSkill.toLowerCase()
      filteredUsers = allUsers.filter(otherUser => {
        const teachSkills = (otherUser.teach_skills || []).map(s => s.name.toLowerCase())
        const learnSkills = (otherUser.learn_skills || []).map(s => s.name.toLowerCase())
        const userName = (otherUser.name || '').toLowerCase()
        
        return teachSkills.some(skill => skill.includes(searchLower)) ||
               learnSkills.some(skill => skill.includes(searchLower)) ||
               userName.includes(searchLower)
      })
    }
    
    // Process matches with enhanced AI-powered analysis
    const processedMatches = await Promise.all(
      filteredUsers.map(async otherUser => {
        try {
          // Calculate basic skill match scores
          const scoreAtoB = calculateMatchScore(
            user.teach_skills || [],
            otherUser.learn_skills || []
          )
          
          const scoreBtoA = calculateMatchScore(
            otherUser.teach_skills || [],
            user.learn_skills || []
          )
          
          const skillScore = (scoreAtoB + scoreBtoA) / 2
          
          // Calculate basic personality compatibility
          const personalityScore = calculatePersonalityScore(user, otherUser)
          
          // Get AI-powered compatibility analysis (if available)
          const aiCompatibility = await analyzeCompatibilityWithAI(user, otherUser)
          
          let finalScore
          let compatibilityBreakdown = {}
          
          if (aiCompatibility) {
            // Enhanced scoring with AI analysis
            // Weight distribution:
            // - Skill Match: 40%
            // - AI Bio Compatibility: 15%
            // - AI Learning Style: 15%
            // - Basic Personality: 10%
            // - AI Personality Synergy: 10%
            // - AI Communication: 5%
            // - AI Motivation: 5%
            
            finalScore = (
              skillScore * 0.40 +
              aiCompatibility.bio_compatibility * 0.15 +
              aiCompatibility.learning_style_match * 0.15 +
              personalityScore * 0.10 +
              aiCompatibility.personality_synergy * 0.10 +
              aiCompatibility.communication_compatibility * 0.05 +
              aiCompatibility.motivation_alignment * 0.05
            )
            
            compatibilityBreakdown = {
              skill_match: skillScore,
              basic_personality: personalityScore,
              ai_bio_compatibility: aiCompatibility.bio_compatibility,
              ai_learning_style: aiCompatibility.learning_style_match,
              ai_personality_synergy: aiCompatibility.personality_synergy,
              ai_communication: aiCompatibility.communication_compatibility,
              ai_motivation: aiCompatibility.motivation_alignment,
              ai_cultural_overlap: aiCompatibility.cultural_overlap,
              insights: aiCompatibility.compatibility_insights,
              challenges: aiCompatibility.potential_challenges,
              recommendation: aiCompatibility.recommendation_strength
            }
            
            console.log(`[Match] ${user.name} ↔ ${otherUser.name}:`)
            console.log(`  Skill: ${(skillScore * 100).toFixed(1)}% | Personality: ${(personalityScore * 100).toFixed(1)}%`)
            console.log(`  AI Bio: ${(aiCompatibility.bio_compatibility * 100).toFixed(1)}% | AI Learning: ${(aiCompatibility.learning_style_match * 100).toFixed(1)}%`)
            console.log(`  Final Score: ${(finalScore * 100).toFixed(1)}% | Recommendation: ${aiCompatibility.recommendation_strength}`)
          } else {
            // Fallback to basic scoring without AI
            finalScore = skillScore * 0.70 + personalityScore * 0.30
            
            compatibilityBreakdown = {
              skill_match: skillScore,
              basic_personality: personalityScore,
              ai_enabled: false
            }
            
            console.log(`[Match] ${user.name} ↔ ${otherUser.name} (Basic):`)
            console.log(`  Skill: ${(skillScore * 100).toFixed(1)}% | Personality: ${(personalityScore * 100).toFixed(1)}%`)
            console.log(`  Final Score: ${(finalScore * 100).toFixed(1)}%`)
          }
          
          // Find mutual skills
          const sharedSkills = findMutualSkills(user, otherUser)
          
          return {
            user_id: otherUser.id,
            user_name: otherUser.name,
            user_bio: otherUser.bio,
            avatar_url: otherUser.avatar_url,
            teach_skills: otherUser.teach_skills,
            learn_skills: otherUser.learn_skills,
            score_a_to_b: scoreAtoB,
            score_b_to_a: scoreBtoA,
            reciprocal_score: finalScore,
            mutual_skills: sharedSkills,
            personality_compatibility: personalityScore,
            compatibility_breakdown: compatibilityBreakdown
          }
        } catch (error) {
          console.error('Error processing match:', error)
          return null
        }
      })
    )

    // Filter out failed matches and sort results with intelligent prioritization
    const validMatches = processedMatches.filter(Boolean)
    
    validMatches.sort((a, b) => {
      // 1. Prioritize AI "strong" recommendations
      const aStrong = a.compatibility_breakdown?.recommendation === 'strong'
      const bStrong = b.compatibility_breakdown?.recommendation === 'strong'
      if (aStrong && !bStrong) return -1
      if (!aStrong && bStrong) return 1
      
      // 2. Prioritize matches with mutual skills (reciprocal learning)
      if (a.mutual_skills.length > 0 && b.mutual_skills.length === 0) return -1
      if (a.mutual_skills.length === 0 && b.mutual_skills.length > 0) return 1
      
      // 3. Sort by final compatibility score
      if (Math.abs(b.reciprocal_score - a.reciprocal_score) > 0.01) {
        return b.reciprocal_score - a.reciprocal_score
      }
      
      // 4. Tie-breaker: prefer more mutual skills
      if (a.mutual_skills.length !== b.mutual_skills.length) {
        return b.mutual_skills.length - a.mutual_skills.length
      }
      
      // 5. Final tie-breaker: higher skill match score
      return b.score_a_to_b + b.score_b_to_a - (a.score_a_to_b + a.score_b_to_a)
    })
    
    console.log(`[Matching] Found ${validMatches.length} matches for user ${userId}, returning top ${limit}`)
    
    // Return top matches
    return validMatches.slice(0, limit)
  } catch (error) {
    console.error('Error finding matches:', error)
    throw error
  }
}

/**
 * Calculate match score between teach skills and learn skills
 */
function calculateMatchScore(teachSkills, learnSkills) {
  // Log skills for debugging
  console.log('Teaching skills:', teachSkills)
  console.log('Learning skills:', learnSkills)
  
  if (!teachSkills?.length || !learnSkills?.length) {
    console.log('No skills to match')
    return 0
  }
  
  let totalScore = 0
  let matchCount = 0
  
  for (const learnSkill of learnSkills) {
    if (!learnSkill?.name) continue
    
    for (const teachSkill of teachSkills) {
      if (!teachSkill?.name) continue
      
      const learnName = learnSkill.name.toLowerCase()
      const teachName = teachSkill.name.toLowerCase()
      
      // Exact match
      if (learnName === teachName) {
        totalScore += 1.0
        matchCount++
        console.log(`Exact match found: ${teachName}`)
      }
      // Category match (partial score)
      else if (learnSkill.category && teachSkill.category && 
               learnSkill.category === teachSkill.category) {
        totalScore += 0.3
        console.log(`Category match found: ${learnSkill.category}`)
      }
      // Similar skill names (contains)
      else if (
        learnName.includes(teachName) ||
        teachName.includes(learnName)
      ) {
        totalScore += 0.7
        matchCount++
        console.log(`Similar skills found: ${teachName} - ${learnName}`)
      }
    }
  }
  
  // Normalize score (0-1 range)
  const maxPossibleScore = Math.max(teachSkills.length, learnSkills.length)
  const finalScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0
  console.log(`Match score: ${finalScore} (total: ${totalScore}, max: ${maxPossibleScore})`)
  return finalScore
}

/**
 * Calculate personality compatibility score between two users
 * Enhanced with personality type, daily rhythm, and interest-based matching
 */
function calculatePersonalityScore(userA, userB) {
  try {
    let scores = []
    
    // 1. Personality Type Compatibility (introvert/extrovert)
    if (userA.personality_type && userB.personality_type) {
      // Both introverts or both extroverts = good match
      // One of each can also work well (complementary)
      const sameType = userA.personality_type === userB.personality_type
      scores.push(sameType ? 0.9 : 0.7) // Similar or complementary both work
    }
    
    // 2. Daily Rhythm Compatibility (early bird/night owl)
    if (userA.daily_rhythm && userB.daily_rhythm) {
      // Matching rhythms is important for scheduling sessions
      const sameRhythm = userA.daily_rhythm === userB.daily_rhythm
      scores.push(sameRhythm ? 1.0 : 0.4) // Same rhythm is strongly preferred
    }
    
    // 3. Spirit Animal Similarity (fun personality indicator)
    if (userA.spirit_animal && userB.spirit_animal) {
      const sameAnimal = userA.spirit_animal.toLowerCase() === userB.spirit_animal.toLowerCase()
      scores.push(sameAnimal ? 0.8 : 0.6) // Bonus for shared spirit animal
    }
    
    // 4. Ice Cream Preference (lighthearted compatibility indicator)
    if (userA.favorite_ice_cream && userB.favorite_ice_cream) {
      const sameFlavor = userA.favorite_ice_cream.toLowerCase() === userB.favorite_ice_cream.toLowerCase()
      scores.push(sameFlavor ? 0.7 : 0.6) // Small bonus for shared taste
    }
    
    // 5. Bio length and detail level (indicates engagement)
    const bioLengthA = (userA.bio || '').length
    const bioLengthB = (userB.bio || '').length
    if (bioLengthA > 0 && bioLengthB > 0) {
      // Users with detailed bios tend to be more engaged
      const avgLength = (bioLengthA + bioLengthB) / 2
      const detailScore = Math.min(avgLength / 200, 1.0) // Max score at 200+ chars
      scores.push(0.5 + (detailScore * 0.5)) // 0.5 to 1.0 range
    }
    
    // 6. Fallback to personality traits if available (from old system)
    const traitsA = userA.personality_traits || {}
    const traitsB = userB.personality_traits || {}
    
    if (Object.keys(traitsA).length > 0 && Object.keys(traitsB).length > 0) {
      const compatibilityScores = {
        openness: 1 - Math.abs((traitsA.openness || 3) - (traitsB.openness || 3)) / 5,
        conscientiousness: 1 - Math.abs((traitsA.conscientiousness || 3) - (traitsB.conscientiousness || 3)) / 5,
        extraversion: 1 - Math.abs((traitsA.extraversion || 3) - (traitsB.extraversion || 3)) / 5,
        agreeableness: 1 - Math.abs((traitsA.agreeableness || 3) - (traitsB.agreeableness || 3)) / 5,
        neuroticism: 1 - Math.abs((traitsA.neuroticism || 3) - (traitsB.neuroticism || 3)) / 5
      }
      
      const weights = {
        openness: 0.3,
        conscientiousness: 0.2,
        extraversion: 0.1,
        agreeableness: 0.3,
        neuroticism: 0.1
      }
      
      let traitScore = 0
      for (const trait in weights) {
        if (compatibilityScores[trait] !== undefined) {
          traitScore += compatibilityScores[trait] * weights[trait]
        }
      }
      scores.push(traitScore)
    }
    
    // Calculate average of all available scores
    if (scores.length === 0) {
      return 0.5 // Default neutral score
    }
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    console.log(`Personality compatibility scores:`, {
      individual_scores: scores,
      average: avgScore,
      userA_type: userA.personality_type,
      userB_type: userB.personality_type,
      userA_rhythm: userA.daily_rhythm,
      userB_rhythm: userB.daily_rhythm
    })
    
    return avgScore
  } catch (error) {
    console.error('Error calculating personality score:', error)
    return 0.5 // Default to neutral score on error
  }
}

function findMutualSkills(userA, userB) {
  const mutualSkills = []
  
  // A teaches what B wants to learn
  for (const teachSkill of (userA.teach_skills || [])) {
    for (const learnSkill of (userB.learn_skills || [])) {
      if (teachSkill.name.toLowerCase() === learnSkill.name.toLowerCase()) {
        mutualSkills.push({
          skill: teachSkill.name,
          teacher: userA.name,
          learner: userB.name,
          direction: 'you_teach', // You (userA) can teach them (userB)
          teacherId: userA.id,
          learnerId: userB.id
        })
      }
    }
  }
  
  // B teaches what A wants to learn
  for (const teachSkill of (userB.teach_skills || [])) {
    for (const learnSkill of (userA.learn_skills || [])) {
      if (teachSkill.name.toLowerCase() === learnSkill.name.toLowerCase()) {
        mutualSkills.push({
          skill: teachSkill.name,
          teacher: userB.name,
          learner: userA.name,
          direction: 'they_teach', // They (userB) can teach you (userA)
          teacherId: userB.id,
          learnerId: userA.id
        })
      }
    }
  }
  
  return mutualSkills
}

/**
 * Create a match in the database
 * Checks if match already exists and returns it instead of creating a duplicate
 */
export async function createMatch(userAId, userBId, score, mutualSkills) {
  try {
    // First, check if match already exists (in either direction)
    const { data: existingMatch, error: checkError } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills)
      `)
      .or(`and(user_a_id.eq.${userAId},user_b_id.eq.${userBId}),and(user_a_id.eq.${userBId},user_b_id.eq.${userAId})`)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is fine
      throw checkError
    }
    
    // If match exists, return it with a flag indicating it wasn't created
    if (existingMatch) {
      return {
        ...existingMatch,
        created: false
      }
    }
    
    // No existing match, create a new one
    const { data, error } = await supabase
      .from('matches')
      .insert({
        user_a_id: userAId,
        user_b_id: userBId,
        score: score,
        mutual_skills: mutualSkills,
        status: 'pending',
        chat_enabled: true, // Explicitly enable chat
        conversation_id: `match-${userAId}-${userBId}` // Generate conversation ID
      })
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills)
      `)
      .single()
    
    if (error) throw error
    
    // Also create conversation entry for TalkJS integration
    try {
      await supabase
        .from('conversations')
        .insert({
          match_id: data.id,
          talkjs_conversation_id: `match-${data.id}`,
          participants: [userAId, userBId]
        })
      console.log(`[Match] Created conversation for match ${data.id}`)
    } catch (convError) {
      // Log but don't fail - conversation can be created later
      console.error('[Match] Error creating conversation:', convError)
    }
    
    return {
      ...data,
      created: true
    }
  } catch (error) {
    console.error('Error creating match:', error)
    throw error
  }
}

/**
 * Get user's matches
 */
export async function getUserMatches(userId) {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills)
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting user matches:', error)
    throw error
  }
}
