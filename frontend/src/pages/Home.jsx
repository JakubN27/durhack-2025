import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SkillSwap
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered skill exchange platform. Learn from others, teach what you know.
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-700"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="card">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold">AI Matching</h3>
            <p className="text-sm text-gray-600">Smart skill pairing</p>
          </div>
          <div className="card">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="font-semibold">Skill Legacy</h3>
            <p className="text-sm text-gray-600">Track your impact</p>
          </div>
          <div className="card">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold">Gamification</h3>
            <p className="text-sm text-gray-600">Earn badges</p>
          </div>
        </div>
      </div>
    </div>
  )
}
