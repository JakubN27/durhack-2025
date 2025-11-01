#!/bin/bash

# Chat Database Setup Script
# This script helps you set up the chat-related database tables and functions

echo "🗄️  SkillSwap Chat Database Setup"
echo "================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Supabase credentials"
    echo "See .env.example for reference"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "You have two options to run the migration:"
    echo ""
    echo "Option 1: Install Supabase CLI"
    echo "  npm install -g supabase"
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Manual migration via Supabase Dashboard"
    echo "  1. Go to your Supabase project dashboard"
    echo "  2. Navigate to SQL Editor"
    echo "  3. Copy and paste the contents of:"
    echo "     supabase/migrations/20251101130000_chat_enhancements.sql"
    echo "  4. Click 'Run' to execute the migration"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Ask for confirmation
echo "This will create the following database objects:"
echo "  - conversations table"
echo "  - notifications table"
echo "  - message_events table"
echo "  - Enhanced users table (new columns)"
echo "  - Enhanced matches table (new columns)"
echo "  - Database functions for chat operations"
echo "  - Row Level Security policies"
echo "  - Database triggers"
echo ""
read -p "Continue with migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Running migration..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Run the migration
if supabase db push; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify tables in Supabase Dashboard > Table Editor"
    echo "  2. Test endpoints with: npm run dev"
    echo "  3. Check the API documentation: backend/CHAT_API_DOCUMENTATION.md"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Please try manual migration:"
    echo "  1. Go to Supabase Dashboard > SQL Editor"
    echo "  2. Run: supabase/migrations/20251101130000_chat_enhancements.sql"
    echo ""
    exit 1
fi
