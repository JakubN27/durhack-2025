-- Fix for Conversations Not Showing Up
-- Run this in Supabase SQL Editor to fix existing matches

-- 1. Ensure all matches have chat_enabled set to true
UPDATE matches 
SET chat_enabled = true 
WHERE chat_enabled IS NULL OR chat_enabled = false;

-- 2. Check if matches exist and show the results
SELECT 
  m.id,
  m.user_a_id,
  m.user_b_id,
  m.status,
  m.chat_enabled,
  m.created_at,
  ua.name as user_a_name,
  ua.email as user_a_email,
  ub.name as user_b_name,
  ub.email as user_b_email
FROM matches m
LEFT JOIN users ua ON m.user_a_id = ua.id
LEFT JOIN users ub ON m.user_b_id = ub.id
ORDER BY m.created_at DESC
LIMIT 20;

-- 3. Check for any matches without user data (orphaned matches)
SELECT 
  m.id,
  m.user_a_id,
  m.user_b_id,
  m.status,
  CASE 
    WHEN ua.id IS NULL THEN 'User A missing'
    WHEN ub.id IS NULL THEN 'User B missing'
    ELSE 'OK'
  END as data_status
FROM matches m
LEFT JOIN users ua ON m.user_a_id = ua.id
LEFT JOIN users ub ON m.user_b_id = ub.id
WHERE ua.id IS NULL OR ub.id IS NULL;

-- 4. Show conversation counts per user
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(DISTINCT m.id) as match_count
FROM users u
LEFT JOIN matches m ON (u.id = m.user_a_id OR u.id = m.user_b_id)
GROUP BY u.id, u.name, u.email
ORDER BY match_count DESC;

-- 5. Verify the matches table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'matches'
ORDER BY ordinal_position;
