// Database Seed Script
// Creates sample users with skills and matches for testing

import { supabase } from './config/supabase.js'
import { generateEmbedding } from './config/gemini.js'

// Sample data pools
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Sebastian',
  'Emily', 'Jack', 'Elizabeth', 'Michael', 'Sofia', 'Daniel', 'Avery', 'Matthew'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Hall'
]

const techSkills = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Django', 'Flask',
  'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git',
  'Machine Learning', 'Data Science', 'DevOps', 'GraphQL', 'REST API',
  'Vue.js', 'Angular', 'Next.js', 'Express', 'Redis', 'Microservices'
]

const creativeSkills = [
  'Guitar', 'Piano', 'Photography', 'Video Editing', 'Graphic Design',
  'UI/UX Design', 'Drawing', 'Painting', 'Digital Art', 'Animation',
  'Music Production', 'Singing', 'Dancing', 'Writing', 'Creative Writing'
]

const businessSkills = [
  'Marketing', 'Sales', 'Project Management', 'Leadership', 'Public Speaking',
  'Negotiation', 'Business Strategy', 'Finance', 'Accounting', 'Entrepreneurship',
  'Product Management', 'Agile', 'Scrum', 'Analytics', 'SEO'
]

const languageSkills = [
  'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean',
  'Italian', 'Portuguese', 'Russian', 'Arabic', 'Hindi', 'English'
]

const otherSkills = [
  'Cooking', 'Baking', 'Yoga', 'Fitness', 'Running', 'Swimming',
  'Chess', 'Meditation', 'Gardening', 'Woodworking', 'Knitting'
]

const allSkills = [
  ...techSkills.map(s => ({ name: s, category: 'Programming Languages' })),
  ...creativeSkills.map(s => ({ name: s, category: 'Music & Arts' })),
  ...businessSkills.map(s => ({ name: s, category: 'Business & Marketing' })),
  ...languageSkills.map(s => ({ name: s, category: 'Language' })),
  ...otherSkills.map(s => ({ name: s, category: 'Other' }))
]

const spiritAnimals = [
  'Owl', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Fox', 'Dolphin',
  'Cat', 'Dog', 'Rabbit', 'Dragon', 'Phoenix', 'Panda', 'Elephant'
]

const iceCreams = [
  'Vanilla', 'Chocolate', 'Strawberry', 'Mint Chocolate Chip', 'Cookie Dough',
  'Rocky Road', 'Pistachio', 'Coffee', 'Caramel', 'Mango'
]

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
]

const bioTemplates = [
  (name, teaches, learns) => 
    `Hey! I'm ${name}, passionate about ${teaches[0]}. Looking to expand my skills in ${learns[0]}. Love connecting with fellow learners!`,
  (name, teaches, learns) => 
    `${name} here! I've been working with ${teaches[0]} for years and would love to share my knowledge. Currently exploring ${learns[0]}.`,
  (name, teaches, learns) => 
    `Experienced ${teaches[0]} practitioner seeking to learn ${learns[0]}. Believe in the power of knowledge exchange!`,
  (name, teaches, learns) => 
    `Hi, I'm ${name}! Teaching ${teaches[0]} is my passion. Always curious and currently diving into ${learns[0]}.`,
  (name, teaches, learns) => 
    `${teaches[0]} enthusiast with a growth mindset. Want to master ${learns[0]} and meet amazing people along the way!`,
  (name, teaches, learns) => 
    `Professional ${teaches[0]} teacher looking to exchange knowledge. Excited to learn ${learns[0]} from the community!`,
  (name, teaches, learns) => 
    `${name} - ${teaches[0]} expert by day, ${learns[0]} student by night. Let's learn together!`,
  (name, teaches, learns) => 
    `Love teaching ${teaches[0]} to beginners. Currently on a journey to master ${learns[0]}. Open to collaborations!`
]

// Helper functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'email.com']
  const num = Math.random() < 0.5 ? randomInt(1, 999) : ''
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${randomItem(domains)}`
}

function generateUser(index) {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)
  const name = `${firstName} ${lastName}`
  
  // Skills: 1-5 teach skills, 1-4 learn skills
  const teachCount = randomInt(1, 5)
  const learnCount = randomInt(1, 4)
  
  const availableSkills = [...allSkills]
  const teachSkills = randomItems(availableSkills, teachCount).map(skill => ({
    name: skill.name,
    category: skill.category,
    proficiency: randomItem(['intermediate', 'advanced', 'expert'])
  }))
  
  // Remove taught skills from available pool for learning
  const teachNames = teachSkills.map(s => s.name)
  const learnableSkills = availableSkills.filter(s => !teachNames.includes(s.name))
  const learnSkills = randomItems(learnableSkills, learnCount).map(skill => ({
    name: skill.name,
    category: skill.category,
    proficiency: randomItem(['beginner', 'intermediate'])
  }))
  
  // Generate bio
  const bioTemplate = randomItem(bioTemplates)
  const bio = bioTemplate(firstName, teachSkills.map(s => s.name), learnSkills.map(s => s.name))
  
  return {
    email: generateEmail(firstName, lastName),
    name,
    bio,
    teach_skills: teachSkills,
    learn_skills: learnSkills,
    personality_type: randomItem(['introvert', 'extrovert']),
    daily_rhythm: randomItem(['early_bird', 'night_owl']),
    spirit_animal: randomItem(spiritAnimals),
    favorite_ice_cream: randomItem(iceCreams),
    personal_color: randomItem(colors),
    // Use UI Avatars as default avatar
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random`
  }
}

async function createUser(userData) {
  try {
    // Generate embedding from bio + skills
    let embedding = null
    if (generateEmbedding) {
      try {
        const skillText = [
          ...userData.teach_skills.map(s => s.name),
          ...userData.learn_skills.map(s => s.name)
        ].join(', ')
        const embeddingText = `${userData.bio} Skills: ${skillText}`
        embedding = await generateEmbedding(embeddingText)
      } catch (error) {
        console.warn(`Could not generate embedding for ${userData.name}:`, error.message)
      }
    }
    
    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        embeddings: embedding
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log(`✓ Created user: ${userData.name}`)
    return data
  } catch (error) {
    console.error(`✗ Failed to create user ${userData.name}:`, error.message)
    return null
  }
}

function calculateMatchScore(userA, userB) {
  let score = 0
  let matchCount = 0
  
  // A teaches what B learns
  for (const learnSkill of userB.learn_skills) {
    for (const teachSkill of userA.teach_skills) {
      if (learnSkill.name.toLowerCase() === teachSkill.name.toLowerCase()) {
        score += 1.0
        matchCount++
      } else if (learnSkill.category === teachSkill.category) {
        score += 0.3
      }
    }
  }
  
  // B teaches what A learns
  for (const learnSkill of userA.learn_skills) {
    for (const teachSkill of userB.teach_skills) {
      if (learnSkill.name.toLowerCase() === teachSkill.name.toLowerCase()) {
        score += 1.0
        matchCount++
      } else if (learnSkill.category === teachSkill.category) {
        score += 0.3
      }
    }
  }
  
  // Personality bonus
  if (userA.personality_type === userB.personality_type) {
    score += 0.2
  }
  if (userA.daily_rhythm === userB.daily_rhythm) {
    score += 0.3
  }
  
  // Normalize (rough approximation)
  const maxPossibleScore = Math.max(
    userA.teach_skills.length + userA.learn_skills.length,
    userB.teach_skills.length + userB.learn_skills.length
  )
  
  return maxPossibleScore > 0 ? Math.min(score / maxPossibleScore, 1.0) : 0
}

function findMutualSkills(userA, userB) {
  const mutualSkills = []
  
  // A teaches what B learns
  for (const teachSkill of userA.teach_skills) {
    for (const learnSkill of userB.learn_skills) {
      if (teachSkill.name.toLowerCase() === learnSkill.name.toLowerCase()) {
        mutualSkills.push({
          skill: teachSkill.name,
          teacher: userA.name,
          learner: userB.name,
          direction: 'you_teach',
          teacherId: userA.id,
          learnerId: userB.id
        })
      }
    }
  }
  
  // B teaches what A learns
  for (const teachSkill of userB.teach_skills) {
    for (const learnSkill of userA.learn_skills) {
      if (teachSkill.name.toLowerCase() === learnSkill.name.toLowerCase()) {
        mutualSkills.push({
          skill: teachSkill.name,
          teacher: userB.name,
          learner: userA.name,
          direction: 'they_teach',
          teacherId: userB.id,
          learnerId: userA.id
        })
      }
    }
  }
  
  return mutualSkills
}

async function createMatch(userA, userB) {
  try {
    const score = calculateMatchScore(userA, userB)
    const mutualSkills = findMutualSkills(userA, userB)
    
    // Only create match if there's at least one mutual skill
    if (mutualSkills.length === 0) {
      return null
    }
    
    const { data, error } = await supabase
      .from('matches')
      .insert({
        user_a_id: userA.id,
        user_b_id: userB.id,
        score,
        mutual_skills: mutualSkills,
        status: randomItem(['pending', 'active', 'active', 'active']), // 75% active
        chat_enabled: true,
        conversation_id: `match-${userA.id}-${userB.id}`
      })
      .select()
      .single()
    
    if (error) {
      // Skip if match already exists
      if (error.code === '23505') return null
      throw error
    }
    
    // Create conversation
    try {
      await supabase
        .from('conversations')
        .insert({
          match_id: data.id,
          talkjs_conversation_id: `match-${data.id}`,
          participants: [userA.id, userB.id]
        })
    } catch (convError) {
      console.warn(`Could not create conversation for match ${data.id}`)
    }
    
    console.log(`✓ Created match: ${userA.name} ↔ ${userB.name} (${Math.round(score * 100)}%)`)
    return data
  } catch (error) {
    console.error(`✗ Failed to create match:`, error.message)
    return null
  }
}

async function createMatches(users, connectionsPerUser = { min: 1, max: 5 }) {
  console.log('\n📊 Creating matches...')
  
  const matches = []
  const userConnections = new Map(users.map(u => [u.id, 0]))
  
  // Shuffle users for random matching
  const shuffledUsers = [...users].sort(() => 0.5 - Math.random())
  
  for (let i = 0; i < shuffledUsers.length; i++) {
    const userA = shuffledUsers[i]
    const targetConnections = randomInt(connectionsPerUser.min, connectionsPerUser.max)
    const currentConnections = userConnections.get(userA.id)
    
    if (currentConnections >= targetConnections) continue
    
    // Find potential matches
    const potentialMatches = shuffledUsers
      .slice(i + 1)
      .filter(userB => {
        const userBConnections = userConnections.get(userB.id)
        return userBConnections < connectionsPerUser.max
      })
      .map(userB => ({
        user: userB,
        score: calculateMatchScore(userA, userB),
        mutualSkills: findMutualSkills(userA, userB)
      }))
      .filter(m => m.mutualSkills.length > 0)
      .sort((a, b) => b.score - a.score)
    
    // Create matches up to target
    const neededConnections = targetConnections - currentConnections
    const matchesToCreate = potentialMatches.slice(0, neededConnections)
    
    for (const matchData of matchesToCreate) {
      const match = await createMatch(userA, matchData.user)
      if (match) {
        matches.push(match)
        userConnections.set(userA.id, userConnections.get(userA.id) + 1)
        userConnections.set(matchData.user.id, userConnections.get(matchData.user.id) + 1)
      }
    }
  }
  
  return matches
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...')
  
  // Delete in order (respecting foreign keys)
  await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('✓ Database cleared')
}

async function seed(options = {}) {
  const {
    userCount = 30,
    minConnections = 1,
    maxConnections = 5,
    clearFirst = false
  } = options
  
  console.log('🌱 Starting database seed...')
  console.log(`📊 Configuration:`)
  console.log(`   - Users: ${userCount}`)
  console.log(`   - Connections per user: ${minConnections}-${maxConnections}`)
  console.log(`   - Clear existing data: ${clearFirst}`)
  console.log('')
  
  try {
    // Clear database if requested
    if (clearFirst) {
      await clearDatabase()
      console.log('')
    }
    
    // Create users
    console.log('👥 Creating users...')
    const userData = Array.from({ length: userCount }, (_, i) => generateUser(i))
    
    const users = []
    for (const user of userData) {
      const created = await createUser(user)
      if (created) {
        users.push(created)
      }
      // Small delay to avoid rate limits
      if (generateEmbedding) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`✓ Created ${users.length} users`)
    
    // Create matches
    const matches = await createMatches(users, { min: minConnections, max: maxConnections })
    console.log(`✓ Created ${matches.length} matches`)
    
    // Statistics
    console.log('\n📈 Seed Statistics:')
    console.log(`   - Total users: ${users.length}`)
    console.log(`   - Total matches: ${matches.length}`)
    console.log(`   - Active matches: ${matches.filter(m => m.status === 'active').length}`)
    console.log(`   - Pending matches: ${matches.filter(m => m.status === 'pending').length}`)
    
    // Connection distribution
    const connectionCounts = new Map()
    for (const match of matches) {
      connectionCounts.set(match.user_a_id, (connectionCounts.get(match.user_a_id) || 0) + 1)
      connectionCounts.set(match.user_b_id, (connectionCounts.get(match.user_b_id) || 0) + 1)
    }
    
    const distribution = {}
    for (const count of connectionCounts.values()) {
      distribution[count] = (distribution[count] || 0) + 1
    }
    
    console.log('\n   Connection Distribution:')
    for (const [count, userCount] of Object.entries(distribution).sort((a, b) => a[0] - b[0])) {
      console.log(`   - ${count} connection${count > 1 ? 's' : ''}: ${userCount} user${userCount > 1 ? 's' : ''}`)
    }
    
    console.log('\n✅ Seed completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const options = {}
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--users' && args[i + 1]) {
      options.userCount = parseInt(args[i + 1])
      i++
    } else if (args[i] === '--min-connections' && args[i + 1]) {
      options.minConnections = parseInt(args[i + 1])
      i++
    } else if (args[i] === '--max-connections' && args[i + 1]) {
      options.maxConnections = parseInt(args[i + 1])
      i++
    } else if (args[i] === '--clear') {
      options.clearFirst = true
    }
  }
  
  seed(options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { seed, generateUser, createUser, createMatch }
