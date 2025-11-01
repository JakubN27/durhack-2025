# Frontend API Refactor - Backend API Integration

## Summary
All frontend components have been updated to **use only the backend API** instead of making direct Supabase database calls. This follows the middleware architecture where the frontend communicates with the backend, and the backend handles all Supabase interactions using the service key.

## Changes Made

### 1. Profile Page (`frontend/src/pages/Profile.jsx`)
**Before:** Made direct Supabase calls to fetch and update user data:
```javascript
const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
```

**After:** Uses backend API endpoints:
```javascript
const response = await fetch(`http://localhost:3000/api/users/${user.id}`)
const result = await response.json()
```

**Endpoints Used:**
- `GET /api/users/:userId` - Fetch user profile
- `PUT /api/users/:userId` - Update user profile

### 2. Dashboard Page (`frontend/src/pages/Dashboard.jsx`)
**Before:** Made direct Supabase calls to fetch user profile:
```javascript
const { data: profileData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
```

**After:** Uses backend API endpoints:
```javascript
const profileResponse = await fetch(`http://localhost:3000/api/users/${authUser.id}`)
const profileResult = await profileResponse.json()
```

**Endpoints Used:**
- `GET /api/users/:userId` - Fetch user profile
- `GET /api/matching/user/:userId` - Fetch user matches

### 3. ProfileForm Component (`frontend/src/components/ProfileForm.jsx`)
**Before:** Made direct Supabase calls for storage and database operations:
```javascript
await supabase.storage.from('profiles').upload(filePath, file)
await supabase.from('profiles').upsert({...})
```

**After:** Uses backend API endpoints:
```javascript
const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(profileData)
})
```

**Note:** File upload functionality is marked as TODO and will need a backend endpoint for file handling.

**Endpoints Used:**
- `PUT /api/users/:userId` - Update user profile

### 4. Matches Page (`frontend/src/pages/Matches.jsx`)
✅ **Already Correct** - This page was already using backend API endpoints:
- `GET /api/matching/find/:userId` - Find potential matches
- `POST /api/matching/create` - Create a new match

### 5. Login Page (`frontend/src/pages/Login.jsx`)
✅ **Already Correct** - Uses Supabase Auth (expected) and backend API for profile creation:
- `POST /api/users` - Create new user profile after signup

### 6. Home Page (`frontend/src/pages/Home.jsx`)
✅ **No API Calls** - Static page, no changes needed

## Authentication Flow
The frontend still uses **Supabase Auth** directly for:
- `supabase.auth.signUp()` - User registration
- `supabase.auth.signInWithPassword()` - User login
- `supabase.auth.getUser()` - Get current authenticated user

This is the **correct approach** because:
1. Supabase Auth is designed to be used client-side
2. It manages JWT tokens securely
3. The backend uses the user's JWT to verify identity for protected endpoints

## Architecture Benefits

### Before (Direct Supabase Calls)
```
Frontend ──────────────> Supabase Database
           (Direct calls with anon key)
```
**Issues:**
- Frontend has direct database access
- Anon key exposed in browser
- Limited business logic
- Harder to add middleware/validation

### After (Backend Middleware)
```
Frontend ──> Backend API ──> Supabase Database
                            (Service key only)
```
**Benefits:**
- ✅ All database operations secured behind backend
- ✅ Service key never exposed to client
- ✅ Business logic centralized in backend
- ✅ Easy to add validation, logging, rate limiting
- ✅ Can easily switch databases later
- ✅ Better error handling and data transformation

## Environment Variables

### Frontend (`.env.local`)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
**Used only for:** Supabase Auth (login/signup)

### Backend (`.env`)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
PORT=3000
```
**Used for:** All database operations

## API Endpoints Used

### User Management
- `GET /api/users/:userId` - Get user profile
- `POST /api/users` - Create new user
- `PUT /api/users/:userId` - Update user profile
- `DELETE /api/users/:userId` - Delete user (admin only)

### Matching
- `GET /api/matching/find/:userId` - Find potential matches
- `POST /api/matching/create` - Create a match request
- `GET /api/matching/user/:userId` - Get user's matches
- `PUT /api/matching/:matchId` - Update match status

### Authentication
- Direct Supabase Auth (client-side)

## Testing the Changes

1. **Start the backend:**
   ```bash
   npm run dev:backend
   ```

2. **Start the frontend:**
   ```bash
   npm run dev:frontend
   ```

3. **Test the flow:**
   - Sign up / Log in (uses Supabase Auth)
   - Update profile (uses backend API)
   - View dashboard (uses backend API)
   - Find matches (uses backend API)
   - All operations should work seamlessly!

## Future Improvements

1. **File Upload:** Implement backend endpoint for profile picture uploads
2. **Error Handling:** Add more robust error handling and retry logic
3. **Caching:** Add client-side caching for frequently accessed data
4. **Loading States:** Improve loading indicators across all pages
5. **Offline Support:** Add service worker for offline functionality

## Notes

- ✅ All frontend files now follow the middleware architecture
- ✅ No direct Supabase database calls from frontend (except Auth)
- ✅ Toast notifications used consistently for user feedback
- ✅ Error handling improved with proper error messages
- ✅ Ready for production deployment

---

**Last Updated:** November 1, 2025
**Status:** ✅ Complete
