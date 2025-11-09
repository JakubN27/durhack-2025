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
      
    } catch (error) {
      console.error('Error loading chat:', error)
      toast.error('Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user && match && chatboxEl.current) {
      initializeChat(user, match)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id, match?.id])

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
      
      // Ensure container fills available space
      if (chatboxEl.current) {
        chatboxEl.current.style.width = '100%'
        chatboxEl.current.style.height = '100%'
        chatboxEl.current.style.minHeight = '640px'
      }

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
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 px-4 py-16">
        <div className="card max-w-xl text-center">
          <div className="text-4xl mb-2">💬</div>
          <h2 className="text-xl font-semibold text-slate-900">Loading chat...</h2>
          <p className="text-sm text-slate-600">Give us a moment while we prepare your SkillSwap space.</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 px-4 py-16">
        <div className="card max-w-xl text-center">
          <div className="text-4xl mb-2">❌</div>
          <h2 className="text-xl font-semibold text-slate-900">Match not found</h2>
          <p className="text-sm text-slate-600">Looks like this SkillSwap connection has moved on. Head back to your matches to explore new partners.</p>
          <button onClick={() => navigate('/matches')} className="btn-primary mt-6">
            Back to Matches
          </button>
        </div>
      </div>
    )
  }

  const otherUser = match.user_a?.id === user?.id ? match.user_b : match.user_a
  const matchScore = Math.round(((match.score ?? match.reciprocal_score ?? 0) || 0) * 100)

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/conversations')}
              className="btn-ghost text-sm font-semibold text-white/80 hover:text-white"
            >
              ← Back to Conversations
            </button>
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            <div className="flex items-center gap-3">
              <img
                src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${otherUser?.name}&size=200`}
                alt={otherUser?.name}
                className="h-12 w-12 rounded-full ring-4 ring-white/20"
              />
              <div>
                <h2 className="text-lg font-semibold text-white">{otherUser?.name}</h2>
                <p className="mt-1 flex items-center gap-2 text-xs text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Match Score: {matchScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Skills Preview */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/70">
              <span className="uppercase tracking-wide">Teaches</span>
              <div className="flex flex-wrap gap-1">
                {otherUser?.teach_skills?.slice(0, 2).map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-white/20 px-2 py-1 text-white text-xs font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
                {otherUser?.teach_skills?.length > 2 && (
                  <span className="rounded-full bg-white/10 px-2 py-1 text-white/70 text-xs">
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
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-0 xl:justify-center">
          {/* Main Chat Area */}
          <div className="relative flex min-h-[640px] flex-1 overflow-hidden">
            <div ref={chatboxEl} className="absolute inset-0" />
          </div>

          {/* Sidebar - Match Info */}
          <aside className="w-full xl:w-[26rem] xl:max-w-[26rem]">
            <div className="flex h-full min-h-[640px] flex-col rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
              {/* User Info */}
              <div className="text-center mb-6">
                <img
                  src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${otherUser?.name}&size=200`}
                  alt={otherUser?.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3 ring-4 ring-primary-100"
                />
                <h3 className="text-xl font-bold text-slate-900">{otherUser?.name}</h3>
                {otherUser?.bio && (
                  <p className="text-sm text-slate-600 mt-2">{otherUser.bio}</p>
                )}
              </div>

              {/* Match Score */}
              <div className="mb-4 rounded-2xl border border-primary-100/60 bg-gradient-to-br from-primary-50 to-blue-50 p-5 text-center shadow-inner">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {matchScore}%
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-600">Match Score</div>
              </div>

              {/* Mutual Skills */}
              {match.mutual_skills && match.mutual_skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <span className="text-lg">🤝</span>
                    Skill Exchange
                  </h4>
                  <div className="space-y-2">
                    {match.mutual_skills.map((mutual, idx) => (
                      <div key={idx} className="rounded-2xl border border-green-200 bg-green-50 p-3">
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
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                    Can Teach You
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {otherUser?.teach_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                    Wants to Learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {otherUser?.learn_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Status */}
              <div className="mt-6 border-t border-slate-200 pt-6 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-semibold ${
                      match.status === 'active'
                        ? 'text-green-600'
                        : match.status === 'completed'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {match.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connected:</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(match.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
