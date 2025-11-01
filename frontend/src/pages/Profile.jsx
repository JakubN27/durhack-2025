import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    teach_skills: [],
    learn_skills: []
  })
  const [newTeachSkill, setNewTeachSkill] = useState({ name: '', category: 'Programming', proficiency: 'beginner' })
  const [newLearnSkill, setNewLearnSkill] = useState({ name: '', category: 'Programming', proficiency: 'beginner' })

  const categories = ['Programming', 'Frontend', 'Backend', 'Mobile', 'AI', 'Design', 'DevOps', 'Database', 'Cloud', 'Other']
  const proficiencies = ['beginner', 'intermediate', 'advanced', 'expert']

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      if (!supabase) {
        console.error('Supabase not configured')
        return
      }

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
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeachSkill = () => {
    if (!newTeachSkill.name.trim()) {
      toast.error('Please enter a skill name')
      return
    }

    const updatedSkills = [...(profile.teach_skills || []), newTeachSkill]
    setProfile({ ...profile, teach_skills: updatedSkills })
    setNewTeachSkill({ name: '', category: 'Programming', proficiency: 'beginner' })
    toast.success('Skill added! Remember to save your profile.')
  }

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.name.trim()) {
      toast.error('Please enter a skill name')
      return
    }

    const updatedSkills = [...(profile.learn_skills || []), newLearnSkill]
    setProfile({ ...profile, learn_skills: updatedSkills })
    setNewLearnSkill({ name: '', category: 'Programming', proficiency: 'beginner' })
    toast.success('Skill added! Remember to save your profile.')
  }

  const handleRemoveTeachSkill = (index) => {
    const updatedSkills = profile.teach_skills.filter((_, idx) => idx !== index)
    setProfile({ ...profile, teach_skills: updatedSkills })
    toast.success('Skill removed! Remember to save your profile.')
  }

  const handleRemoveLearnSkill = (index) => {
    const updatedSkills = profile.learn_skills.filter((_, idx) => idx !== index)
    setProfile({ ...profile, learn_skills: updatedSkills })
    toast.success('Skill removed! Remember to save your profile.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!supabase) {
        toast.error('Supabase not configured')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      // Update profile via backend API
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile.name) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-600 mb-8">Tell us about your skills and what you want to learn</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
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
                placeholder="Tell us about yourself, your interests, and your experience..."
                required
              />
            </div>
          </div>
        </div>

        {/* Skills You Can Teach */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🎓 Skills You Can Teach</h2>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <input
                type="text"
                placeholder="Skill name (e.g., React)"
                className="input"
                value={newTeachSkill.name}
                onChange={(e) => setNewTeachSkill({ ...newTeachSkill, name: e.target.value })}
              />
              <select
                className="input"
                value={newTeachSkill.category}
                onChange={(e) => setNewTeachSkill({ ...newTeachSkill, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                className="input"
                value={newTeachSkill.proficiency}
                onChange={(e) => setNewTeachSkill({ ...newTeachSkill, proficiency: e.target.value })}
              >
                {proficiencies.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTeachSkill}
                className="btn-primary"
              >
                + Add
              </button>
            </div>
          </div>

          {profile.teach_skills?.length > 0 ? (
            <div className="space-y-2">
              {profile.teach_skills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-sm text-gray-600 ml-3">
                      {skill.category} · {skill.proficiency}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeachSkill(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No skills added yet</p>
          )}
        </div>

        {/* Skills You Want to Learn */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🌱 Skills You Want to Learn</h2>
          
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <input
                type="text"
                placeholder="Skill name (e.g., Python)"
                className="input"
                value={newLearnSkill.name}
                onChange={(e) => setNewLearnSkill({ ...newLearnSkill, name: e.target.value })}
              />
              <select
                className="input"
                value={newLearnSkill.category}
                onChange={(e) => setNewLearnSkill({ ...newLearnSkill, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                className="input"
                value={newLearnSkill.proficiency}
                onChange={(e) => setNewLearnSkill({ ...newLearnSkill, proficiency: e.target.value })}
              >
                {proficiencies.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddLearnSkill}
                className="btn-primary"
              >
                + Add
              </button>
            </div>
          </div>

          {profile.learn_skills?.length > 0 ? (
            <div className="space-y-2">
              {profile.learn_skills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-sm text-gray-600 ml-3">
                      {skill.category} · {skill.proficiency}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLearnSkill(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No skills added yet</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/dashboard'}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
