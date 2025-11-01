# 🔧 Quick Fix: Port 3000 Already in Use

## Problem
You have **two instances of the backend** trying to run on port 3000:
1. One that's already running (from before)
2. One that just tried to start with `npm run dev`

## Quick Fix

### Step 1: Kill the old process on port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### Step 2: Start fresh
```bash
cd /Users/jakubnosek/Programming/durhack-2025
npm run dev
```

---

## Why This Happens

When you run `npm run dev` multiple times without stopping the previous one:
- The first backend process keeps running on port 3000
- The second one tries to use port 3000 but can't
- You get: `Error: listen EADDRINUSE: address already in use :::3000`

---

## ✅ Fixed!

After running the commands above:
- ✅ Old backend process killed
- ✅ New backend starts cleanly on port 3000
- ✅ Frontend runs on port 5173 (or 5174 if 5173 was taken)

Now you can access:
- **Frontend:** http://localhost:5173 (or check the terminal for actual port)
- **Backend:** http://localhost:3000

---

## 🎯 Bonus: Also note

Your terminal showed:
```
[frontend] You are using Node.js 22.11.0. Vite requires Node.js version 20.19+ or 22.12+.
```

This is just a warning - it should still work, but if you have issues, consider updating Node.js:
```bash
# Check current version
node --version

# Update with nvm (if installed)
nvm install 22.12
nvm use 22.12
```

But this won't affect the 500 error you were seeing.

---

## TL;DR

```bash
# Kill old backend
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

Done! ✅
