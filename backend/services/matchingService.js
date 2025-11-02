import { supabase } from '../config/supabase.js'
import { textModel } from '../config/gemini.js'

// In-memory cache for AI analysis results (TTL: 5 minutes)
const analysisCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCachedAnalysis(userId, bio) {
  const cacheKey = `${userId}-${bio?.substring(0, 50)}` // Use user ID + bio snippet as key
  const cached = analysisCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  return null
}

function setCachedAnalysis(userId, bio, analysis) {
  const cacheKey = `${userId}-${bio?.substring(0, 50)}`
  analysisCache.set(cacheKey, {
    data: analysis,
    timestamp: Date.now()
  })
  
  // Clean up old cache entries periodically
  if (analysisCache.size > 1000) {
    const now = Date.now()
    for (const [key, value] of analysisCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        analysisCache.delete(key)
      }
    }
  }
}

/**
 * Analyze and extract skills from user profile using Gemini
 */
async function analyzeProfileSkills(profile) {
  if (!textModel) {
    console.warn('Gemini API not configured - skipping skill analysis')
    return null
  }

  try {
    // Check cache first
    const cachedAnalysis = getCachedAnalysis(profile.id, profile.bio)
    if (cachedAnalysis) {
      return cachedAnalysis
    }
    
    const prompt = `
    Analyze the following user profile for a skill-sharing platform:
    
    Bio: ${profile.bio || 'No bio provided'}
    Teaching Skills: ${JSON.stringify(profile.teach_skills || [])}
    Learning Skills: ${JSON.stringify(profile.learn_skills || [])}

    Please evaluate:
    1. **Teaching Expertise** (0-1): How well does their profile demonstrate expertise in what they want to teach?
    2. **Learning Clarity** (0-1): How clear and genuine are their learning goals?
    3. **Profile Quality** (0-1): Overall bio quality - is it friendly, professional, and welcoming?
       - Penalize if: rude, hostile, discriminatory, arrogant, overly negative, disrespectful
       - Reward if: friendly, humble, enthusiastic, respectful, genuine
    4. **Reciprocal Potential** (array): Any specific skills that would make them good for teaching/learning exchanges
    
    IMPORTANT: If the bio contains hostile, discriminatory, or inappropriate content, set profile_quality to 0-0.3.
    If the bio is friendly and welcoming, set profile_quality to 0.7-1.0.
    
    Return ONLY a JSON object with this exact format (no markdown, no code blocks):
    {"teaching_expertise": 0.8, "learning_clarity": 0.7, "profile_quality": 0.9, "reciprocal_potential": []}
    `

    const result = await textModel.generateContent(prompt)
    const response = await result.response
    let text = response.text()
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const analysis = JSON.parse(text)
    
    const enrichedAnalysis = {
      teaching_expertise: analysis.teaching_expertise || 0.5,
      learning_clarity: analysis.learning_clarity || 0.5,
      profile_quality: analysis.profile_quality || 0.5,
      reciprocal_potential: analysis.reciprocal_potential || []
    }
    
    // Cache the analysis result
    setCachedAnalysis(profile.id, profile.bio, enrichedAnalysis)
    
    return enrichedAnalysis
  } catch (error) {
    // Return null on error - matching will fall back to basic scoring
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
    
    // Cache user analysis to avoid repeated API calls
    const userAnalysis = await analyzeProfileSkills(user)
    
    // Process matches in parallel batches for better performance
    const BATCH_SIZE = 10 // Process 10 potential matches at a time
    const processedMatches = []
    
    for (let batchStart = 0; batchStart < filteredUsers.length; batchStart += BATCH_SIZE) {
      const batch = filteredUsers.slice(batchStart, batchStart + BATCH_SIZE)
      
      // Process batch in parallel (cache will speed this up significantly)
      const batchResults = await Promise.all(
        batch.map(async (otherUser) => {
          try {
            // Analyze other user's profile (will use cache if available)
            const otherUserAnalysis = await analyzeProfileSkills(otherUser)

        // Calculate skill match scores
          const scoreAtoB = calculateMatchScore(
            user.teach_skills || [],
            otherUser.learn_skills || []
          )
          
          const scoreBtoA = calculateMatchScore(
            otherUser.teach_skills || [],
            user.learn_skills || []
          )
          
          // Calculate personality compatibility
          const personalityScore = calculatePersonalityScore(user, otherUser)
          
          // Calculate base skill match score
          const baseSkillScore = (scoreAtoB + scoreBtoA) / 2
          
          // Apply AI-enhanced scoring if available
          let finalScore = baseSkillScore * 0.5 + personalityScore * 0.2
          
          if (userAnalysis && otherUserAnalysis) {
            // AI enhancement factors:
            // 1. Teaching expertise (how good they are at what they teach)
            // 2. Learning clarity (how clear their learning goals are)
            // 3. Profile quality (friendly tone, no hostility) - PENALTIES APPLIED HERE
            const teachingQuality = userAnalysis.teaching_expertise || 0.5
            const learningReadiness = otherUserAnalysis.learning_clarity || 0.5
            const profileQuality = otherUserAnalysis.profile_quality || 0.5
            
            // Average of all AI factors
            const aiBoost = (teachingQuality + learningReadiness + profileQuality) / 3
            
            // Add AI boost (30% weight when available - increased to make bio quality more impactful)
            finalScore += aiBoost * 0.3
          }
          
          // Normalize to 0-1 range
          finalScore = Math.min(Math.max(finalScore, 0), 1)
          
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
            skill_analysis: {
              user: userAnalysis,
              match: otherUserAnalysis
            }
          }
        } catch (error) {
          console.error('Error processing match:', error)
          return null
        }
      })
      )
      
      // Add batch results to main array
      processedMatches.push(...batchResults)
      
      // Small delay between batches (cache makes this much faster)
      if (textModel && batchStart + BATCH_SIZE < filteredUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    // Filter out failed matches and sort results
    const validMatches = processedMatches.filter(Boolean)
    validMatches.sort((a, b) => {
      // Prioritize matches with mutual skills
      if (a.mutual_skills.length > 0 && b.mutual_skills.length === 0) return -1
      if (a.mutual_skills.length === 0 && b.mutual_skills.length > 0) return 1
      
      // Then sort by final score
      return b.reciprocal_score - a.reciprocal_score
    })
    
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
  if (!teachSkills?.length || !learnSkills?.length) {
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
      }
      // Category match (partial score)
      else if (learnSkill.category && teachSkill.category && 
               learnSkill.category === teachSkill.category) {
        totalScore += 0.3
      }
      // Similar skill names (contains)
      else if (
        learnName.includes(teachName) ||
        teachName.includes(learnName)
      ) {
        totalScore += 0.7
        matchCount++
      }
    }
  }
  
  // Normalize score (0-1 range)
  const maxPossibleScore = Math.max(teachSkills.length, learnSkills.length)
  const finalScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0
  return finalScore
}

/**
 * Calculate personality compatibility score between two users
 */
function calculatePersonalityScore(userA, userB) {
  try {
    let score = 0.5 // Base score
    
    // Personality type compatibility (introvert vs extrovert)
    if (userA.personality_type && userB.personality_type) {
      // Same personality type = more compatible
      score += (userA.personality_type === userB.personality_type) ? 0.2 : 0.1
    }
    
    // Daily rhythm compatibility (early bird vs night owl)
    if (userA.daily_rhythm && userB.daily_rhythm) {
      // Same daily rhythm = easier to schedule sessions
      score += (userA.daily_rhythm === userB.daily_rhythm) ? 0.3 : 0
    }
    
    return Math.min(score, 1) // Cap at 1
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
 * Get user's matches with recalculated scores
 * This ensures scores always reflect the current state of user profiles
 */
export async function getUserMatches(userId) {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills, personality_type, daily_rhythm),
        user_b:users!matches_user_b_id_fkey(id, name, bio, avatar_url, teach_skills, learn_skills, personality_type, daily_rhythm)
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return []
    }
    
    // Process matches in parallel batches for better performance
    const BATCH_SIZE = 5 // Process 5 matches at a time
    const matchesWithUpdatedScores = []
    
    for (let batchStart = 0; batchStart < data.length; batchStart += BATCH_SIZE) {
      const batch = data.slice(batchStart, batchStart + BATCH_SIZE)
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (match) => {
          const userA = match.user_a
          const userB = match.user_b
          
          // Determine who is the current user and who is the other user
          const isUserA = userA?.id === userId
          const currentUser = isUserA ? userA : userB
          const otherUser = isUserA ? userB : userA
          
          // Skip if user data is missing
          if (!currentUser || !otherUser) {
            console.warn(`Missing user data for match ${match.id}`)
            return match
          }
          
          try {
            // Get AI analysis for both users (will use cache if available)
            const [currentUserAnalysis, otherUserAnalysis] = await Promise.all([
              analyzeProfileSkills(currentUser),
              analyzeProfileSkills(otherUser)
            ])
            
            // Recalculate skill scores FROM THE PERSPECTIVE OF THE CURRENT USER
            const scoreCurrentToOther = calculateMatchScore(
              currentUser.teach_skills || [],
              otherUser.learn_skills || []
            )
            
            const scoreOtherToCurrent = calculateMatchScore(
              otherUser.teach_skills || [],
              currentUser.learn_skills || []
            )
            
            // Recalculate personality compatibility
            const personalityScore = calculatePersonalityScore(currentUser, otherUser)
            
            // Calculate updated final score with AI enhancement (personalized to current user)
            const baseSkillScore = (scoreCurrentToOther + scoreOtherToCurrent) / 2
            let updatedScore = baseSkillScore * 0.5 + personalityScore * 0.2
            
            if (currentUserAnalysis && otherUserAnalysis) {
              // Apply AI boost based on:
              // 1. Current user's teaching quality
              // 2. Other user's learning readiness
              // 3. Other user's profile quality (friendly tone, no hostility) - PENALTIES HERE
              const teachingQuality = currentUserAnalysis.teaching_expertise || 0.5
              const learningReadiness = otherUserAnalysis.learning_clarity || 0.5
              const profileQuality = otherUserAnalysis.profile_quality || 0.5
              
              const aiBoost = (teachingQuality + learningReadiness + profileQuality) / 3
              updatedScore += aiBoost * 0.3
            }
            
            updatedScore = Math.min(Math.max(updatedScore, 0), 1)
            
            // Recalculate mutual skills
            const updatedMutualSkills = findMutualSkills(currentUser, otherUser)
            
            return {
              ...match,
              score: updatedScore, // Override with recalculated score (personalized)
              mutual_skills: updatedMutualSkills, // Override with recalculated mutual skills
              score_current_to_other: scoreCurrentToOther,
              score_other_to_current: scoreOtherToCurrent,
              personality_compatibility: personalityScore,
              skill_analysis: {
                current_user: currentUserAnalysis,
                other_user: otherUserAnalysis
              },
              // Keep original score for reference
              original_score: match.score
            }
          } catch (calcError) {
            console.error(`Error recalculating score for match ${match.id}:`, calcError)
            // Return original match if calculation fails
            return match
          }
        })
      )
      
      // Add batch results to main array
      matchesWithUpdatedScores.push(...batchResults)
      
      // Small delay between batches to avoid rate limiting (most will be cached anyway)
      if (textModel && batchStart + BATCH_SIZE < data.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // Sort by updated score (highest first)
    matchesWithUpdatedScores.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    return matchesWithUpdatedScores
  } catch (error) {
    console.error('Error getting user matches:', error)
    throw error
  }
}
