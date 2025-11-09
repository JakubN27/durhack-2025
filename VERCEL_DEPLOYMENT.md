# Vercel Deployment Guide

## Quick Setup

### 1. Connect GitHub to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `JakubN27/skill-swap` repository
3. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2. Set Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

#### Server-Side (API Functions)
```
SUPABASE_URL=https://qkpheubpwntynozyptbh.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
TALKJS_APP_ID=<your-talkjs-app-id>
TALKJS_SECRET_KEY=<your-talkjs-secret-key>
```

#### Client-Side (Embedded in Frontend Bundle)
```
VITE_SUPABASE_URL=https://qkpheubpwntynozyptbh.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
VITE_TALKJS_APP_ID=<your-talkjs-app-id>
VITE_API_URL=
```

> **Note:** Leave `VITE_API_URL` empty for production (uses relative URLs)

Select **Production**, **Preview**, and **Development** for all variables.

### 3. Deploy

Click **Deploy** in Vercel dashboard, or push to `main` branch to trigger auto-deployment.

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Vercel Deployment (Single Project)                 │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  Static Frontend (Vite Build)               │   │
│  │  Served from /dist                          │   │
│  │  Routes: /, /matches, /messages, etc.      │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  Serverless API Functions                   │   │
│  │  /api/* → api/[...slug].js (catch-all)     │   │
│  │  Wraps Express app with serverless-http    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Key Files

1. **`vercel.json`** - Deployment configuration
   - Builds static frontend from `package.json`
   - Compiles `api/**/*.js` as serverless functions
   - Routes `/api/*` to catch-all handler
   - Routes everything else to `index.html` (SPA)

2. **`api/[...slug].js`** - Serverless wrapper
   - Imports Express app from `api/server.js`
   - Wraps it with `serverless-http` adapter
   - Handles all `/api/*` requests

3. **`api/server.js`** - Express app
   - Exports app instance (doesn't call `.listen()`)
   - Defines all API routes
   - Works locally AND in serverless

4. **`api/start.js`** - Local development only
   - Imports app and calls `.listen(PORT)`
   - Used by `npm run dev` for local testing
   - **Not deployed to Vercel**

### Environment Loading

**Local Development:**
- Backend: Loads `api/.env` via `DOTENV_CONFIG_PATH` in `package.json` scripts
- Frontend: Vite loads `.env.local` automatically

**Production (Vercel):**
- Backend: Vercel injects env vars directly into serverless functions
- Frontend: Vite embeds `VITE_*` vars at build time from Vercel env

### Routing

| URL Pattern | Handler | Purpose |
|-------------|---------|---------|
| `/api/*` | `api/[...slug].js` | All API endpoints (auth, users, matching, etc.) |
| `/` | `dist/index.html` | Frontend SPA root |
| `/matches` | `dist/index.html` | Frontend route (React Router handles) |
| `/messages` | `dist/index.html` | Frontend route (React Router handles) |
| Any other path | `dist/index.html` | Frontend SPA (client-side routing) |

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all `VITE_*` env vars are set
- Ensure `npm run build` works locally

### API Errors (500/502)
- Check Function logs in Vercel dashboard
- Verify server-side env vars are set (without `VITE_` prefix)
- Check `api/config/supabase.js` and `api/config/gemini.js` load correctly

### CORS Issues
- Ensure frontend uses relative URLs (`/api/users` not `http://localhost:3000/api/users`)
- Or set `VITE_API_URL=` (empty) for production

### Cold Start Delays
- First request to API may take 1-2 seconds (serverless cold start)
- Subsequent requests are fast
- Consider upgrading to Vercel Pro for faster cold starts

---

## CLI Deployment (Alternative)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs <deployment-url>
```

---

## Local Development vs Production

| Aspect | Local | Vercel |
|--------|-------|--------|
| Backend | Node server on port 3000 | Serverless functions |
| Frontend | Vite dev server on port 5173/5174 | Static files from `dist/` |
| API URL | `http://localhost:3000` | Relative URLs `/api/*` |
| Env Loading | `dotenv` from files | Injected by Vercel |
| Hot Reload | `--watch` flag | Redeploy on push |

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Import repo in Vercel
3. ✅ Set environment variables
4. ✅ Deploy
5. 🔍 Test your production deployment
6. 🔧 Monitor logs for any issues
7. 🚀 Share your app!

Your deployment URL will be: `https://skill-swap-<random>.vercel.app`

You can configure a custom domain in Vercel dashboard → **Settings** → **Domains**.
