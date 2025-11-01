-- SkillSwap Database Schema
-- Created: 1 November 2025
-- Description: Initial database setup for SkillSwap skill exchange platform

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    teach_skills JSONB DEFAULT '[]'::jsonb,
    learn_skills JSONB DEFAULT '[]'::jsonb,
    embeddings vector(1536), -- OpenAI/Gemini embedding dimension
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    mutual_skills JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    CONSTRAINT different_users CHECK (user_a_id != user_b_id),
    CONSTRAINT unique_match UNIQUE (user_a_id, user_b_id)
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    progress JSONB DEFAULT '{}'::jsonb,
    ai_summary TEXT
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    description TEXT
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_user_a ON matches(user_a_id);
CREATE INDEX idx_matches_user_b ON matches(user_b_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_sessions_match ON sessions(match_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Vector similarity index for fast matching
CREATE INDEX idx_users_embeddings ON users USING ivfflat (embeddings vector_cosine_ops);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches: users can see matches they're part of
CREATE POLICY "Users can view their matches" ON matches FOR SELECT 
    USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can create matches" ON matches FOR INSERT 
    WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can update their matches" ON matches FOR UPDATE 
    USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Sessions: users can view/create sessions for their matches
CREATE POLICY "Users can view sessions for their matches" ON sessions FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM matches WHERE matches.id = sessions.match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    ));
CREATE POLICY "Users can create sessions" ON sessions FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM matches WHERE matches.id = match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    ));

-- Achievements: users can view all achievements but only create their own
CREATE POLICY "Users can view all achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Messages: users can view/send messages in their matches
CREATE POLICY "Users can view messages in their matches" ON messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM matches WHERE matches.id = messages.match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    ));
CREATE POLICY "Users can send messages" ON messages FOR INSERT 
    WITH CHECK (auth.uid() = sender_id AND EXISTS (
        SELECT 1 FROM matches WHERE matches.id = match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    ));
CREATE POLICY "Users can update read status" ON messages FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM matches WHERE matches.id = messages.match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    ));
