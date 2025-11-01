-- Chat Enhancement Migration
-- Created: 1 November 2025
-- Description: Enhance database schema for TalkJS integration and better chat support

-- Add avatar URL and profile enhancements to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferred_communication TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS talkjs_signature TEXT,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Add chat-specific fields to matches
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS conversation_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_message_preview TEXT,
ADD COLUMN IF NOT EXISTS unread_count_a INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_count_b INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS archived_by UUID[] DEFAULT ARRAY[]::UUID[];

-- Create conversations table for TalkJS integration
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
    talkjs_conversation_id TEXT UNIQUE NOT NULL,
    participants UUID[] NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create message_events table for tracking (optional - for analytics)
CREATE TABLE IF NOT EXISTS message_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'read', 'typing')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_match', 'new_message', 'session_reminder', 'achievement', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    related_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_matches_conversation_id ON matches(conversation_id);
CREATE INDEX IF NOT EXISTS idx_matches_last_message_at ON matches(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_archived ON matches USING GIN(archived_by);
CREATE INDEX IF NOT EXISTS idx_conversations_match ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_conversations_talkjs_id ON conversations(talkjs_conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_message_events_match ON message_events(match_id);
CREATE INDEX IF NOT EXISTS idx_message_events_sender ON message_events(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_events_type ON message_events(event_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they're part of" ON conversations FOR SELECT 
    USING (auth.uid() = ANY(participants));
CREATE POLICY "Users can create conversations for their matches" ON conversations FOR INSERT 
    WITH CHECK (auth.uid() = ANY(participants));
CREATE POLICY "Users can update their conversations" ON conversations FOR UPDATE 
    USING (auth.uid() = ANY(participants));

-- RLS Policies for message_events
CREATE POLICY "Users can view message events in their matches" ON message_events FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM matches WHERE matches.id = message_events.match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    ));
CREATE POLICY "Users can create message events" ON message_events FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT 
    WITH CHECK (true);  -- Backend will handle this

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active = NOW() WHERE id = NEW.sender_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_active on message send
DROP TRIGGER IF EXISTS trigger_update_last_active ON messages;
CREATE TRIGGER trigger_update_last_active
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Function to update match last_message info
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE matches 
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.match_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update match info on new message
DROP TRIGGER IF EXISTS trigger_update_match_message ON messages;
CREATE TRIGGER trigger_update_match_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_match_last_message();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
DECLARE
    match_record RECORD;
BEGIN
    SELECT user_a_id, user_b_id INTO match_record FROM matches WHERE id = NEW.match_id;
    
    IF match_record.user_a_id = NEW.sender_id THEN
        -- Message from user A, increment B's unread count
        UPDATE matches SET unread_count_b = unread_count_b + 1 WHERE id = NEW.match_id;
    ELSE
        -- Message from user B, increment A's unread count
        UPDATE matches SET unread_count_a = unread_count_a + 1 WHERE id = NEW.match_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment unread count on new message
DROP TRIGGER IF EXISTS trigger_increment_unread ON messages;
CREATE TRIGGER trigger_increment_unread
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_unread_count();

-- Function to reset unread count for a user
CREATE OR REPLACE FUNCTION reset_unread_count(match_uuid UUID, user_uuid UUID)
RETURNS void AS $$
DECLARE
    match_record RECORD;
BEGIN
    SELECT user_a_id, user_b_id INTO match_record FROM matches WHERE id = match_uuid;
    
    IF match_record.user_a_id = user_uuid THEN
        UPDATE matches SET unread_count_a = 0 WHERE id = match_uuid;
    ELSE
        UPDATE matches SET unread_count_b = 0 WHERE id = match_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total unread count for a user
CREATE OR REPLACE FUNCTION get_total_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN user_a_id = user_uuid THEN unread_count_a
                WHEN user_b_id = user_uuid THEN unread_count_b
                ELSE 0
            END
        ), 0)::INTEGER INTO total_count
    FROM matches
    WHERE (user_a_id = user_uuid OR user_b_id = user_uuid)
    AND status = 'active'
    AND chat_enabled = true;
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy conversation access
CREATE OR REPLACE VIEW user_conversations AS
SELECT 
    m.id as match_id,
    m.conversation_id,
    m.created_at as matched_at,
    m.last_message_at,
    m.last_message_preview,
    m.status,
    m.score,
    m.mutual_skills,
    m.user_a_id,
    m.user_b_id,
    m.unread_count_a,
    m.unread_count_b,
    ua.name as user_a_name,
    ua.avatar_url as user_a_avatar,
    ua.is_online as user_a_online,
    ua.last_active as user_a_last_active,
    ub.name as user_b_name,
    ub.avatar_url as user_b_avatar,
    ub.is_online as user_b_online,
    ub.last_active as user_b_last_active
FROM matches m
JOIN users ua ON m.user_a_id = ua.id
JOIN users ub ON m.user_b_id = ub.id
WHERE m.chat_enabled = true
ORDER BY m.last_message_at DESC NULLS LAST;

-- Grant access to the view
GRANT SELECT ON user_conversations TO authenticated;

-- Comments for documentation
COMMENT ON TABLE conversations IS 'Stores TalkJS conversation mappings for matches';
COMMENT ON TABLE message_events IS 'Tracks message events for analytics and features';
COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON COLUMN users.talkjs_signature IS 'HMAC signature for TalkJS authentication';
COMMENT ON COLUMN matches.conversation_id IS 'TalkJS conversation ID';
COMMENT ON COLUMN matches.unread_count_a IS 'Unread message count for user A';
COMMENT ON COLUMN matches.unread_count_b IS 'Unread message count for user B';
COMMENT ON FUNCTION get_total_unread_count IS 'Returns total unread message count for a user across all matches';
