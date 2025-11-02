# Profile System Guide

**Last Updated:** November 2, 2025

---

## Overview

User profiles include skills, bio, personality traits, and profile pictures. All data is stored in Supabase.

---

## Profile Fields

### Required
- ✅ **Name** - Display name
- ✅ **Email** - For authentication

### Recommended
- 📝 **Bio** - About yourself (200+ chars recommended for better AI matching)
- 🎓 **Teach Skills** - Skills you can teach
- 📚 **Learn Skills** - Skills you want to learn

### Personality (Optional)
- 🧘 **Personality Type** - Introvert / Extrovert
- 🌅 **Daily Rhythm** - Early bird / Night owl
- 🦉 **Spirit Animal** - Fun personality indicator
- 🍦 **Favorite Ice Cream** - Lighthearted preference
- 🎨 **Personal Color** - Aesthetic preference

### Profile Picture
- 📸 **Avatar URL** - Profile picture (uploaded to Supabase Storage)

---

## Skill Structure

Skills are stored as JSONB arrays:

```json
{
  "teach_skills": [
    {
      "name": "Python",
      "proficiency": "advanced",
      "category": "Programming Languages"
    }
  ],
  "learn_skills": [
    {
      "name": "Japanese",
      "proficiency": "beginner",
      "category": "Language"
    }
  ]
}
```

**Proficiency Levels:**
- `beginner` - Just starting
- `intermediate` - Some experience
- `advanced` - Highly experienced
- `expert` - Professional level

**Categories:**
- Programming Languages
- Web Development
- Data Science & AI
- Design & UX
- Business & Marketing
- Language
- Music & Arts
- Art & Crafts
- Health & Wellness
- Cooking & Culinary
- Other

---

## Profile Picture Upload

### Setup

**Supabase Storage Bucket:** `avatars`

**Configuration:**
```javascript
{
  public: true,
  fileSizeLimit: 2097152, // 2MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}
```

### Upload Flow

1. User selects image
2. Validate file (type, size)
3. Preview image (optional)
4. Upload to Supabase Storage
5. Get public URL
6. Update user profile with avatar_url
7. Delete old file (if exists)

### Code Example

```javascript
// Upload avatar
const uploadAvatar = async (file, userId) => {
  // 1. Validate
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File too large (max 2MB)')
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  // 2. Upload to storage
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })
  
  if (uploadError) throw uploadError
  
  // 3. Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // 4. Update profile
  await supabase
    .from('users')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId)
  
  return data.publicUrl
}
```

### Display Avatar

With fallback to UI Avatars:

```javascript
const avatarUrl = user.avatar_url || 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200`

<img 
  src={avatarUrl}
  alt={user.name}
  className="w-16 h-16 rounded-full object-cover"
/>
```

### Remove Avatar

```javascript
const removeAvatar = async (userId, currentAvatarUrl) => {
  // 1. Delete from storage
  if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
    const filePath = currentAvatarUrl.split('/').slice(-2).join('/')
    await supabase.storage
      .from('avatars')
      .remove([filePath])
  }
  
  // 2. Update profile
  await supabase
    .from('users')
    .update({ avatar_url: null })
    .eq('id', userId)
}
```

---

## Profile Pages

### `/profile` - Edit Own Profile
- Update all profile fields
- Add/remove skills
- Upload profile picture
- Preview changes before saving

### `/profile/:userId` - View Other User
- Read-only profile view
- Display skills, bio, personality
- Show compatibility if matched
- Link to create match/chat

---

## API Endpoints

### Get Profile
```http
GET /api/users/:userId

Response:
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "bio": "...",
  "avatar_url": "https://...",
  "teach_skills": [...],
  "learn_skills": [...],
  "personality_type": "introvert",
  "daily_rhythm": "early_bird",
  "spirit_animal": "Owl",
  "favorite_ice_cream": "Vanilla"
}
```

### Update Profile
```http
PUT /api/users/:userId

Body: (all fields optional)
{
  "name": "Jane Doe",
  "bio": "Updated bio",
  "teach_skills": [...],
  "learn_skills": [...],
  "personality_type": "introvert",
  ...
}
```

### Upload Avatar
```http
POST /api/upload/avatar
Content-Type: multipart/form-data

Form Data:
- file: (image file)
- userId: (UUID)

Response:
{
  "success": true,
  "url": "https://supabase.../avatars/uuid/avatar.jpg"
}
```

---

## AI Skill Extraction

Auto-extract skills from bio using Gemini:

```http
POST /api/skills/extract

Body:
{
  "bio": "I'm a Python developer who wants to learn Japanese",
  "userId": "uuid"
}

Response:
{
  "success": true,
  "skills": {
    "teach_skills": [
      {"name": "Python", "proficiency": "advanced", "category": "technical"}
    ],
    "learn_skills": [
      {"name": "Japanese", "proficiency": "beginner", "category": "language"}
    ]
  }
}
```

---

## Profile Completion

**Minimum for matching:**
- ✅ Name
- ✅ At least 1 teach skill
- ✅ At least 1 learn skill

**Recommended for better matches:**
- ✅ Detailed bio (200+ characters)
- ✅ Multiple skills in each category
- ✅ Personality questions answered
- ✅ Profile picture uploaded

**Profile Completeness Score:**
```javascript
const calculateCompleteness = (profile) => {
  let score = 0
  if (profile.name) score += 10
  if (profile.bio && profile.bio.length > 100) score += 20
  if (profile.bio && profile.bio.length > 200) score += 10
  if (profile.avatar_url) score += 15
  if (profile.teach_skills?.length > 0) score += 15
  if (profile.teach_skills?.length > 2) score += 5
  if (profile.learn_skills?.length > 0) score += 15
  if (profile.personality_type) score += 5
  if (profile.daily_rhythm) score += 5
  return score // Out of 100
}
```

---

## Profile Privacy

**Public Information:**
- Name, bio, skills
- Avatar (if uploaded)
- Personality traits
- Match compatibility

**Private Information:**
- Email (never shown)
- Password (hashed, never accessible)
- Supabase user ID (internal only)

---

## Best Practices

1. **Write detailed bios** - Better AI matching
2. **Add multiple skills** - More match opportunities
3. **Use real profile picture** - Builds trust
4. **Answer personality questions** - Scheduling compatibility
5. **Keep profile updated** - Matches stay relevant

---

## Troubleshooting

### Image Upload Fails

**Problem:** Upload returns error

**Solutions:**
- Check file size (< 2MB)
- Verify file type (jpg/png/gif/webp)
- Ensure bucket policies are set
- Check Supabase storage quota

### Avatar Not Displaying

**Problem:** Broken image

**Solutions:**
- Verify `avatar_url` is correct
- Check Supabase storage bucket is public
- Use fallback: `ui-avatars.com/api/`
- Add `object-cover` class for aspect ratio

### Skills Not Saving

**Problem:** Skills disappear after save

**Solutions:**
- Check JSONB format is valid
- Verify API endpoint returns success
- Ensure skills array structure matches schema
- Check browser console for errors

---

## Related Files

- `/frontend/src/pages/Profile.jsx` - Edit profile
- `/frontend/src/pages/ProfileView.jsx` - View other profiles
- `/backend/routes/users.js` - User API
- `/backend/routes/skillExtraction.js` - AI extraction

---

**Profile System Version:** 1.2  
**Last Updated:** November 2, 2025
