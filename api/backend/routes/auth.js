import express from 'express'
import { supabase } from '../config/supabase.js'

export const authRouter = express.Router()

/**
 * POST /api/auth/signup
 * Create a new user account
 */
authRouter.post('/signup', async (req, res) => {
  try {
    const { email, password, name, bio } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (authError) throw authError

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: name || '',
          bio: bio || ''
        })

      if (profileError) throw profileError
    }

    res.json({
      success: true,
      user: authData.user,
      session: authData.session
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/auth/login
 * Sign in with email and password
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    res.json({
      success: true,
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(401).json({ error: error.message })
  }
})

/**
 * POST /api/auth/logout
 * Sign out the current user
 */
authRouter.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/auth/session
 * Get current session
 */
authRouter.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.json({ session: null, user: null })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error) throw error

    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.json({ session: null, user: null })
  }
})

/**
 * POST /api/auth/refresh
 * Refresh the access token
 */
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error) throw error

    res.json({
      success: true,
      session: data.session
    })
  } catch (error) {
    console.error('Refresh error:', error)
    res.status(401).json({ error: error.message })
  }
})
