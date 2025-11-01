import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Matches() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [allMatches, setAllMatches] = useState([])
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
      toast.error('Failed to load user session')
    } finally {
      setLoading(false)
    }
  }

  const findMatches = async (userId) => {
    setSearching(true)
    try {
      const response = await fetch(`http://localhost:3000/api/matching/find/${userId}?limit=20`)
      const data = await response.json()

      if (data.success) {
        setAllMatches(data.matches || [])
        setPotentialMatches(data.matches || [])
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
    if (!user) {
      toast.error('Please sign in again')
      return
    }

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
          mutualSkills: matchData.mutual_skills,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Match request sent to ${matchData.user_name}!`)
        await findMatches(user.id)
      } else {
        throw new Error(data.error || 'Failed to create match')
      }
    } catch (error) {
      console.error('Error creating match:', error)
      toast.error('Failed to create match')
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setPotentialMatches(allMatches)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allMatches.filter((match) => {
      const teachSkills = match.teach_skills?.map((s) => s.name.toLowerCase()) || []
      const learnSkills = match.learn_skills?.map((s) => s.name.toLowerCase()) || []
      const name = match.user_name?.toLowerCase() || ''

      return (
        teachSkills.some((skill) => skill.includes(query)) ||
        learnSkills.some((skill) => skill.includes(query)) ||
        name.includes(query)
      )
    })

    if (filtered.length === 0) {
      toast.error('No matches found for that search')
    }

    setPotentialMatches(filtered)
  }

  const handleFilter = (type) => {
    switch (type) {
      case 'high':
        setPotentialMatches(allMatches.filter((match) => (match.reciprocal_score || 0) >= 0.8))
        break
      case 'teaches-you':
        setPotentialMatches(
          allMatches.filter((match) =>
            match.teach_skills?.some((skill) =>
              user?.user_metadata?.learn_skills?.some((learn) => learn.name === skill.name),
            ),
          ),
        )
        break
      case 'wants-you':
        setPotentialMatches(
          allMatches.filter((match) =>
            match.learn_skills?.some((skill) =>
              user?.user_metadata?.teach_skills?.some((teach) => teach.name === skill.name),
            ),
          ),
        )
        break
      default:
        setPotentialMatches(allMatches)
    }
  }

  const handleRefresh = () => {
    setSearchQuery('')
    if (user) {
      findMatches(user.id)
      toast.success('Matches refreshed!')
    }
  }

  const visibleMatches = useMemo(() => potentialMatches || [], [potentialMatches])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/70">
        Loading matches...
      </div>
    )
  }

  return (
    <div className="px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-950 via-primary-900 to-primary-700 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Smart matching</p>
              <h1 className="mt-4 text-4xl font-semibold md:text-5xl">Find partners who accelerate your growth</h1>
              <p className="mt-6 text-white/80">
                The AI looks at your goals, availability, and reciprocal value so every connection feels like a natural
                collaboration.
              </p>
            </div>
            <div className="grid gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Potential matches</span>
                <span className="text-lg font-semibold">{allMatches.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">High compatibility</span>
                <span className="text-lg font-semibold">
                  {allMatches.filter((match) => (match.reciprocal_score || 0) >= 0.8).length}
                </span>
              </div>
              <button className="btn-primary mt-2" onClick={handleRefresh} disabled={searching}>
                {searching ? 'Refreshing...' : 'Refresh Matches'}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="card bg-white/95">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by skill or name..."
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSearch} className="btn-primary whitespace-nowrap" disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
                <button onClick={handleRefresh} className="btn-secondary whitespace-nowrap">
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium">
              {[
                { label: 'All', value: 'all' },
                { label: 'High match', value: 'high' },
                { label: 'Teaches your goals', value: 'teaches-you' },
                { label: 'Wants your skills', value: 'wants-you' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilter(filter.value)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-slate-600 transition hover:border-primary-200 hover:text-primary-600"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {searching ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/10 py-16 text-lg text-white/70">
              Finding your perfect matches...
            </div>
          ) : visibleMatches.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-10 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-white">No matches yet</p>
              <p className="mt-2 text-white/70">
                Refresh your profile and add more skills to unlock better pairing suggestions.
              </p>
              <button onClick={() => navigate('/profile')} className="btn-primary mt-6">
                Update your profile
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {visibleMatches.map((match, index) => (
                <div key={index} className="card flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={match.avatar_url || `https://ui-avatars.com/api/?name=${match.user_name}&size=200`}
                        alt={match.user_name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{match.user_name}</h3>
                        <p className="text-sm font-medium text-primary-600">
                          Match score {Math.round((match.reciprocal_score || 0) * 100)}%
                        </p>
                        {match.user_bio && (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{match.user_bio}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {match.mutual_skills?.length > 0 && (
                    <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-primary-600">Mutual alignment</h4>
                      <ul className="mt-2 space-y-1 text-sm text-primary-700">
                        {match.mutual_skills.slice(0, 3).map((mutual, idx) => (
                          <li key={idx}>
                            {mutual.direction === 'A→B' ? 'You teach' : `${match.user_name} teaches`} {mutual.skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Can teach</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {match.teach_skills?.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {match.teach_skills?.length > 4 && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            +{match.teach_skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wants to learn</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {match.learn_skills?.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {match.learn_skills?.length > 4 && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            +{match.learn_skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      Suggested because there is reciprocal value across your skill graphs.
                    </p>
                    <button onClick={() => handleCreateMatch(match)} className="btn-primary text-sm">
                      Connect & start learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="card bg-white/95">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Need to adjust your discovery?</h2>
                <p className="text-sm text-slate-500">
                  Tweak your profile and learning goals to surface fresh collaborators.
                </p>
              </div>
              <button onClick={() => navigate('/profile')} className="btn-secondary sm:w-auto">
                Tune profile inputs
              </button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-primary-50/60">
            <h2 className="text-xl font-semibold text-slate-900">Matching tips</h2>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li>- Update your learning goals so the AI knows what to prioritise this week.</li>
              <li>- Add availability blocks so micro-sessions can be proposed automatically.</li>
              <li>- Share notes after each session to boost visibility with reflective mentors.</li>
            </ul>
            <button className="btn-primary mt-6 w-full text-sm" onClick={() => navigate('/dashboard')}>
              Review insights
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
