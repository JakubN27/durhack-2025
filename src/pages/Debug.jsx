import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Debug() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [debug, setDebug] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      const results = {}
      
      // 1. Check current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      results.currentUser = authUser ? {
        id: authUser.id,
        email: authUser.email
      } : null
      setUser(authUser)
      
      if (!authUser) {
        results.error = 'No user logged in'
        setDebug(results)
        setLoading(false)
        return
      }
      
      // 2. Check user profile
      try {
        const userResponse = await fetch(`http://localhost:3000/api/users/${authUser.id}`)
        const userData = await userResponse.json()
        results.profile = userData.success ? userData.data : { error: userData.error }
      } catch (err) {
        results.profile = { error: err.message }
      }
      
      // 3. Check matches
      try {
        const matchResponse = await fetch(`http://localhost:3000/api/matching/user/${authUser.id}`)
        const matchData = await matchResponse.json()
        results.matches = matchData.success ? {
          count: matchData.count,
          matches: matchData.matches
        } : { error: matchData.error }
      } catch (err) {
        results.matches = { error: err.message }
      }
      
      // 4. Check conversations
      try {
        const convResponse = await fetch(`http://localhost:3000/api/chat/conversations/${authUser.id}`)
        const convData = await convResponse.json()
        results.conversations = convData.success ? {
          count: convData.count,
          conversations: convData.conversations
        } : { error: convData.error }
      } catch (err) {
        results.conversations = { error: err.message }
      }
      
      // 5. Check backend status
      try {
        const healthResponse = await fetch('http://localhost:3000/health')
        results.backend = healthResponse.ok ? 'Running' : 'Error'
      } catch (err) {
        results.backend = 'Not running or not accessible'
      }
      
      // 6. Check TalkJS config
      results.talkjs = {
        appId: import.meta.env.VITE_TALKJS_APP_ID || 'NOT SET',
        configured: !!import.meta.env.VITE_TALKJS_APP_ID
      }
      
      setDebug(results)
    } catch (error) {
      console.error('Diagnostic error:', error)
      toast.error('Failed to run diagnostics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-xl text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔍 Debug Information</h1>
          <p className="text-gray-600">
            Diagnostic information for troubleshooting
          </p>
        </div>
        <button
          onClick={() => runDiagnostics()}
          className="btn-secondary"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Debug Info */}
      <div className="space-y-6">
        {/* Current User */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>👤</span>
            Current User
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debug.currentUser, null, 2)}
          </pre>
        </div>

        {/* Profile */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📝</span>
            Profile
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debug.profile, null, 2)}
          </pre>
        </div>

        {/* Matches */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🤝</span>
            Matches
            {debug.matches?.count !== undefined && (
              <span className="text-sm font-normal text-gray-600">
                ({debug.matches.count} total)
              </span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm max-h-96">
            {JSON.stringify(debug.matches, null, 2)}
          </pre>
        </div>

        {/* Conversations */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💬</span>
            Conversations
            {debug.conversations?.count !== undefined && (
              <span className="text-sm font-normal text-gray-600">
                ({debug.conversations.count} total)
              </span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm max-h-96">
            {JSON.stringify(debug.conversations, null, 2)}
          </pre>
        </div>

        {/* Backend Status */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🖥️</span>
            Backend Status
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              debug.backend === 'Running' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-lg">{debug.backend}</span>
          </div>
        </div>

        {/* TalkJS Config */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💬</span>
            TalkJS Configuration
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debug.talkjs, null, 2)}
          </pre>
        </div>

        {/* Quick Actions */}
        <div className="card bg-primary-50 border-2 border-primary-200">
          <h2 className="text-xl font-bold mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="btn-secondary"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="btn-secondary"
            >
              Find Matches
            </button>
            <button
              onClick={() => navigate('/conversations')}
              className="btn-secondary"
            >
              View Conversations
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debug, null, 2))
                toast.success('Debug info copied to clipboard!')
              }}
              className="btn-secondary"
            >
              📋 Copy Debug Info
            </button>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="card bg-yellow-50 border-2 border-yellow-200">
          <h2 className="text-xl font-bold mb-4">💡 Troubleshooting Tips</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>No conversations?</strong> Go to Matches page and create a match first.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Other user can't see chat?</strong> Make sure they check the Conversations page, not Matches.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Backend not running?</strong> Start it with: <code className="bg-white px-2 py-1 rounded">cd backend && npm start</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>TalkJS not configured?</strong> Set VITE_TALKJS_APP_ID in frontend/.env file.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
