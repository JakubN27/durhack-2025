import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Conversations from './pages/Conversations'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

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
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout session={session} />}>
          <Route index element={<Home />} />
          <Route 
            path="login" 
            element={session ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route
            path="profile"
            element={session ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="matches"
            element={session ? <Matches /> : <Navigate to="/login" />}
          />
          <Route
            path="conversations"
            element={session ? <Conversations /> : <Navigate to="/login" />}
          />
          <Route
            path="chat/:matchId"
            element={session ? <Chat /> : <Navigate to="/login" />}
          />
          <Route
            path="dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Route>
      </Routes>
    </>
  )
}

export default App
