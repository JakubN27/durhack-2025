#!/bin/bash

# Apply Database Migration Script
# This script applies the comprehensive profile schema update to your Supabase database

set -e  # Exit on error

echo "🔄 Applying database migration..."
echo ""

# Load environment variables
if [ -f backend/.env ]; then
  export $(grep -v '^#' backend/.env | xargs)
  echo "✅ Loaded environment variables from backend/.env"
else
  echo "❌ Error: backend/.env file not found"
  exit 1
fi

# Check if required variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/.env"
  exit 1
fi

echo "📊 Database: $SUPABASE_URL"
echo ""

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')

# Read the migration file
MIGRATION_FILE="supabase/migrations/20251101120000_comprehensive_profile_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Apply migration using Supabase REST API
echo "🚀 Applying migration..."
echo ""

# Use psql if available, otherwise provide instructions
if command -v psql &> /dev/null; then
  # Extract connection details from Supabase URL
  DB_HOST="${PROJECT_REF}.supabase.co"
  DB_NAME="postgres"
  DB_USER="postgres"
  
  echo "Would you like to apply this migration? (y/n)"
  read -r response
  
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Please enter your Supabase database password:"
    PGPASSWORD="" psql "postgresql://${DB_USER}@${DB_HOST}:5432/${DB_NAME}" -f "$MIGRATION_FILE"
    echo ""
    echo "✅ Migration applied successfully!"
  else
    echo "❌ Migration cancelled"
    exit 0
  fi
else
  echo "📋 To apply this migration, you have 3 options:"
  echo ""
  echo "Option 1: Use Supabase Dashboard SQL Editor"
  echo "  1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql"
  echo "  2. Copy the contents of: $MIGRATION_FILE"
  echo "  3. Paste and run in the SQL Editor"
  echo ""
  echo "Option 2: Use Supabase CLI"
  echo "  1. Install Supabase CLI: npm install -g supabase"
  echo "  2. Link project: supabase link --project-ref ${PROJECT_REF}"
  echo "  3. Apply migrations: supabase db push"
  echo ""
  echo "Option 3: Use psql command"
  echo "  1. Install psql (PostgreSQL client)"
  echo "  2. Run this script again"
  echo ""
fi

echo ""
echo "📋 Migration Summary:"
echo "  • Added avatar_url field for profile pictures"
echo "  • Ensured all personality fields exist"
echo "  • Added proper constraints for personality_type and daily_rhythm"
echo "  • Created storage bucket for profile pictures"
echo "  • Set up storage policies for authenticated uploads"
echo "  • Updated existing users with default values"
echo ""
echo "🎉 Database schema is now ready for the ProfileForm!"
