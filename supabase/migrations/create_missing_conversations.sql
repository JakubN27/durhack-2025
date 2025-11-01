-- Create conversations for existing matches that don't have them
-- Run this in Supabase SQL Editor

-- First, let's see which matches don't have conversations
SELECT 
  m.id as match_id,
  m.user_a_id,
  m.user_b_id,
  m.conversation_id,
  CASE WHEN c.id IS NULL THEN '❌ Missing' ELSE '✅ Exists' END as conversation_status
FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id
ORDER BY m.created_at DESC;

-- Create conversations for matches that don't have them
INSERT INTO conversations (match_id, talkjs_conversation_id, participants)
SELECT 
  m.id,
  'match-' || m.id::text,
  ARRAY[m.user_a_id, m.user_b_id]
FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id
WHERE c.id IS NULL
ON CONFLICT (match_id) DO NOTHING;

-- Update matches to have conversation_id if they don't
UPDATE matches m
SET conversation_id = 'match-' || m.id::text
WHERE conversation_id IS NULL;

-- Verify all matches now have conversations
SELECT 
  COUNT(*) as total_matches,
  COUNT(c.id) as matches_with_conversations,
  COUNT(*) - COUNT(c.id) as missing_conversations
FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id;

-- Show recent matches with their conversation status
SELECT 
  m.id,
  m.created_at,
  m.status,
  m.chat_enabled,
  m.conversation_id as match_conv_id,
  c.talkjs_conversation_id as conversation_talkjs_id,
  c.created_at as conversation_created_at,
  ua.name as user_a_name,
  ub.name as user_b_name
FROM matches m
LEFT JOIN conversations c ON c.match_id = m.id
LEFT JOIN users ua ON m.user_a_id = ua.id
LEFT JOIN users ub ON m.user_b_id = ub.id
ORDER BY m.created_at DESC
LIMIT 10;
