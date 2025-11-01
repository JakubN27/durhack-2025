import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const profileTips = [
  'Mention recent projects so the AI can surface mentors in the same lane.',
  'List specific topics you enjoy teaching - people love clarity.',
  'Be honest about your learning edges. Reciprocal matches rely on it.',
]

const categories = ['Programming', 'Frontend', 'Backend', 'Mobile', 'AI', 'Design', 'DevOps', 'Database', 'Cloud', 'Other']
const proficiencies = ['beginner', 'intermediate', 'advanced', 'expert']
const personalityOptions = [
  { value: 'introvert', label: 'Introvert', emoji: '🧘' },
  { value: 'extrovert', label: 'Extrovert', emoji: '🎈' },
]
const rhythmOptions = [
  { value: 'early_bird', label: 'Early bird', emoji: '🌅' },
  { value: 'night_owl', label: 'Night owl', emoji: '🌙' },
]

const fieldLabelClass = 'mb-2 block text-sm font-semibold tracking-wide text-slate-900'
const fieldInputClass =
  'input bg-white border-primary-200/70 text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:ring-primary-300/80'
const helperTextClass = 'text-xs text-slate-600'

const formatLabel = (value = '') =>
  value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    teach_skills: [],
    learn_skills: [],
    favorite_ice_cream: '',
    spirit_animal: '',
    personality_type: '',
    daily_rhythm: '',
    personal_color: '',
  })
  const [newTeachSkill, setNewTeachSkill] = useState({
    name: '',
    category: categories[0],
    proficiency: proficiencies[0],
  })
  const [newLearnSkill, setNewLearnSkill] = useState({
    name: '',
    category: categories[0],
    proficiency: proficiencies[0],
  })

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch(`http://localhost:3000/api/users/${user.id}`)
      const result = await response.json()

      if (result.success && result.data) {
        setProfile((prev) => ({
          ...prev,
          ...result.data,
          teach_skills: result.data.teach_skills || [],
          learn_skills: result.data.learn_skills || [],
          favorite_ice_cream: result.data.favorite_ice_cream || '',
          spirit_animal: result.data.spirit_animal || '',
          personality_type: result.data.personality_type || '',
          daily_rhythm: result.data.daily_rhythm || '',
          personal_color: result.data.personal_color || '',
        }))
      } else if (result.error) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
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

    setProfile((prev) => ({
      ...prev,
      teach_skills: [...(prev.teach_skills || []), newTeachSkill],
    }))
    setNewTeachSkill({ name: '', category: categories[0], proficiency: proficiencies[0] })
    toast.success('Skill added! Remember to save your profile.')
  }

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.name.trim()) {
      toast.error('Please enter a skill name')
      return
    }

    setProfile((prev) => ({
      ...prev,
      learn_skills: [...(prev.learn_skills || []), newLearnSkill],
    }))
    setNewLearnSkill({ name: '', category: categories[0], proficiency: proficiencies[0] })
    toast.success('Skill added! Remember to save your profile.')
  }

  const handleRemoveTeachSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      teach_skills: prev.teach_skills.filter((_, idx) => idx !== index),
    }))
    toast.success('Skill removed! Remember to save your profile.')
  }

  const handleRemoveLearnSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      learn_skills: prev.learn_skills.filter((_, idx) => idx !== index),
    }))
    toast.success('Skill removed! Remember to save your profile.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const profileData = {
        ...profile,
        email: user.email,
        teach_skills: profile.teach_skills || [],
        learn_skills: profile.learn_skills || [],
      }

      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile updated successfully!')
        await getProfile()
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const profileCompletion = useMemo(() => {
    const fields = [profile.name, profile.bio, profile.teach_skills?.length, profile.learn_skills?.length]
    const completed = fields.filter((field) => {
      if (Array.isArray(field)) return field > 0
      return Boolean(field)
    }).length
    return Math.min(100, 40 + completed * 15)
  }, [profile])

  if (loading && !profile.name) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/70">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">Profile hub</p>
              <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
                Craft {profile.name ? `${profile.name}'s` : 'your'} SkillSwap identity
              </h1>
              <p className="mt-6 text-white/80">
                Share what lights you up, highlight your strengths, and tell the AI what you want to learn next.
                The richer your story, the sharper your matches.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm text-white/80">Profile completeness</p>
              <p className="mt-2 text-4xl font-semibold">{profileCompletion}%</p>
              <div className="mt-4 h-2 rounded-full bg-white/20">
                <div className="h-2 rounded-full bg-white" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/70">
                Tip: Add more detail to your bio for sharper AI skill extraction.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Your story</h2>
                  <p className="mt-1 text-sm text-slate-600">What should the community know about you?</p>
                </div>
                <span className="rounded-full bg-primary-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
                  AI powered
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={fieldLabelClass}>Name</label>
                  <input
                    type="text"
                    className={fieldInputClass}
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="How should others call you?"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={fieldLabelClass}>Bio</label>
                  <textarea
                    className={`${fieldInputClass} min-h-[140px]`}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Share your background, what you love teaching, and what you are eager to learn."
                    required
                  />
                  <p className={`mt-2 ${helperTextClass}`}>
                    The AI reads this to extract skills and recommend brilliant matches.
                  </p>
                </div>

                <div>
                  <label className={fieldLabelClass}>� Favourite ice cream</label>
                  <input
                    type="text"
                    className={fieldInputClass}
                    value={profile.favorite_ice_cream || ''}
                    onChange={(e) => setProfile({ ...profile, favorite_ice_cream: e.target.value })}
                    placeholder="Mint chocolate chip, vanilla..."
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>🐾 Spirit animal</label>
                  <input
                    type="text"
                    className={fieldInputClass}
                    value={profile.spirit_animal || ''}
                    onChange={(e) => setProfile({ ...profile, spirit_animal: e.target.value })}
                    placeholder="Lion, owl, dolphin..."
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    � If you were a colour, what would you be?
                  </label>
                  <input
                    type="text"
                    className={fieldInputClass}
                    value={profile.personal_color || ''}
                    onChange={(e) => setProfile({ ...profile, personal_color: e.target.value })}
                    placeholder="Deep forest green, sunrise orange..."
                  />
                </div>

                <div className="space-y-3">
                  <label className={`${fieldLabelClass} mb-1`}>🧭 Personality vibe</label>
                  <div className="flex gap-4">
                    {personalityOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <input
                          type="radio"
                          name="personality_type"
                          value={option.value}
                          checked={profile.personality_type === option.value}
                          onChange={(e) => setProfile({ ...profile, personality_type: e.target.value })}
                        />
                        <span>
                          {option.emoji} {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={`${fieldLabelClass} mb-1`}>🕰️ Daily rhythm</label>
                  <div className="flex gap-4">
                    {rhythmOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <input
                          type="radio"
                          name="daily_rhythm"
                          value={option.value}
                          checked={profile.daily_rhythm === option.value}
                          onChange={(e) => setProfile({ ...profile, daily_rhythm: e.target.value })}
                        />
                        <span>
                          {option.emoji} {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={helperTextClass}>
                  Updated {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'just now'}
                </p>
                <button type="submit" className="btn-primary sm:w-auto" disabled={saving}>
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </div>

            <aside className="card space-y-5">
              <h2 className="text-xl font-semibold text-slate-900">Profile tips</h2>
              <ul className="space-y-4 text-sm text-slate-600">
                {profileTips.map((tip) => (
                  <li key={tip}>- {tip}</li>
                ))}
              </ul>
              <button type="button" className="btn-secondary w-full text-sm" onClick={() => toast('Preview coming soon!')}>
                Preview public profile
              </button>
            </aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card bg-gradient-to-br from-primary-50/80 to-white/90">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Skills you can teach</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    These are how you light up the community. Add detail to attract the right learners.
                  </p>
                </div>

                <div className="rounded-2xl border border-primary-100/70 bg-primary-50/60 p-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Skill name (e.g., React)"
                      className={fieldInputClass}
                      value={newTeachSkill.name}
                      onChange={(e) => setNewTeachSkill({ ...newTeachSkill, name: e.target.value })}
                    />
                    <select
                      className={fieldInputClass}
                      value={newTeachSkill.category}
                      onChange={(e) => setNewTeachSkill({ ...newTeachSkill, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <select
                      className={fieldInputClass}
                      value={newTeachSkill.proficiency}
                      onChange={(e) => setNewTeachSkill({ ...newTeachSkill, proficiency: e.target.value })}
                    >
                      {proficiencies.map((level) => (
                        <option key={level} value={level}>
                          {formatLabel(level)}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAddTeachSkill} className="btn-primary">
                      + Add
                    </button>
                  </div>
                </div>

                {profile.teach_skills?.length ? (
                  <div className="space-y-2">
                    {profile.teach_skills.map((skill, idx) => (
                      <div
                        key={`${skill.name}-${idx}`}
                        className="flex items-center justify-between rounded-2xl border border-primary-100 bg-white/90 px-4 py-3 text-sm text-slate-900"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{skill.name}</span>
                          <span className="ml-3 text-xs uppercase tracking-wide text-slate-600">
                            {formatLabel(skill.category)} · {formatLabel(skill.proficiency)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeachSkill(idx)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-primary-200/80 bg-primary-50/60 p-6 text-sm text-slate-900">
                    Share what you love teaching so the AI can spotlight your expertise.
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-white/90 to-slate-50/90">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Skills you want to learn</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Tell the AI what to prioritise next so it can source partners a few steps ahead.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Skill name (e.g., Python)"
                      className={fieldInputClass}
                      value={newLearnSkill.name}
                      onChange={(e) => setNewLearnSkill({ ...newLearnSkill, name: e.target.value })}
                    />
                    <select
                      className={fieldInputClass}
                      value={newLearnSkill.category}
                      onChange={(e) => setNewLearnSkill({ ...newLearnSkill, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <select
                      className={fieldInputClass}
                      value={newLearnSkill.proficiency}
                      onChange={(e) => setNewLearnSkill({ ...newLearnSkill, proficiency: e.target.value })}
                    >
                      {proficiencies.map((level) => (
                        <option key={level} value={level}>
                          {formatLabel(level)}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAddLearnSkill} className="btn-primary">
                      + Add
                    </button>
                  </div>
                </div>

                {profile.learn_skills?.length ? (
                  <div className="space-y-2">
                    {profile.learn_skills.map((skill, idx) => (
                      <div
                        key={`${skill.name}-${idx}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{skill.name}</span>
                          <span className="ml-3 text-xs uppercase tracking-wide text-slate-600">
                            {formatLabel(skill.category)} · {formatLabel(skill.proficiency)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLearnSkill(idx)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200/80 bg-primary-50/50 p-6 text-sm text-slate-900">
                    Tell us what you are exploring next so we can introduce mentors who are a few steps ahead.
                  </div>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}
