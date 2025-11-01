#!/bin/bash

# Quick diagnostic script to check your setup status

echo "🔍 SkillSwap Setup Diagnostic"
echo "=============================="
echo ""

# Check if backend .env has TalkJS credentials
echo "1️⃣ Checking backend environment..."
if [ -f "backend/.env" ]; then
    if grep -q "TALKJS_APP_ID=tl0iWYDE" backend/.env; then
        echo "   ✅ Backend TalkJS App ID configured"
    else
        echo "   ❌ Backend TalkJS App ID missing or incorrect"
    fi
    
    if grep -q "TALKJS_SECRET_KEY=sk_test_" backend/.env; then
        echo "   ✅ Backend TalkJS Secret Key configured"
    else
        echo "   ❌ Backend TalkJS Secret Key missing"
    fi
else
    echo "   ❌ backend/.env file not found"
fi
echo ""

# Check if frontend .env has TalkJS App ID
echo "2️⃣ Checking frontend environment..."
if [ -f "frontend/.env" ]; then
    if grep -q "VITE_TALKJS_APP_ID=tl0iWYDE" frontend/.env; then
        echo "   ✅ Frontend TalkJS App ID configured"
    else
        echo "   ❌ Frontend TalkJS App ID missing or incorrect"
    fi
else
    echo "   ❌ frontend/.env file not found"
fi
echo ""

# Check if migration file exists
echo "3️⃣ Checking migration file..."
if [ -f "supabase/migrations/20251101130000_chat_enhancements.sql" ]; then
    echo "   ✅ Chat enhancement migration file exists"
    echo "   📊 File size: $(wc -l < supabase/migrations/20251101130000_chat_enhancements.sql) lines"
else
    echo "   ❌ Migration file not found"
fi
echo ""

# Check if backend is running
echo "4️⃣ Checking backend server..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Backend server is running on port 3000"
    echo "   Testing API endpoints..."
    
    # Test if chat endpoint is registered
    if curl -s http://localhost:3000/ | grep -q "chat"; then
        echo "   ✅ Chat endpoints registered"
    else
        echo "   ⚠️  Chat endpoints not found in API"
    fi
else
    echo "   ❌ Backend server is NOT running on port 3000"
    echo "   💡 Start with: npm run dev"
fi
echo ""

# Check if frontend is running
echo "5️⃣ Checking frontend server..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend server is running on port 5173"
else
    echo "   ❌ Frontend server is NOT running on port 5173"
fi
echo ""

# Summary
echo "📋 Summary & Next Steps"
echo "======================="
echo ""

# Determine what needs to be done
NEEDS_MIGRATION=false
NEEDS_RESTART=false
NEEDS_START=false

if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    NEEDS_START=true
    echo "⚠️  Backend server is not running"
    echo "   👉 Run: npm run dev"
    echo ""
elif ! curl -s http://localhost:3000/ | grep -q "chat"; then
    NEEDS_RESTART=true
    echo "⚠️  Backend needs restart (chat endpoints not registered)"
    echo "   👉 Stop the server (Ctrl+C) and run: npm run dev"
    echo ""
fi

echo "⚠️  The 500 error is likely because:"
echo "   1. Database migration hasn't been run yet"
echo "   2. The 'matches' table doesn't have the new chat columns"
echo ""
echo "🔧 To fix the 500 error:"
echo ""
echo "Step 1: Run the database migration"
echo "   Option A (Automated):"
echo "   ./scripts/setup-chat-db.sh"
echo ""
echo "   Option B (Manual via Supabase Dashboard):"
echo "   1. Go to: https://supabase.com/dashboard"
echo "   2. Select your project"
echo "   3. Click 'SQL Editor' in left sidebar"
echo "   4. Copy contents of: supabase/migrations/20251101130000_chat_enhancements.sql"
echo "   5. Paste and click 'Run'"
echo ""
echo "Step 2: Restart backend (if running)"
echo "   - Stop with Ctrl+C"
echo "   - Start with: npm run dev"
echo ""
echo "Step 3: Test again"
echo "   - The 500 error should be gone"
echo "   - Try creating a match or loading conversations"
echo ""
echo "📖 For detailed help, see:"
echo "   - DATABASE_SETUP.md"
echo "   - TALKJS_CONFIGURED.md"
echo ""
