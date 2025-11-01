# ProfileForm Testing Guide

## What Changed
The `ProfileForm` component and `Profile` page have been refactored to use the backend API instead of making direct Supabase database calls. This ensures all data operations go through the secure backend middleware.

## How to Test the Profile Form

### Prerequisites
1. Backend server running: `npm run dev:backend` (port 3000)
2. Frontend server running: `npm run dev:frontend` (port 5173)
3. Valid Supabase credentials in `.env` files
4. User account created and logged in

### Test Steps

#### 1. Access the Profile Page
```bash
# Navigate to: http://localhost:5173/profile
```

**Expected:**
- Profile page loads with your current user data
- Form shows existing profile information
- All fields are editable

#### 2. Update Basic Information
- Change your name
- Update your bio
- Add/modify ice cream preference, spirit animal, color
- Toggle personality type and daily rhythm

**Expected:**
- Form updates immediately
- No errors in console
- Toast notification shows "Remember to save your profile"

#### 3. Manage Skills

**Add Teaching Skills:**
- Enter skill name (e.g., "React")
- Select category (e.g., "Frontend")
- Select proficiency level
- Click "+ Add" button

**Expected:**
- Skill appears in the list immediately
- Toast shows "Skill added! Remember to save your profile."
- Can add multiple skills

**Remove Teaching Skills:**
- Click "Remove" on any skill

**Expected:**
- Skill removed from list
- Toast shows "Skill removed! Remember to save your profile."

**Repeat for Learning Skills:**
- Same process as teaching skills
- Different visual styling (green vs blue)

#### 4. Save Profile
- Click "💾 Save Profile" button

**Expected:**
- Button shows "Saving..." state
- Backend API request to `PUT /api/users/:userId`
- Success toast: "Profile updated successfully!"
- Profile data persisted to database
- No console errors

#### 5. Verify Data Persistence
- Refresh the page
- Navigate away and come back

**Expected:**
- All saved data loads correctly
- Skills preserved in arrays
- Personality fields retained

### API Calls to Monitor

Open browser DevTools → Network tab and verify:

#### On Page Load
```
GET http://localhost:3000/api/users/{userId}
Status: 200 OK
Response: { success: true, data: { ...userProfile } }
```

#### On Save
```
PUT http://localhost:3000/api/users/{userId}
Status: 200 OK
Payload: { name, bio, teach_skills, learn_skills, ... }
Response: { success: true, data: { ...updatedProfile } }
```

### Common Issues & Solutions

#### Issue: "Failed to load profile"
**Solution:** 
- Check backend is running on port 3000
- Verify user is logged in (check Supabase Auth token)
- Check backend logs for errors

#### Issue: "Failed to update profile"
**Solution:**
- Open Network tab and check the request
- Verify request body has correct structure
- Check backend logs for validation errors
- Ensure all required fields are filled

#### Issue: "Not authenticated"
**Solution:**
- Log out and log back in
- Clear browser cache/cookies
- Check Supabase Auth configuration

### Test Data Examples

```javascript
// Example profile data
{
  name: "John Doe",
  bio: "Full-stack developer passionate about teaching",
  teach_skills: [
    { name: "React", category: "Frontend", proficiency: "advanced" },
    { name: "Node.js", category: "Backend", proficiency: "intermediate" }
  ],
  learn_skills: [
    { name: "Python", category: "Programming", proficiency: "beginner" },
    { name: "Docker", category: "DevOps", proficiency: "beginner" }
  ],
  favorite_ice_cream: "Mint chocolate chip",
  spirit_animal: "Owl",
  personal_color: "Deep blue",
  personality_type: "introvert",
  daily_rhythm: "night_owl"
}
```

### Security Verification

✅ **What to check:**
- No direct Supabase database queries in frontend code
- Only backend API calls visible in Network tab
- Supabase service key never exposed to browser
- Only Supabase Auth calls are direct (login/signup)

❌ **Red flags:**
- Requests to `supabase.co/rest/v1/` from frontend
- Supabase service key in browser console
- Direct database operations from frontend

### Performance Checks

Monitor these metrics:
- Profile load time: < 1 second
- Save operation: < 500ms
- No memory leaks on repeated saves
- Smooth UI updates (no lag)

### Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS)

### Edge Cases to Test

1. **Empty Skills Arrays**
   - Save profile with no skills
   - Should work, display "No skills added yet"

2. **Maximum Skills**
   - Add 20+ skills
   - Should handle gracefully

3. **Special Characters**
   - Use emojis in name/bio
   - Use quotes, apostrophes
   - Should be properly escaped

4. **Network Errors**
   - Stop backend server
   - Try to save
   - Should show error toast

5. **Concurrent Updates**
   - Open profile in two tabs
   - Save in both
   - Last save should win

### Success Criteria

✅ All tests pass
✅ No console errors
✅ Data persists correctly
✅ Toast notifications work
✅ Loading states visible
✅ Backend API used exclusively
✅ No direct Supabase calls (except Auth)

---

## ProfileForm Component Specific Tests

The `ProfileForm.jsx` component can be used standalone. Test it similarly:

1. Import and render in a test page
2. Verify form fields update state
3. Check submit handler calls backend API
4. Verify file upload notification (TODO: implement later)

### Known Limitations

1. **File Upload:** Profile picture upload is not yet implemented
   - Shows info toast: "Profile picture upload coming soon! 📷"
   - Backend endpoint needed for file handling

2. **Real-time Updates:** No WebSocket for live collaboration
   - Consider adding for future versions

---

**Status:** ✅ Ready for Testing
**Last Updated:** November 1, 2025
