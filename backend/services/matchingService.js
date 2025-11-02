import { supabase } from '../config/supabase.js'

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
    
    // Calculate reciprocal scores
    const matches = filteredUsers.map(otherUser => {
      // Score A→B: How well user A can teach what user B wants to learn
      const scoreAtoB = calculateMatchScore(
        user.teach_skills || [],
        otherUser.learn_skills || []
      )
      
      // Score B→A: How well user B can teach what user A wants to learn
      const scoreBtoA = calculateMatchScore(
        otherUser.teach_skills || [],
        user.learn_skills || []
      )
      
      // Reciprocal score (average of both directions)
      const reciprocalScore = (scoreAtoB + scoreBtoA) / 2
      
      // Find mutual skills (skills that match in both directions)
      const mutualSkills = findMutualSkills(user, otherUser)
      
      return {
        user_id: otherUser.id,
        user_name: otherUser.name,
        user_bio: otherUser.bio,
        avatar_url: otherUser.avatar_url,
        teach_skills: otherUser.teach_skills,
        learn_skills: otherUser.learn_skills,
        score_a_to_b: scoreAtoB,
        score_b_to_a: scoreBtoA,
        reciprocal_score: reciprocalScore,
        mutual_skills: mutualSkills
      }
    })
    
    // Sort by reciprocal score (highest first), but also prioritize users with mutual skills
    matches.sort((a, b) => {
      // Prioritize matches with mutual skills
      if (a.mutual_skills.length > 0 && b.mutual_skills.length === 0) return -1
      if (a.mutual_skills.length === 0 && b.mutual_skills.length > 0) return 1
      
      // Then sort by score
      return b.reciprocal_score - a.reciprocal_score
    })
    
    // Return top matches
    return matches.slice(0, limit)
  } catch (error) {
    console.error('Error finding matches:', error)
    throw error
  }
}

/**
 * Calculate match score between teach skills and learn skills
 */
function calculateMatchScore(teachSkills, learnSkills) {
  if (!teachSkills.length || !learnSkills.length) return 0
  
  let totalScore = 0
  let matchCount = 0
  
  for (const learnSkill of learnSkills) {
    for (const teachSkill of teachSkills) {
      // Exact match
      if (learnSkill.name.toLowerCase() === teachSkill.name.toLowerCase()) {
        totalScore += 1.0
        matchCount++
      }
      // Category match (partial score)
      else if (learnSkill.category === teachSkill.category) {
        totalScore += 0.3
      }
      // Similar skill names (contains)
      else if (
        learnSkill.name.toLowerCase().includes(teachSkill.name.toLowerCase()) ||
        teachSkill.name.toLowerCase().includes(learnSkill.name.toLowerCase())
      ) {
        totalScore += 0.7
        matchCount++
      }
    }
  }
  
  // Normalize score (0-1 range)
  const maxPossibleScore = Math.max(teachSkills.length, learnSkills.length)
  return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0
}

/**
 * Find skills that match between two users
 */
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
