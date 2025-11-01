import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const mode = params.get('mode')

    if (mode === 'signup') {
      setIsSignUp(true)
    }

    if (mode === 'login') {
      setIsSignUp(false)
    }
  }, [location.search])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!supabase) {
      setError('Supabase is not configured. Please check your .env.local file.')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              name: name
            }
          }
        })
        
        if (error) throw error
        
        if (data?.user?.identities?.length === 0) {
          toast.error('This email is already registered. Please sign in instead.')
          setIsSignUp(false)
        } else {
          // Create user profile in the database via backend API
          try {
            const response = await fetch('http://localhost:3000/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: data.user.id,
                email: email,
                name: name || email.split('@')[0],
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&size=200`,
              })
            })

            if (!response.ok) {
              console.error('Failed to create user profile')
            }
          } catch (profileError) {
            console.error('Error creating profile:', profileError)
          }

          toast.success('Success! Check your email for confirmation link.')
          setIsSignUp(false)
          setEmail('')
          setPassword('')
          setName('')
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 18%, rgba(59,156,122,0.45), transparent 45%), radial-gradient(circle at 82% 12%, rgba(68,189,153,0.28), transparent 42%)',
        }}
      />

      <div className="relative min-h-[calc(100vh-6rem)] px-4 py-16">
        <div className="max-w-5xl mx-auto grid gap-12 md:grid-cols-[1.1fr_1fr] items-center">
          <div className="space-y-6 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-white/70">
              Enter the SkillSwap studio
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              {isSignUp ? 'Create your SkillSwap identity' : 'Welcome back to your growth hub'}
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-lg">
              {isSignUp
                ? 'Set your intentions, unlock curated matches, and start co-creating with mentors who mirror your ambition.'
                : 'Continue where you left off, sync with your learning partner, and let the AI momentum coach keep you on track.'}
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs font-semibold">1</span>
                <div>
                  <p className="font-semibold text-white">Instant AI pairing</p>
                  <p className="text-white/70">Find collaborators who complement your skill graph the moment you join.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs font-semibold">2</span>
                <div>
                  <p className="font-semibold text-white">Shared playbooks</p>
                  <p className="text-white/70">Plan sessions, swap resources, and capture breakthroughs in one place.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/15 bg-primary-950/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {!supabase && (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                ⚠️ Supabase is not configured. Please add your credentials to{' '}
                <code className="rounded bg-red-500/20 px-1 text-red-100">.env.local</code>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">Name</label>
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  if (isSignUp) {
                    navigate('/login?mode=login', { replace: true })
                  } else {
                    navigate('/login?mode=signup', { replace: true })
                  }
                }}
                className="font-semibold text-primary-200 hover:text-primary-100 bg-transparent"
              >
                {isSignUp ? 'Already have an account? Sign in' : "New here? Create an account"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium text-white/60 transition hover:text-white bg-transparent"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
