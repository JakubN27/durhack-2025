# 📦 Workspace Setup Guide

## Overview

SkillSwap uses **npm workspaces** for a unified development environment. This means:

✅ **Single `node_modules`** at the root level (no duplicates!)  
✅ **Run everything from root** directory  
✅ **Faster installs** with hoisted dependencies  
✅ **Easier maintenance** and consistent versions  

## Project Structure

```
durhack-2025/
├── node_modules/              # ✅ Shared dependencies (285 packages)
├── package.json               # Root workspace configuration
├── package-lock.json          # Lockfile for all packages
│
├── frontend/
│   ├── package.json           # Frontend dependencies
│   ├── src/                   # React source code
│   └── (no node_modules)      # ✅ Uses root node_modules
│
├── backend/
│   ├── package.json           # Backend dependencies
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── (no node_modules)      # ✅ Uses root node_modules
│
└── supabase/
    └── migrations/            # Database migrations
```

## Commands Reference

All commands should be run from the **root directory** (`durhack-2025/`):

### Initial Setup

```bash
# Clean install (first time or after pulling changes)
npm install

# Or clean everything and reinstall
npm run clean && npm install
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Start only backend (on port 3000)
npm run dev:backend

# Start only frontend (on port 5173)
npm run dev:frontend
```

### Workspace-Specific Commands

```bash
# Run a script in a specific workspace
npm run <script> --workspace=<workspace-name>

# Examples:
npm run seed --workspace=backend     # Seed test data
npm run build --workspace=frontend   # Build frontend only
npm test --workspace=frontend        # Run frontend tests
```

### Managing Dependencies

```bash
# Add a dependency to frontend
npm install <package> --workspace=frontend

# Add a dependency to backend
npm install <package> --workspace=backend

# Add a shared/root dependency
npm install <package> -w

# Remove a dependency from frontend
npm uninstall <package> --workspace=frontend
```

### Maintenance

```bash
# Remove all node_modules
npm run clean

# Clean and reinstall everything
npm run fresh-install

# Check for outdated packages
npm outdated

# Update all packages (be careful!)
npm update
```

## How It Works

### package.json (Root)

```json
{
  "name": "skillswap",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  }
}
```

### Workspaces Array

The `workspaces` field tells npm that `frontend/` and `backend/` are part of the monorepo. When you run `npm install` at the root:

1. npm reads all `package.json` files in workspaces
2. Installs all dependencies to root `node_modules/`
3. Creates symlinks for workspace packages
4. Optimizes duplicate dependencies (hoisting)

### Benefits

1. **No Duplicate Installations**: Packages like `@supabase/supabase-js` appear once in `node_modules/`
2. **Faster CI/CD**: Single install step instead of multiple
3. **Consistency**: Same package versions across frontend and backend
4. **Easier Updates**: Update shared dependencies in one place
5. **Better DX**: Run everything from root directory

## Troubleshooting

### "Module not found" errors

```bash
# Reinstall dependencies
npm run clean
npm install
```

### Backend can't find modules

```bash
# Make sure you're running from root
cd /Users/jakubnosek/Programming/durhack-2025
npm run dev:backend
```

### Frontend Vite issues

```bash
# Clear Vite cache
rm -rf frontend/.vite
npm run dev:frontend
```

### Port conflicts

```bash
# Check what's running on ports 3000 and 5173
lsof -i :3000
lsof -i :5173

# Kill processes if needed
kill -9 <PID>
```

### Package version conflicts

```bash
# Check which workspace uses a package
npm ls <package-name>

# Update a specific workspace dependency
npm install <package>@latest --workspace=frontend
```

## Migration from Old Setup

If you had separate `node_modules` in frontend and backend before:

```bash
# 1. Remove old node_modules
npm run clean

# 2. Install with workspaces
npm install

# 3. Verify structure
ls -la node_modules/         # Should have all packages
ls -la frontend/node_modules # Should NOT exist (or be empty)
ls -la backend/node_modules  # Should NOT exist (or be empty)

# 4. Test that everything works
npm run dev
```

## Best Practices

1. **Always run from root**: Use `npm run dev` from root, not `cd frontend && npm run dev`
2. **Use workspace flag**: When adding packages, specify `--workspace=frontend` or `--workspace=backend`
3. **Commit lockfile**: Always commit `package-lock.json` for reproducible builds
4. **Test after install**: Run `npm run dev` after `npm install` to verify everything works
5. **Keep it clean**: Run `npm run clean` periodically if you have disk space issues

## Environment Variables

Environment files are still kept in their respective directories:

- `backend/.env` - Backend configuration (Supabase service key, Gemini API)
- `frontend/.env.local` - Frontend configuration (Supabase anon key, API URL)

## VS Code Integration

Add to `.vscode/settings.json` for better IntelliSense:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.workingDirectories": [
    "./frontend",
    "./backend"
  ]
}
```

## Further Reading

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Package Management Guide](https://docs.npmjs.com/cli/v10/commands/npm-install)
