import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Matches() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [potentialMatches, setPotentialMatches] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      if (authUser) {
        await findMatches(authUser.id)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const findMatches = async (userId, skill = null) => {
    setSearching(true)
    try {
      // Build URL with optional skill parameter
      let url = `http://localhost:3000/api/matching/find/${userId}?limit=20`
      if (skill) {
        url += `&skill=${encodeURIComponent(skill)}`
      }
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setPotentialMatches(data.matches || [])
        if (skill && data.matches.length === 0) {
          toast.error(`No matches found for "${skill}"`)
        }
      } else {
        toast.error('Failed to find matches')
      }
    } catch (error) {
      console.error('Error finding matches:', error)
      toast.error('Failed to find matches')
    } finally {
      setSearching(false)
    }
  }

  const handleCreateMatch = async (matchData) => {
    try {
      const response = await fetch('http://localhost:3000/api/matching/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAId: user.id,
          userBId: matchData.user_id,
          score: matchData.reciprocal_score,
          mutualSkills: matchData.mutual_skills
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Match created! Opening chat...`)
        // Navigate to chat
        setTimeout(() => {
          navigate(`/chat/${data.match.id}`)
        }, 1000)
      } else {
        toast.error('Failed to create match')
      }
    } catch (error) {
      console.error('Error creating match:', error)
      toast.error('Failed to create match')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a skill to search')
      return
    }

    if (user) {
      await findMatches(user.id, searchQuery)
      if (potentialMatches.length > 0) {
        toast.success(`Found ${potentialMatches.length} matches for "${searchQuery}"`)
      }
    }
  }

  const handleRefresh = () => {
    setSearchQuery('')
    if (user) {
      findMatches(user.id)
      toast.success('Matches refreshed!')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Match 🎯</h1>
        <p className="text-gray-600">
          Discover people who can teach you what you want to learn, and learn from what you can teach
        </p>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search for a skill (e.g., 'React', 'Python', 'Design')..."
            className="input flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary whitespace-nowrap"
          >
            {searching ? '🔍 Searching...' : '🔍 Search'}
          </button>
          <button
            onClick={handleRefresh}
            className="btn-secondary"
            title="Refresh matches"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Matches Count */}
      {potentialMatches.length > 0 && (
        <div className="mb-4 text-gray-600">
          Showing {potentialMatches.length} potential {potentialMatches.length === 1 ? 'match' : 'matches'}
        </div>
      )}

      {/* Matches Grid */}
      {searching ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-xl text-gray-600">Finding your perfect matches...</p>
        </div>
      ) : potentialMatches.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-600 mb-2">No matches found yet</p>
          <p className="text-gray-500">Complete your profile and add skills to get matched!</p>
          <button
            onClick={() => window.location.href = '/profile'}
            className="btn-primary mt-4"
          >
            Complete Your Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {potentialMatches.map((match, index) => (
            <div
              key={index}
              className="card border-2 border-gray-200 hover:border-primary-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={match.avatar_url || `https://ui-avatars.com/api/?name=${match.user_name}&size=200`}
                    alt={match.user_name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{match.user_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Match Score:</span>
                      <span className="font-bold text-primary-600">
                        {Math.round(match.reciprocal_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {match.user_bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{match.user_bio}</p>
              )}

              {/* Mutual Skills */}
              {match.mutual_skills && match.mutual_skills.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">
                    🤝 Skills You Can Exchange
                  </h4>
                  <div className="space-y-2">
                    {match.mutual_skills.slice(0, 5).map((mutual, idx) => (
                      <div key={idx} className="text-sm">
                        {mutual.direction === 'you_teach' ? (
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600 font-medium">You teach →</span>
                            <span className="text-gray-700">
                              <strong>{mutual.skill}</strong> to {mutual.learner}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 font-medium">You learn ←</span>
                            <span className="text-gray-700">
                              <strong>{mutual.skill}</strong> from {mutual.teacher}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {match.mutual_skills.length > 5 && (
                      <div className="text-xs text-green-600 mt-1">
                        +{match.mutual_skills.length - 5} more skills to exchange
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Can Teach
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.teach_skills?.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {match.teach_skills?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{match.teach_skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Wants to Learn
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.learn_skills?.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {match.learn_skills?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{match.learn_skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCreateMatch(match)}
                className="btn-primary w-full"
              >
                💬 Connect & Start Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
