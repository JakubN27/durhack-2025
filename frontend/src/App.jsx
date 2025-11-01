import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout session={session} />}>
        <Route index element={session ? <Navigate to="/dashboard" /> : <Home />} />
        <Route
          path="profile"
          element={session ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="matches"
          element={session ? <Matches /> : <Navigate to="/" />}
        />
        <Route
          path="chat/:matchId"
          element={session ? <Chat /> : <Navigate to="/" />}
        />
        <Route
          path="dashboard"
          element={session ? <Dashboard /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  )
}

export default App
