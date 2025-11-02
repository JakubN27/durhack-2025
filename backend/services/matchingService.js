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
    
    // Process matches with enhanced analysis
    const processedMatches = await Promise.all(
      filteredUsers.map(async otherUser => {
        try {
          // Analyze both profiles using Gemini
          const [userAnalysis, otherUserAnalysis] = await Promise.all([
            analyzeProfileSkills(user),
            analyzeProfileSkills(otherUser)
          ])

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
          
          // Calculate final weighted score with logging
          const skillScore = (scoreAtoB + scoreBtoA) / 2
          console.log(`Skill score: ${skillScore} (A→B: ${scoreAtoB}, B→A: ${scoreBtoA})`)
          console.log(`Personality score: ${personalityScore}`)
          const finalScore = skillScore * 0.7 + personalityScore * 0.3
          console.log(`Final match score: ${finalScore}`)
          
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
 */
function calculatePersonalityScore(userA, userB) {
  try {
    // Extract personality traits
    const traitsA = userA.personality_traits || {}
    const traitsB = userB.personality_traits || {}
    
    // Log personality traits for debugging
    console.log('Personality traits A:', traitsA)
    console.log('Personality traits B:', traitsB)
    
    // Calculate trait compatibility scores with default values
    const compatibilityScores = {
      openness: 1 - Math.abs((traitsA.openness || 3) - (traitsB.openness || 3)) / 5,
      conscientiousness: 1 - Math.abs((traitsA.conscientiousness || 3) - (traitsB.conscientiousness || 3)) / 5,
      extraversion: 1 - Math.abs((traitsA.extraversion || 3) - (traitsB.extraversion || 3)) / 5,
      agreeableness: 1 - Math.abs((traitsA.agreeableness || 3) - (traitsB.agreeableness || 3)) / 5,
      neuroticism: 1 - Math.abs((traitsA.neuroticism || 3) - (traitsB.neuroticism || 3)) / 5
    }
    
    // Calculate weighted average of compatibility scores
    const weights = {
      openness: 0.3,      // Values diversity and learning
      conscientiousness: 0.2,  // Reliability in teaching/learning
      extraversion: 0.1,   // Communication style match
      agreeableness: 0.3,  // Collaboration potential
      neuroticism: 0.1    // Emotional stability
    }
    
    let totalScore = 0
    let totalWeight = 0
    
    for (const trait in weights) {
      if (compatibilityScores[trait] !== undefined) {
        totalScore += compatibilityScores[trait] * weights[trait]
        totalWeight += weights[trait]
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0.5
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
        user_a:users!matches_user_a_id_fkey(id, name, bio, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, teach_skills, learn_skills)
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
        user_a:users!matches_user_a_id_fkey(id, name, bio, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, teach_skills, learn_skills)
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
        user_a:users!matches_user_a_id_fkey(id, name, bio, teach_skills, learn_skills),
        user_b:users!matches_user_b_id_fkey(id, name, bio, teach_skills, learn_skills)
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
