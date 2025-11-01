import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      if (!authUser) return

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Get user matches
      const response = await fetch(`http://localhost:3000/api/matching/user/${authUser.id}`)
      const matchData = await response.json()
      
      if (matchData.success) {
        setMatches(matchData.matches || [])
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindMatches = async () => {
    if (!user || !profile) {
      toast.error('Please complete your profile first')
      navigate('/profile')
      return
    }

    if (!profile.teach_skills?.length || !profile.learn_skills?.length) {
      toast.error('Please add skills you can teach and want to learn in your profile')
      navigate('/profile')
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`http://localhost:3000/api/matching/find/${user.id}`)
      const data = await response.json()

      if (data.success && data.matches?.length > 0) {
        toast.success(`Found ${data.matches.length} potential matches!`)
        navigate('/matches')
      } else {
        toast.error('No matches found yet. Try updating your skills!')
      }
    } catch (error) {
      console.error('Error finding matches:', error)
      toast.error('Failed to find matches')
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const activeMatches = matches.filter(m => m.status === 'accepted').length
  const totalSkillsTaught = profile?.teach_skills?.length || 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name || 'there'}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's your learning journey overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Active Matches</h3>
          <p className="text-4xl font-bold text-blue-600">{activeMatches}</p>
          <p className="text-sm text-gray-600 mt-1">Learning partnerships</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Can Teach</h3>
          <p className="text-4xl font-bold text-green-600">{totalSkillsTaught}</p>
          <p className="text-sm text-gray-600 mt-1">Skills to share</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Want to Learn</h3>
          <p className="text-4xl font-bold text-purple-600">{profile?.learn_skills?.length || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Skills to acquire</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Your Skills */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🎓 Skills You Can Teach</h2>
          {profile?.teach_skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.teach_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>

        {/* Skills to Learn */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🌱 Skills You Want to Learn</h2>
          {profile?.learn_skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.learn_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="btn-secondary text-left flex items-center justify-between"
          >
            <span>✏️ Update Your Profile</span>
            <span>→</span>
          </button>
          <button 
            onClick={handleFindMatches}
            disabled={searching}
            className="btn-primary text-left flex items-center justify-between"
          >
            <span>{searching ? '🔍 Searching...' : '🎯 Find New Matches'}</span>
            <span>→</span>
          </button>
          <button 
            onClick={() => navigate('/matches')}
            className="btn-secondary text-left flex items-center justify-between"
          >
            <span>👥 View All Matches</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Matches</h2>
          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <div
                key={match.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/matches`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {match.user_a?.name || match.user_b?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Match Score: {Math.round(match.score * 100)}%
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    match.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    match.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
