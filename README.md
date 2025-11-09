# SkillSwap 🎓

AI-powered peer-to-peer learning platform (frontend + Express API).

This repository has been reorganized for deployment on Vercel:

- Frontend is now at the repository root (Vite + React). Run `vite` from root.
- Backend remains in `backend/` and is exposed as serverless functions under `/api/*` via `api/[...slug].js` using `serverless-http`.

## Quick local setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Copy the example env and fill values (Supabase, Gemini, TalkJS):

```bash
cp backend/.env.example backend/.env
# edit backend/.env and set SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, TALKJS_APP_ID etc.
```

3. Run development servers (frontend + backend)

```bash
npm run dev
```

This runs the frontend (Vite) and the backend starter via `backend/start.js` (local node server). The backend will expose its API at `http://localhost:3001/api/*` (set `PORT` in `backend/.env` if you want a different port).

4. Build frontend for production

```bash
npm run build
```

The build output will be in `dist/`.

5. Run backend only

```bash
npm start
```

6. Seed test data (optional)

```bash
npm run seed
```

## Deploying to Vercel

This repo is prepared for a single Vercel project. Key points:

- Vercel will run the `build` step (the `vite build` script) and serve the `dist/` static output.
- API routes under `/api/*` are handled by the serverless wrapper `api/[...slug].js` which wraps the Express app in `backend/server.js` using `serverless-http`.

Before deploying, add these environment variables in the Vercel project settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (service role key)
- `GEMINI_API_KEY` (optional — Gemini features)
- `TALKJS_APP_ID` and any TalkJS secrets you require

To deploy: push to your Git remote and create/import the repo in Vercel. Vercel will discover `package.json` and use the `build` script.

Notes:
- Serverless adapters add a small cold-start cost. If you expect heavy backend traffic, consider deploying the backend to a server (Railway/Render) instead and keep the frontend on Vercel.
- The repository no longer uses pnpm. If you cloned earlier with pnpm, run `npm install` to regenerate `package-lock.json`.

## Troubleshooting

- If the backend fails locally with missing Supabase variables, ensure `backend/.env` exists and contains valid keys.
- If Vite build warns about large chunks, consider code-splitting or configuring `build.rollupOptions.output.manualChunks` in `vite.config.js`.

## Files of interest

- `index.html`, `src/`, `vite.config.js`, `tailwind.config.js` — frontend app
- `backend/` — Express app and API logic
- `api/[...slug].js` — Vercel serverless wrapper
- `vercel.json` — Vercel routing and build config
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
