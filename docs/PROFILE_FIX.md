# Profile Error Fix: "Cannot coerce the result to a single JSON object"

## Problem
When users signed up with Supabase Auth but visited the Profile page before their profile was created in the `users` table, they got a 500 error:

```
Error: Cannot coerce the result to a single JSON object
Code: PGRST116
Details: The result contains 0 rows
```

## Root Cause
1. User signs up with Supabase Auth → User exists in `auth.users`
2. User navigates to Profile page → Frontend calls `GET /api/users/:userId`
3. Backend tries to fetch from `users` table → **User doesn't exist yet**
4. Supabase returns PGRST116 error → Backend throws 500 error

## Solution

### 1. Backend: Handle Missing Users Gracefully
**File:** `backend/routes/users.js`

**GET /api/users/:userId**
- Catches PGRST116 error (user not found)
- Returns empty profile structure with default values
- Allows frontend to load without crashing

```javascript
if (error && error.code === 'PGRST116') {
  return res.json({
    success: true,
    data: {
      id: userId,
      name: '',
      bio: '',
      email: '',
      teach_skills: [],
      learn_skills: [],
      favorite_ice_cream: '',
      spirit_animal: '',
      personality_type: 'introvert',
      daily_rhythm: 'early_bird',
      personal_color: '',
      avatar_url: null
    }
  })
}
```

### 2. Backend: Use Upsert for Updates
**File:** `backend/routes/users.js`

**PUT /api/users/:userId**
- Changed from `update()` to `upsert()`
- Creates user profile if doesn't exist
- Updates if already exists

```javascript
const { data, error } = await supabase
  .from('users')
  .upsert(updateData, { onConflict: 'id' })
  .select()
  .single()
```

### 3. Frontend: Include Email in Profile Updates
**Files:** 
- `frontend/src/pages/Profile.jsx`
- `frontend/src/components/ProfileForm.jsx`

**Why:** Email is required in the `users` table, so we must include it when creating profiles.

```javascript
const profileData = {
  ...profile,
  email: user.email // Get from Supabase Auth
}
```

## User Flow Now

### New User Signup
1. ✅ User signs up → Supabase Auth creates account
2. ✅ User visits Profile page → GET returns empty profile (no error!)
3. ✅ User fills out profile → PUT creates new user record
4. ✅ Profile saved successfully

### Existing User
1. ✅ User logs in → Supabase Auth verifies
2. ✅ User visits Profile page → GET returns existing profile
3. ✅ User updates profile → PUT updates existing record
4. ✅ Profile saved successfully

## Testing

### Test Case 1: New User (No Profile Yet)
```bash
# 1. Sign up with new email
# 2. Navigate to /profile
# Expected: Page loads with empty form (no errors)
# 3. Fill out profile and save
# Expected: Success toast, profile created
```

### Test Case 2: Existing User
```bash
# 1. Log in with existing account
# 2. Navigate to /profile
# Expected: Page loads with existing data
# 3. Update profile and save
# Expected: Success toast, profile updated
```

### Test Case 3: Backend Verification
```bash
# Check backend logs - should see no 500 errors
# Should see successful GET and PUT operations
```

## Database State

### Before First Profile Save
```sql
-- auth.users table
id: 5ad09c3d-ae94-400f-96d6-7994d2b3d3e0
email: user@example.com

-- users table
(empty - no record yet)
```

### After First Profile Save
```sql
-- auth.users table
id: 5ad09c3d-ae94-400f-96d6-7994d2b3d3e0
email: user@example.com

-- users table
id: 5ad09c3d-ae94-400f-96d6-7994d2b3d3e0
email: user@example.com
name: "John Doe"
bio: "Full-stack developer"
teach_skills: [...]
learn_skills: [...]
...
```

## API Response Changes

### GET /api/users/:userId (User Not Found)
**Before:** 500 error
**After:** 200 with empty profile
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "",
    "bio": "",
    "email": "",
    "teach_skills": [],
    "learn_skills": [],
    "favorite_ice_cream": "",
    "spirit_animal": "",
    "personality_type": "introvert",
    "daily_rhythm": "early_bird",
    "personal_color": "",
    "avatar_url": null
  }
}
```

### PUT /api/users/:userId (Create or Update)
**Before:** Only updated existing records
**After:** Creates if doesn't exist, updates if does
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    ...
  }
}
```

## Benefits

1. ✅ **No More 500 Errors** - Graceful handling of missing profiles
2. ✅ **Seamless UX** - Users can use profile page immediately after signup
3. ✅ **Automatic Profile Creation** - First save creates the profile
4. ✅ **Consistent API** - Same endpoint for create and update
5. ✅ **Better Error Messages** - User-friendly feedback

## Future Enhancements

1. **Auto-create profile on signup** - Create basic profile record when user signs up (in Login.jsx)
2. **Profile completion tracking** - Show progress bar for incomplete profiles
3. **Required field validation** - Ensure critical fields are filled before saving
4. **Avatar upload** - Implement file upload for profile pictures

---

**Status:** ✅ Fixed and Tested
**Date:** November 1, 2025
**Impact:** All users can now use the profile page without errors
