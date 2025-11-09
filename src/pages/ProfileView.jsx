import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function ProfileView() {
  const { userId } = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user to check if viewing own profile
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id
      setIsOwnProfile(user?.id === targetUserId)

      if (!targetUserId) {
        toast.error('User not found')
        return
      }

      // Fetch profile data
      const response = await fetch(`http://localhost:3000/api/users/${targetUserId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setProfile(result.data)
        
        // Fetch user stats (matches, conversations, etc.)
        await loadStats(targetUserId)
      } else {
        throw new Error(result.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (userId) => {
    try {
      // Get matches count
      const matchesResponse = await fetch(`http://localhost:3000/api/matching/user/${userId}`)
      const matchesResult = await matchesResponse.json()
      
      const matchesCount = matchesResult.success ? matchesResult.count || 0 : 0
      const teachSkillsCount = profile?.teach_skills?.length || 0
      const learnSkillsCount = profile?.learn_skills?.length || 0

      setStats({
        matches: matchesCount,
        teachSkills: teachSkillsCount,
        learnSkills: learnSkillsCount,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats({
        matches: 0,
        teachSkills: profile?.teach_skills?.length || 0,
        learnSkills: profile?.learn_skills?.length || 0,
      })
    }
  }

  const getPersonalityEmoji = (type) => {
    return type === 'introvert' ? '🧘' : '🎈'
  }

  const getRhythmEmoji = (rhythm) => {
    return rhythm === 'early_bird' ? '🌅' : '🌙'
  }

  const formatLabel = (value) => {
    if (!value) return ''
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">Profile not found</p>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Edit Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to={isOwnProfile ? "/dashboard" : "/matches"}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          {isOwnProfile && (
            <Link 
              to="/profile"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email)}&size=200`}
                  alt={profile.name || 'Profile'}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {profile.personal_color && (
                  <div 
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-white shadow-lg"
                    style={{ backgroundColor: profile.personal_color }}
                    title={`Personal Color: ${profile.personal_color}`}
                  ></div>
                )}
              </div>

              {/* Name and Bio */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold mb-2">{profile.name || 'Anonymous'}</h1>
                {profile.bio && (
                  <p className="text-primary-100 text-lg max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 px-8 py-6 bg-slate-50 border-b border-slate-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stats?.matches || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.teachSkills || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Teaching</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.learnSkills || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Learning</div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="px-8 py-6 space-y-8">
            {/* Skills Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teaching Skills */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👨‍🏫</span>
                  Can Teach
                </h2>
                {profile.teach_skills && profile.teach_skills.length > 0 ? (
                  <div className="space-y-3">
                    {profile.teach_skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="bg-green-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900">{skill.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                {skill.category}
                              </span>
                              <span className="text-green-600">
                                {formatLabel(skill.proficiency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No teaching skills listed</p>
                )}
              </div>

              {/* Learning Skills */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  Wants to Learn
                </h2>
                {profile.learn_skills && profile.learn_skills.length > 0 ? (
                  <div className="space-y-3">
                    {profile.learn_skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">{skill.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {skill.category}
                              </span>
                              <span className="text-blue-600">
                                {formatLabel(skill.proficiency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No learning goals listed</p>
                )}
              </div>
            </div>

            {/* Personality Section */}
            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Personality
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {profile.personality_type && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">{getPersonalityEmoji(profile.personality_type)}</div>
                    <div className="text-sm text-slate-600">Type</div>
                    <div className="font-semibold text-slate-900">{formatLabel(profile.personality_type)}</div>
                  </div>
                )}
                
                {profile.daily_rhythm && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">{getRhythmEmoji(profile.daily_rhythm)}</div>
                    <div className="text-sm text-slate-600">Daily Rhythm</div>
                    <div className="font-semibold text-slate-900">{formatLabel(profile.daily_rhythm)}</div>
                  </div>
                )}
                
                {profile.spirit_animal && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">🦁</div>
                    <div className="text-sm text-slate-600">Spirit Animal</div>
                    <div className="font-semibold text-slate-900">{profile.spirit_animal}</div>
                  </div>
                )}
                
                {profile.favorite_ice_cream && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">🍦</div>
                    <div className="text-sm text-slate-600">Favorite Ice Cream</div>
                    <div className="font-semibold text-slate-900">{profile.favorite_ice_cream}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Empty State for Personality */}
            {!profile.personality_type && !profile.daily_rhythm && !profile.spirit_animal && !profile.favorite_ice_cream && (
              <p className="text-slate-500 italic text-center py-4">No personality information added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
