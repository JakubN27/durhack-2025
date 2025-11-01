/**
 * Quick diagnostic script to test conversations API
 * Run in browser console on any SkillSwap page while logged in
 */

// Get current user ID
const getCurrentUserId = async () => {
  const { data: { user } } = await window.supabase.auth.getUser()
  return user?.id
}

// Test the matching API
const testMatchingAPI = async () => {
  const userId = await getCurrentUserId()
  console.log('Testing with user ID:', userId)
  
  if (!userId) {
    console.error('No user logged in!')
    return
  }
  
  console.log('\n=== Testing Matching API ===')
  const response = await fetch(`http://localhost:3000/api/matching/user/${userId}`)
  const data = await response.json()
  console.log('Matching API response:', data)
  console.log('Number of matches:', data.matches?.length || 0)
  
  if (data.matches && data.matches.length > 0) {
    console.log('\nFirst match:', data.matches[0])
    console.log('User A:', data.matches[0].user_a)
    console.log('User B:', data.matches[0].user_b)
  }
  
  return data
}

// Test the chat conversations API
const testChatAPI = async () => {
  const userId = await getCurrentUserId()
  console.log('Testing with user ID:', userId)
  
  if (!userId) {
    console.error('No user logged in!')
    return
  }
  
  console.log('\n=== Testing Chat API ===')
  const response = await fetch(`http://localhost:3000/api/chat/conversations/${userId}?status=all`)
  const data = await response.json()
  console.log('Chat API response:', data)
  console.log('Number of conversations:', data.conversations?.length || 0)
  
  if (data.conversations && data.conversations.length > 0) {
    console.log('\nFirst conversation:', data.conversations[0])
  }
  
  return data
}

// Check backend health
const testBackend = async () => {
  console.log('\n=== Testing Backend ===')
  try {
    const response = await fetch('http://localhost:3000/health')
    console.log('Backend status:', response.ok ? '✅ Running' : '❌ Error')
    const data = await response.json()
    console.log('Health check:', data)
  } catch (err) {
    console.error('Backend error:', err.message)
  }
}

// Run all tests
const runAllTests = async () => {
  console.clear()
  console.log('🔍 SkillSwap Diagnostics\n')
  
  await testBackend()
  await testMatchingAPI()
  await testChatAPI()
  
  console.log('\n✅ Diagnostics complete!')
  console.log('\n💡 To run again, type: runAllTests()')
}

// Instructions
console.log('🔍 SkillSwap Diagnostic Tool Loaded!')
console.log('\nAvailable commands:')
console.log('  runAllTests()      - Run all diagnostic tests')
console.log('  testMatchingAPI()  - Test matching endpoint')
console.log('  testChatAPI()      - Test chat conversations endpoint')
console.log('  testBackend()      - Check backend health')
console.log('\nTo start, type: runAllTests()')

// Auto-run if requested
if (window.location.search.includes('debug=true')) {
  runAllTests()
}
