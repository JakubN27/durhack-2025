# Database Setup Documentation

**Date:** 1 November 2025  
**Task:** Initial Supabase database schema creation for SkillSwap

## Overview
Setting up the core database tables for the SkillSwap skill exchange platform.

## Database Schema

### Tables Created:

#### 1. `users`
Stores user profiles, skills, and embeddings for AI matching.
- `id` (uuid, primary key)
- `created_at` (timestamp)
- `name` (text)
- `email` (text, unique)
- `bio` (text)
- `teach_skills` (jsonb) - Skills user can teach
- `learn_skills` (jsonb) - Skills user wants to learn
- `embeddings` (vector) - For AI matching using pgvector

#### 2. `matches`
Stores matched user pairs with compatibility scores.
- `id` (uuid, primary key)
- `created_at` (timestamp)
- `user_a_id` (uuid, foreign key to users)
- `user_b_id` (uuid, foreign key to users)
- `score` (float) - Reciprocal matching score
- `mutual_skills` (jsonb) - Skills that match between users
- `status` (text) - 'pending', 'active', 'completed'

#### 3. `sessions`
Tracks learning sessions between matched users.
- `id` (uuid, primary key)
- `created_at` (timestamp)
- `match_id` (uuid, foreign key to matches)
- `date` (timestamp)
- `notes` (text)
- `progress` (jsonb)
- `ai_summary` (text) - AI-generated session summary

#### 4. `achievements`
Gamification: user badges and points.
- `id` (uuid, primary key)
- `created_at` (timestamp)
- `user_id` (uuid, foreign key to users)
- `badge_name` (text)
- `points` (integer)
- `description` (text)

#### 5. `messages`
Chat messages between matched users.
- `id` (uuid, primary key)
- `created_at` (timestamp)
- `match_id` (uuid, foreign key to matches)
- `sender_id` (uuid, foreign key to users)
- `content` (text)
- `read` (boolean)

## Extensions Required
- `pgvector` - For vector embeddings and similarity search

## Next Steps
1. Enable pgvector extension in Supabase
2. Create tables with proper indexes (run `/supabase/migrations/20251101000000_initial_schema.sql`)
3. Set up Row Level Security (RLS) policies
4. Configure API access

## Migration File Location
- **SQL Schema:** `/supabase/migrations/20251101000000_initial_schema.sql`
- This follows Supabase conventions for migration management

---

*Last updated: 1 November 2025*
