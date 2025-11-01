import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { initializeTalkJS, createConversation, createChatbox } from '../lib/talkjs'
import toast from 'react-hot-toast'

export default function Chat() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const chatboxEl = useRef(null)
  const chatboxInstance = useRef(null)
  const [user, setUser] = useState(null)
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChatData()
    
    return () => {
      // Cleanup chatbox on unmount
      if (chatboxInstance.current) {
        chatboxInstance.current.destroy()
        chatboxInstance.current = null
      }
    }
  }, [matchId])

  const loadChatData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        toast.error('Please log in')
        navigate('/login')
        return
      }
      
      // Get user profile
      const userResponse = await fetch(`http://localhost:3000/api/users/${authUser.id}`)
      const userData = await userResponse.json()
      
      if (!userData.success) {
        throw new Error('Failed to load user profile')
      }
      
      setUser(userData.data)
      
      // Get match details
      const matchResponse = await fetch(`http://localhost:3000/api/matching/${matchId}`)
      const matchData = await matchResponse.json()
      
      if (!matchData.success) {
        throw new Error('Failed to load match')
      }
      
      setMatch(matchData.match)
      
      // Wait a bit for DOM to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Initialize TalkJS
      await initializeChat(userData.data, matchData.match)
      
    } catch (error) {
      console.error('Error loading chat:', error)
      toast.error('Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  const initializeChat = async (currentUser, matchData) => {
    try {
      // Determine the other user in the match
      const otherUser = matchData.user_a?.id === currentUser.id 
        ? matchData.user_b 
        : matchData.user_a
      
      if (!otherUser) {
        throw new Error('Could not find other user in match')
      }
      
      // Mark messages as read when user opens chat
      try {
        await fetch(`http://localhost:3000/api/chat/mark-read/${matchId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id
          })
        })
      } catch (err) {
        console.error('Error marking messages as read:', err)
        // Don't block chat initialization if this fails
      }
      
      // Wait for DOM element to be available
      if (!chatboxEl.current) {
        console.error('Chat container not found')
        throw new Error('Chat container not found')
      }
      
      // Clean up existing chatbox if any
      if (chatboxInstance.current) {
        chatboxInstance.current.destroy()
        chatboxInstance.current = null
      }
      
      // Initialize TalkJS session
      const { session } = await initializeTalkJS(currentUser)
      
      // Create conversation
      const conversation = createConversation(
        session,
        currentUser,
        otherUser,
        `match-${matchId}`
      )
      
      // Create chatbox and mount it
      const newChatbox = createChatbox(session, conversation)
      
      // Mount to DOM
      newChatbox.mount(chatboxEl.current)
      
      // Store in ref instead of state to avoid re-renders
      chatboxInstance.current = newChatbox
      
    } catch (error) {
      console.error('Error initializing chat:', error)
      toast.error('Failed to initialize chat')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-xl text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-xl text-gray-600 mb-2">Match not found</p>
          <button onClick={() => navigate('/matches')} className="btn-primary mt-4">
            Back to Matches
          </button>
        </div>
      </div>
    )
  }

  const otherUser = match.user_a?.id === user?.id ? match.user_b : match.user_a

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/conversations')}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Conversations
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <div className="flex items-center gap-3">
              <img
                src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${otherUser?.name}&size=200`}
                alt={otherUser?.name}
                className="w-10 h-10 rounded-full ring-2 ring-primary-100"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Match Score: {Math.round((match.score || 0) * 100)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Skills Preview */}
            <div className="hidden lg:flex items-center gap-2 mr-4 px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-600">Learning:</span>
              <div className="flex gap-1">
                {otherUser?.teach_skills?.slice(0, 2).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
                {otherUser?.teach_skills?.length > 2 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                    +{otherUser.teach_skills.length - 2}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/profile/${otherUser?.id}`)}
              className="btn-secondary text-sm"
            >
              👤 View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto flex">
          {/* Main Chat Area */}
          <div className="flex-1 h-full">
            {/* TalkJS Chatbox */}
            <div ref={chatboxEl} className="h-full" />
          </div>
          
          {/* Sidebar - Match Info */}
          <div className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <img
                  src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${otherUser?.name}&size=200`}
                  alt={otherUser?.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 ring-4 ring-primary-100"
                />
                <h3 className="text-xl font-bold text-gray-900">{otherUser?.name}</h3>
                {otherUser?.bio && (
                  <p className="text-sm text-gray-600 mt-2">{otherUser.bio}</p>
                )}
              </div>
              
              {/* Match Score */}
              <div className="card bg-gradient-to-br from-primary-50 to-blue-50 mb-4 text-center border-2 border-primary-100">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {Math.round((match.score || 0) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Match Score</div>
              </div>
              
              {/* Mutual Skills */}
              {match.mutual_skills && match.mutual_skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    Skill Exchange
                  </h4>
                  <div className="space-y-2">
                    {match.mutual_skills.map((mutual, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          {mutual.skill}
                        </div>
                        <div className="text-xs text-green-600">
                          {mutual.teacher} teaches {mutual.learner}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Skills */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Can Teach You
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {otherUser?.teach_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Wants to Learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {otherUser?.learn_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Match Status */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      match.status === 'active' ? 'text-green-600' : 
                      match.status === 'completed' ? 'text-blue-600' : 
                      'text-yellow-600'
                    }`}>
                      {match.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected:</span>
                    <span className="font-medium text-gray-700">
                      {new Date(match.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
