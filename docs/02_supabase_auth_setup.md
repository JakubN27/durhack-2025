# Supabase Authentication Setup

**Date:** 1 November 2025  
**Task:** Configure Supabase CLI to avoid repeated password entry

## Option 1: Link Your Project (Recommended)

This links your local project to your Supabase project using an access token.

```bash
# Login to Supabase (one-time)
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref
```

**Where to find your project ref:**
- Go to Supabase Dashboard → Project Settings → General
- Copy the "Reference ID"

After linking, all commands will use your stored credentials automatically.

## Option 2: Use Environment Variables

Create a `.env.local` file in your project root:

```bash
SUPABASE_ACCESS_TOKEN=your_access_token_here
SUPABASE_DB_PASSWORD=your_db_password_here
```

**To get your access token:**
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Copy and paste into `.env.local`

## Option 3: Use supabase/config.toml

If you initialized the project with `supabase init`, you can store credentials in `supabase/config.toml`:

```toml
[auth]
enabled = true
site_url = "http://localhost:3000"

[db]
port = 54322
major_version = 15
```

Then link with:
```bash
supabase db remote set "postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Recommended Setup

1. **Run once:** `supabase login` (opens browser, authenticates via OAuth)
2. **Run once:** `supabase link --project-ref your-project-ref`
3. **Done!** All future commands work without passwords

## Security Note

Add to `.gitignore`:
```
.env.local
.env*.local
supabase/.temp
```

---

*Last updated: 1 November 2025*
