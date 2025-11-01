# SkillSwap Backend Environment Setup

## Required Environment Variables

Create a `.env` file in this directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Gemini AI API Key (optional for skill extraction features)
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3000
```

## How to Get These Values

### Supabase URL and Service Key

1. Go to your Supabase project dashboard
2. Click on the ⚙️ Settings icon
3. Go to "API" section
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_KEY`
   
⚠️ **Important**: Use the `service_role` key, NOT the `anon` key! The backend needs full database access.

### Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy it to `GEMINI_API_KEY`

## Quick Setup

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor

# Install dependencies
npm install

# Seed test data
npm run seed

# Start server
npm run dev
```

## Verify Setup

Once configured, you should see:
```
✅ Supabase connected successfully
🚀 Server running on http://localhost:3000
```

If you see errors, check that:
- `.env` file exists in the backend directory
- All values are correct (no extra spaces)
- Supabase project is active and accessible
