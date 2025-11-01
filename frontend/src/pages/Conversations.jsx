import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Conversations() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        toast.error('Please log in')
        navigate('/login')
        return
      }
      
      setUser(authUser)
      
      // Get all user's matches
      const response = await fetch(`http://localhost:3000/api/matching/user/${authUser.id}`)
      const data = await response.json()
      
      if (data.success) {
        setMatches(data.matches || [])
      } else {
        toast.error('Failed to load conversations')
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const getOtherUser = (match) => {
    return match.user_a?.id === user?.id ? match.user_b : match.user_a
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      active: { text: 'Active', color: 'bg-green-100 text-green-800' },
      completed: { text: 'Completed', color: 'bg-blue-100 text-blue-800' }
    }
    
    const badge = badges[status] || badges.active
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-xl text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💬 Conversations</h1>
        <p className="text-gray-600">
          Chat with your matches and start learning together
        </p>
      </div>

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No conversations yet
          </h2>
          <p className="text-gray-600 mb-6">
            Find your perfect match and start a conversation!
          </p>
          <button
            onClick={() => navigate('/matches')}
            className="btn-primary"
          >
            Find Matches
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600">{matches.length}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">
                {matches.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">
                {matches.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="space-y-3">
            {matches.map((match) => {
              const otherUser = getOtherUser(match)
              
              return (
                <div
                  key={match.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-100 hover:border-primary-300"
                  onClick={() => navigate(`/chat/${match.id}`)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <img
                      src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${otherUser?.name}&size=200`}
                      alt={otherUser?.name}
                      className="w-16 h-16 rounded-full flex-shrink-0"
                    />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {otherUser?.name}
                        </h3>
                        {getStatusBadge(match.status)}
                      </div>
                      
                      {otherUser?.bio && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {otherUser.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          🎯 Match: <span className="font-semibold text-primary-600">
                            {Math.round((match.score || 0) * 100)}%
                          </span>
                        </span>
                        <span>
                          Connected {formatDate(match.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Skills Preview */}
                    <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                        {otherUser?.teach_skills?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                      <button
                        className="btn-primary text-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/chat/${match.id}`)
                        }}
                      >
                        Open Chat →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Find More Matches CTA */}
          <div className="mt-8 card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Want to meet more learning partners?
              </h3>
              <p className="text-gray-600 mb-4">
                Discover more people who share your learning goals
              </p>
              <button
                onClick={() => navigate('/matches')}
                className="btn-primary"
              >
                Find More Matches
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
