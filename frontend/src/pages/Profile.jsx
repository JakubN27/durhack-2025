import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    teach_skills: [],
    learn_skills: []
  })

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          ...profile,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      alert('Profile updated successfully!')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile.name) {
    return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            className="input"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            className="input"
            rows="4"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about yourself, your interests, and what you'd like to learn..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Our AI will extract your skills from this bio
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {profile.teach_skills?.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Skills You Can Teach</h2>
          <div className="flex flex-wrap gap-2">
            {profile.teach_skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.learn_skills?.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Skills You Want to Learn</h2>
          <div className="flex flex-wrap gap-2">
            {profile.learn_skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
