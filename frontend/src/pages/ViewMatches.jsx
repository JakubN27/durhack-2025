import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function ViewMatches() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [currentMatches, setCurrentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        toast.error('Please sign in to view your matches')
        navigate('/login')
        return
      }

      setUser(authUser)
      await fetchCurrentMatches(authUser.id)
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentMatches = async (userId) => {
    try {
      setRefreshing(true)
      const response = await fetch(`http://localhost:3000/api/matching/user/${userId}`)
      const data = await response.json()

      if (data.success) {
        setCurrentMatches(data.matches || [])
      } else {
        toast.error(data.error || 'Failed to load matches')
      }
    } catch (error) {
      console.error('Error fetching current matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setRefreshing(false)
    }
  }

  const handleOpenChat = (matchId) => {
    navigate(`/chat/${matchId}`)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-white/80">
        Loading your matches...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Your Matches 🤝</h1>
        <p className="text-white/80">
          Jump back into conversations or keep exploring to find new partners.
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Current Connections</h2>
            <p className="text-sm text-slate-600">
              Reconnect with learners and mentors you have already matched with.
            </p>
          </div>
          <button
            onClick={() => user && fetchCurrentMatches(user.id)}
            className="btn-secondary text-sm"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="mt-4">
          {refreshing && currentMatches.length === 0 ? (
            <div className="py-6 text-center text-slate-600">Loading your matches...</div>
          ) : currentMatches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-primary-200/80 bg-primary-50/60 p-6 text-center text-slate-700">
              You currently aren't matched with anyone! Try connecting from the Match Now page.
            </div>
          ) : (
            <div className="space-y-4">
              {currentMatches.map((match) => {
                const otherUser = match.user_a?.id === user?.id ? match.user_b : match.user_a
                const displayName = otherUser?.name || 'SkillSwap Partner'
                const mutualSkills = match.mutual_skills || []

                return (
                  <div
                    key={match.id}
                    className="flex flex-col gap-4 rounded-2xl border border-primary-100 bg-white/95 p-4 text-slate-900 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <img
                        src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=200`}
                        alt={displayName}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1 min-w-[180px]">
                        <p className="text-base font-semibold text-slate-900">{displayName}</p>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Status: {match.status || 'pending'}</p>
                      </div>
                      <button
                        className="btn-primary"
                        onClick={() => handleOpenChat(match.id)}
                      >
                        Open Chat
                      </button>
                    </div>

                    {mutualSkills.length > 0 && (
                      <div className="rounded-xl bg-primary-50/80 p-3 text-sm text-slate-700">
                        <p className="font-semibold text-primary-700">Shared Skills</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {mutualSkills.slice(0, 4).map((skill, idx) => (
                            <span key={`${match.id}-skill-${idx}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-700 shadow">
                              {skill.skill}
                            </span>
                          ))}
                          {mutualSkills.length > 4 && (
                            <span className="text-xs text-primary-700">+{mutualSkills.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="text-white/80">
        Want to discover new partners? Head to the Match Now page to run a fresh search.
      </div>
    </div>
  )
}
