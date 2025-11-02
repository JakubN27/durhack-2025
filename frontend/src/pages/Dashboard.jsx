import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const quickActions = [
  'Complete your learning goals',
  'Check in with new matches',
  'Update availability for next week',
]

const progressUpdates = [
  {
    title: 'Skill Legacy Growth',
    description: 'Your React expertise reached 8 mentees this month',
    metric: '+42%',
  },
  {
    title: 'AI Learning Plans',
    description: '3 new personalised practice plans ready for review',
    metric: 'New',
  },
  {
    title: 'Community Streak',
    description: 'You have helped peers for 6 days straight. Keep it up!',
    metric: '🔥 6-day streak',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [chatActivity, setChatActivity] = useState({
    lastInteractionAt: null,
    partnerName: null,
    conversations: [],
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      if (!authUser) return

      const profileResponse = await fetch(`http://localhost:3000/api/users/${authUser.id}`)
      const profileResult = await profileResponse.json()

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data)
      }

      const matchResponse = await fetch(`http://localhost:3000/api/matching/user/${authUser.id}`)
      const matchData = await matchResponse.json()
      if (matchData.success) {
        setMatches(matchData.matches || [])
      }

      await loadChatActivity(authUser.id)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadChatActivity = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chat/conversations/${userId}?status=all&limit=100`
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.conversations?.length) {
        setChatActivity({ lastInteractionAt: null, partnerName: null, conversations: [] })
        return
      }

      const latestConversation = data.conversations.reduce((latest, conversation) => {
        const candidateTimestamp = conversation.lastMessageAt || conversation.createdAt

        if (!candidateTimestamp) {
          return latest
        }

        if (!latest) {
          return {
            timestamp: candidateTimestamp,
            name: conversation.otherUser?.name || 'SkillSwap partner',
          }
        }

        const latestDate = new Date(latest.timestamp)
        const candidateDate = new Date(candidateTimestamp)

        if (candidateDate > latestDate) {
          return {
            timestamp: candidateTimestamp,
            name: conversation.otherUser?.name || 'SkillSwap partner',
          }
        }

        return latest
      }, null)

      if (!latestConversation) {
        setChatActivity({ lastInteractionAt: null, partnerName: null, conversations: data.conversations || [] })
        return
      }

      setChatActivity({
        lastInteractionAt: latestConversation.timestamp,
        partnerName: latestConversation.name,
        conversations: data.conversations || [],
      })
    } catch (error) {
      console.error('Error loading chat activity:', error)
      setChatActivity({ lastInteractionAt: null, partnerName: null, conversations: [] })
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

  const activeMatches = useMemo(() => {
    const activeStatuses = new Set(['active', 'accepted'])
    return matches.filter((m) => activeStatuses.has((m.status || '').toLowerCase())).length
  }, [matches])
  const totalSkillsTaught = profile?.teach_skills?.length || 0
  const totalSkillsToLearn = profile?.learn_skills?.length || 0
  const reciprocityScore = totalSkillsTaught + totalSkillsToLearn === 0
    ? 0
    : Math.min(
        100,
        Math.round(
          (Math.min(totalSkillsTaught, totalSkillsToLearn) /
            Math.max(totalSkillsTaught, totalSkillsToLearn || 1)) *
            100,
        ),
      )

  const dashboardStats = [
    {
      title: 'Active Matches',
      value: activeMatches,
      change: `${matches.length} total connections`,
      icon: '🤝',
    },
    {
      title: 'Teaching Skills',
      value: totalSkillsTaught,
      change: totalSkillsTaught ? 'Ready to share' : 'Add more skills',
      icon: '🌟',
    },
    {
      title: 'Learning Goals',
      value: totalSkillsToLearn,
      change: totalSkillsToLearn ? 'Fuel your growth' : 'Set your goals',
      icon: '🚀',
    },
  ]

  const formatRelativeTime = (isoString) => {
    if (!isoString) return null

    const target = new Date(isoString)
    if (Number.isNaN(target.getTime())) return null

    const diffMs = Date.now() - target.getTime()
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day

    if (diffMs < minute) return 'just now'
    if (diffMs < hour) {
      const minutes = Math.round(diffMs / minute)
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }
    if (diffMs < day) {
      const hours = Math.round(diffMs / hour)
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }
    if (diffMs < week) {
      const days = Math.round(diffMs / day)
      return `${days} day${days === 1 ? '' : 's'} ago`
    }

    return target.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  const weeklyFocusDays = useMemo(() => {
    const conversations = chatActivity.conversations || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday as day 0

    const dayBuckets = Array.from({ length: 7 }, () => new Set())
    const dayMs = 24 * 60 * 60 * 1000

    conversations.forEach((conversation) => {
      const referenceTimestamp = conversation.lastMessageAt || conversation.createdAt
      if (!referenceTimestamp) return

      const eventDate = new Date(referenceTimestamp)
      if (Number.isNaN(eventDate.getTime())) return

      eventDate.setHours(0, 0, 0, 0)

      const diff = Math.floor((eventDate.getTime() - startOfWeek.getTime()) / dayMs)

      if (diff < 0 || diff > 6) return

      const uniqueKey = conversation.matchId || conversation.conversationId || conversation.otherUser?.id || referenceTimestamp
      dayBuckets[diff].add(uniqueKey)
    })

    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return dayBuckets.map((bucket, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)

      const isFuture = date.getTime() > today.getTime()
      const interactions = bucket.size

      let status = 'Pending'
      let colorClass = isFuture ? 'text-slate-300' : 'text-slate-400'

      if (!isFuture) {
        if (interactions >= 2) {
          status = 'Completed'
          colorClass = 'text-emerald-600'
        } else if (interactions === 1) {
          status = 'Halfway'
          colorClass = 'text-orange-500'
        }
      }

      return {
        label: `Day ${index + 1}`,
        dayName: dayLabels[index],
        status,
        colorClass,
        isFuture,
      }
    })
  }, [chatActivity.conversations])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/70">
        Loading your dashboard...
      </div>
    )
  }

  return (
    <div className="px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-12">
        <section className="rounded-3xl bg-gradient-to-r from-primary-950 via-primary-900 to-primary-700 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">Welcome back</p>
              <h1 className="mt-2 text-4xl font-semibold md:text-5xl">
                {profile?.name ? `${profile.name}, ` : ''}Your Skill Exchange HQ
              </h1>
              <p className="mt-4 max-w-xl text-white/80">
                Track your progress, celebrate wins, and jump back in with your matches. The AI has lined up
                a few suggestions to keep your momentum strong.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl bg-white/10 p-6 text-sm backdrop-blur md:w-72">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Reciprocity Balance</span>
                <span className="text-lg font-semibold">{reciprocityScore}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/20">
                <div
                  className="h-1 rounded-full bg-white"
                  style={{ width: `${Math.max(20, reciprocityScore)}%` }}
                />
              </div>
              <p className="text-white/80">
                Keep a balance between what you teach and learn for sharper matching.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {dashboardStats.map((card) => (
            <div key={card.title} className="card relative overflow-hidden">
              <span className="absolute -right-4 -top-4 text-6xl opacity-10">{card.icon}</span>
              <div className="flex items-start justify-between">
                <p className="text-lg font-semibold text-slate-800">{card.title}</p>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="mt-4 text-4xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-2 text-sm font-medium text-primary-600">{card.change}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-2xl font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-2 text-sm text-slate-500">
              Suggested by the AI to keep your learning loop active.
            </p>
            <div className="mt-6 space-y-3">
              {quickActions.map((action) => (
                <div
                  key={action}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700"
                >
                  {action}
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={() => navigate('/profile')} className="btn-secondary w-full">
                ✏️ Update Your Profile
              </button>
              <button onClick={handleFindMatches} disabled={searching} className="btn-primary w-full">
                {searching ? '🔍 Searching...' : '🎯 Find New Matches'}
              </button>
              <button onClick={() => navigate('/conversations')} className="btn-secondary w-full">
                💬 My Conversations
              </button>
              <button onClick={() => navigate('/view-matches')} className="btn-secondary w-full">
                👥 View All Matches
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Chat Momentum</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stay connected by re-engaging with recent conversations.
                </p>
              </div>
              <button onClick={() => navigate('/conversations')} className="btn-secondary sm:w-auto">
                💬 Go to Inbox
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {chatActivity.lastInteractionAt ? (
                <div className="rounded-2xl border border-primary-100/70 bg-primary-50/50 p-5 text-slate-800">
                  <p className="text-sm uppercase tracking-wide text-primary-600">Last chat touchpoint</p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatRelativeTime(chatActivity.lastInteractionAt)}
                  </p>
                  {chatActivity.partnerName && (
                    <p className="text-sm text-slate-600">
                      With <span className="font-semibold text-slate-800">{chatActivity.partnerName}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-600">
                  No recent chat activity yet. Start a conversation to get momentum going!
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Pro tip</p>
                <p className="mt-2">
                  Aim for at least one check-in per week with each active match to keep learning energy strong.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Progress Highlights</h2>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Auto-insights</span>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {progressUpdates.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">{item.metric}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card bg-gradient-to-br from-primary-50 to-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Weekly Focus</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Keep your streak alive by completing at least two micro-sessions each day.
                </p>
              </div>
              {chatActivity.lastInteractionAt && (
                <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
                  Last chat {formatRelativeTime(chatActivity.lastInteractionAt)}
                </div>
              )}
            </div>

            {!chatActivity.lastInteractionAt && (
              <div className="mt-4 rounded-2xl border border-dashed border-primary-200 bg-white/80 p-4 text-sm text-primary-700">
                Haven’t chatted lately? Say hi in your inbox to kick-start a new learning streak.
              </div>
            )}

            <div className="mt-6 space-y-4">
              {weeklyFocusDays.map((day) => (
                <div
                  key={day.label}
                  className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
                >
                  <span>{day.label} · {day.dayName}</span>
                  <span className={`${day.colorClass} font-semibold`}>
                    {day.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card bg-white/90 text-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recent Matches</h2>
              <p className="text-sm text-slate-500">
                Peek at the latest connections the AI lined up for you.
              </p>
            </div>
            <button onClick={() => navigate('/view-matches')} className="btn-primary sm:w-auto">
              Manage Matches
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No matches yet. Add more skills to your profile and let the AI get to work.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {matches.slice(0, 3).map((match) => {
                const partner = match.user_a?.id === user?.id ? match.user_b : match.user_a
                const partnerName = partner?.name || partner?.email || 'New connection'
                const score = match.score ? Math.round(match.score * 100) : 80

                return (
                  <div
                    key={match.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-600">Match Score · {score}%</p>
                        <h3 className="text-lg font-semibold text-slate-900">{partnerName}</h3>
                        <p className="text-sm text-slate-500 capitalize">Status: {match.status || 'pending'}</p>
                      </div>
                      <button onClick={() => navigate('/view-matches')} className="btn-secondary sm:w-auto">
                        View Conversation
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
