import { supabase } from '../config/supabase.js'

const testUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alice@test.com',
    name: 'Alice Johnson',
    bio: 'Experienced web developer who loves teaching React and wants to learn Python for data science',
    teach_skills: [
      { name: 'React', category: 'Frontend', proficiency: 'expert' },
      { name: 'JavaScript', category: 'Programming', proficiency: 'expert' },
      { name: 'CSS', category: 'Frontend', proficiency: 'advanced' },
      { name: 'TypeScript', category: 'Programming', proficiency: 'advanced' }
    ],
    learn_skills: [
      { name: 'Python', category: 'Programming', proficiency: 'beginner' },
      { name: 'Machine Learning', category: 'AI', proficiency: 'beginner' },
      { name: 'Data Science', category: 'AI', proficiency: 'beginner' }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'bob@test.com',
    name: 'Bob Smith',
    bio: 'Data scientist specializing in Python and ML. Looking to build better web interfaces for my projects',
    teach_skills: [
      { name: 'Python', category: 'Programming', proficiency: 'expert' },
      { name: 'Machine Learning', category: 'AI', proficiency: 'advanced' },
      { name: 'Data Science', category: 'AI', proficiency: 'expert' },
      { name: 'TensorFlow', category: 'AI', proficiency: 'advanced' }
    ],
    learn_skills: [
      { name: 'React', category: 'Frontend', proficiency: 'beginner' },
      { name: 'JavaScript', category: 'Programming', proficiency: 'intermediate' },
      { name: 'UI/UX Design', category: 'Design', proficiency: 'beginner' }
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'carol@test.com',
    name: 'Carol Davis',
    bio: 'Mobile app developer with iOS expertise. Want to expand to Android and learn backend development',
    teach_skills: [
      { name: 'Swift', category: 'Mobile', proficiency: 'expert' },
      { name: 'iOS Development', category: 'Mobile', proficiency: 'expert' },
      { name: 'Mobile UI Design', category: 'Design', proficiency: 'advanced' }
    ],
    learn_skills: [
      { name: 'Android', category: 'Mobile', proficiency: 'beginner' },
      { name: 'Kotlin', category: 'Programming', proficiency: 'beginner' },
      { name: 'Node.js', category: 'Backend', proficiency: 'beginner' }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'david@test.com',
    name: 'David Chen',
    bio: 'Full-stack developer with Node.js and React. Looking to learn mobile development',
    teach_skills: [
      { name: 'Node.js', category: 'Backend', proficiency: 'expert' },
      { name: 'Express', category: 'Backend', proficiency: 'expert' },
      { name: 'React', category: 'Frontend', proficiency: 'advanced' },
      { name: 'MongoDB', category: 'Database', proficiency: 'advanced' }
    ],
    learn_skills: [
      { name: 'Swift', category: 'Mobile', proficiency: 'beginner' },
      { name: 'iOS Development', category: 'Mobile', proficiency: 'beginner' },
      { name: 'Android', category: 'Mobile', proficiency: 'beginner' }
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'emma@test.com',
    name: 'Emma Wilson',
    bio: 'UI/UX designer who codes. Want to improve my JavaScript and learn backend',
    teach_skills: [
      { name: 'UI/UX Design', category: 'Design', proficiency: 'expert' },
      { name: 'Figma', category: 'Design', proficiency: 'expert' },
      { name: 'CSS', category: 'Frontend', proficiency: 'advanced' },
      { name: 'HTML', category: 'Frontend', proficiency: 'advanced' }
    ],
    learn_skills: [
      { name: 'JavaScript', category: 'Programming', proficiency: 'intermediate' },
      { name: 'React', category: 'Frontend', proficiency: 'beginner' },
      { name: 'TypeScript', category: 'Programming', proficiency: 'beginner' }
    ]
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'frank@test.com',
    name: 'Frank Martinez',
    bio: 'DevOps engineer interested in learning more about AI and automation',
    teach_skills: [
      { name: 'Docker', category: 'DevOps', proficiency: 'expert' },
      { name: 'Kubernetes', category: 'DevOps', proficiency: 'advanced' },
      { name: 'CI/CD', category: 'DevOps', proficiency: 'expert' },
      { name: 'AWS', category: 'Cloud', proficiency: 'advanced' }
    ],
    learn_skills: [
      { name: 'Python', category: 'Programming', proficiency: 'intermediate' },
      { name: 'Machine Learning', category: 'AI', proficiency: 'beginner' },
      { name: 'TensorFlow', category: 'AI', proficiency: 'beginner' }
    ]
  }
]

async function seedTestData() {
  console.log('🌱 Starting to seed test data...')
  
  try {
    // Clear existing test data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing test users...')
    const testUserIds = testUsers.map(u => u.id)
    
    await supabase
      .from('users')
      .delete()
      .in('id', testUserIds)
    
    // Insert test users
    console.log('Inserting test users...')
    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(testUsers)
      .select()
    
    if (userError) {
      console.error('Error inserting users:', userError)
      throw userError
    }
    
    console.log(`✅ Successfully inserted ${insertedUsers.length} test users`)
    
    // Display the test users
    console.log('\n📋 Test Users:')
    testUsers.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.email})`)
      console.log(`   Can teach: ${user.teach_skills.map(s => s.name).join(', ')}`)
      console.log(`   Wants to learn: ${user.learn_skills.map(s => s.name).join(', ')}`)
    })
    
    console.log('\n🎉 Test data seeded successfully!')
    console.log('\n💡 Try logging in with one of these emails (use any password for testing):')
    testUsers.forEach(user => console.log(`   - ${user.email}`))
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  }
}

// Run the seed function
seedTestData()
