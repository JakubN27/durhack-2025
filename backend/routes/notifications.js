import express from 'express'
import { supabase } from '../config/supabase.js'

export const notificationsRouter = express.Router()

/**
 * GET /api/notifications/:userId
 * Get all notifications for a user
 */
notificationsRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50, offset = 0, unreadOnly = false } = req.query

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly === 'true') {
      query = query.eq('read', false)
    }

    const { data, error, count } = await query

    if (error) throw error

    res.json({
      success: true,
      notifications: data || [],
      count: count || 0,
      unreadCount: data?.filter(n => !n.read).length || 0
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/notifications
 * Create a new notification
 */
notificationsRouter.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, actionUrl, relatedId, metadata = {} } = req.body

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'User ID, type, title, and message are required' })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        related_id: relatedId,
        metadata
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      notification: data
    })
  } catch (error) {
    console.error('Create notification error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a notification as read
 */
notificationsRouter.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      notification: data
    })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/notifications/:userId/mark-all-read
 * Mark all notifications as read for a user
 */
notificationsRouter.post('/:userId/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select()

    if (error) throw error

    res.json({
      success: true,
      updated_count: data?.length || 0
    })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
notificationsRouter.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/notifications/:userId/clear-all
 * Clear all read notifications for a user
 */
notificationsRouter.delete('/:userId/clear-all', async (req, res) => {
  try {
    const { userId } = req.params

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true)

    if (error) throw error

    res.json({
      success: true,
      message: 'All read notifications cleared'
    })
  } catch (error) {
    console.error('Clear notifications error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/notifications/:userId/unread-count
 * Get unread notification count
 */
notificationsRouter.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error

    res.json({
      success: true,
      unreadCount: count || 0
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/notifications/batch
 * Create multiple notifications at once
 */
notificationsRouter.post('/batch', async (req, res) => {
  try {
    const { notifications } = req.body

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'Notifications array is required' })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) throw error

    res.json({
      success: true,
      count: data.length,
      notifications: data
    })
  } catch (error) {
    console.error('Create batch notifications error:', error)
    res.status(500).json({ error: error.message })
  }
})
