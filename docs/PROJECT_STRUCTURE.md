# SkillSwap Project Structure

## Current Setup (Recommended)

```
durhack-2025/
├── frontend/          # React + Vite frontend
│   ├── node_modules/  # Frontend dependencies (isolated)
│   └── package.json
├── backend/           # Express backend API
│   ├── node_modules/  # Backend dependencies (isolated)
│   └── package.json
├── node_modules/      # Root dependencies (only concurrently)
└── package.json       # Root orchestration scripts
```

## Why This Structure?

✅ **Industry Standard**: Most production apps use this separation
✅ **Independent Deployment**: Deploy frontend and backend separately
✅ **Isolated Dependencies**: No conflicts between frontend/backend packages
✅ **Better Organization**: Clear separation of concerns
✅ **Team Workflow**: Different teams can work on frontend/backend independently

## How to Use

### First Time Setup

```bash
# Install all dependencies at once
npm run install:all
```

This will:
1. Install root dependencies (concurrently)
2. Install backend dependencies
3. Install frontend dependencies

### Development

```bash
# Start both frontend and backend
npm run dev
```

This runs:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173

### Individual Development

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Production Build

```bash
# Build frontend for production
npm run build

# Start backend in production
npm start
```

### Clean Install (if having issues)

```bash
# Remove all node_modules and reinstall
npm run fresh-install
```

## Common Issues & Solutions

### Issue: "Cannot find module" errors

**Solution**: Install dependencies
```bash
npm run install:all
```

### Issue: Port already in use

**Solution**: Kill existing processes
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Issue: Changes not reflecting

**Solution**: Restart dev server
```bash
# Stop with Ctrl+C, then restart
npm run dev
```

### Issue: Git tracking node_modules

**Solution**: Already handled by root .gitignore
```bash
# Verify gitignore is working
git status
```

## Alternative: Monorepo Structure (Not Recommended for Now)

If you really want a single node_modules, you can use:
- **Turborepo**: Modern monorepo tool
- **npm workspaces**: Built into npm (already configured in package.json)
- **pnpm workspaces**: Faster alternative

But the current structure is simpler and works perfectly for your use case.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both servers |
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build frontend |
| `npm start` | Start backend production |
| `npm run clean` | Remove all node_modules |
| `npm run fresh-install` | Clean install everything |

## Environment Files

Each part has its own environment file:

- `backend/.env` - Backend config (Supabase, Gemini)
- `frontend/.env.local` - Frontend config (Supabase URL, anon key)

This keeps sensitive keys separate and secure.
