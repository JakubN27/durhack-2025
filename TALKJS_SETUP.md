# 🔑 TalkJS Configuration - Action Required

## ✅ What's Done
Your TalkJS **Secret Key** has been added to:
- ✅ `backend/.env` → `TALKJS_SECRET_KEY=sk_test_Br92so06mz3CYq3sWxbEBS6SoqOPIrmz`

## ⚠️ What You Need to Do Now

### Find Your TalkJS App ID

Your **App ID** is needed to complete the setup. Here's how to find it:

1. **Go to TalkJS Dashboard**: https://talkjs.com/dashboard

2. **Select Your App**: 
   - Click on your app name in the top navigation
   - Or create a new app if you don't have one yet

3. **Find Your App ID**:
   - Look at the URL: `https://talkjs.com/dashboard/APP_ID/...`
   - The App ID is in the URL (usually starts with 't')
   - **OR** Go to: Settings → App ID
   - It looks like: `tAbCdEf12345` or similar

4. **Copy the App ID**

### Add Your App ID to Environment Files

Once you have your App ID, update these two files:

#### Backend: `backend/.env`
Replace this line:
```bash
TALKJS_APP_ID=your-talkjs-app-id
```
With:
```bash
TALKJS_APP_ID=tYourActualAppId
```

#### Frontend: `frontend/.env`
Replace this line:
```bash
VITE_TALKJS_APP_ID=your-talkjs-app-id
```
With:
```bash
VITE_TALKJS_APP_ID=tYourActualAppId
```

---

## 🚀 Quick Update Commands

You can use these commands to update both files at once (replace `tYourActualAppId` with your real App ID):

```bash
# Update backend .env
sed -i '' 's/TALKJS_APP_ID=your-talkjs-app-id/TALKJS_APP_ID=tYourActualAppId/' backend/.env

# Update frontend .env
sed -i '' 's/VITE_TALKJS_APP_ID=your-talkjs-app-id/VITE_TALKJS_APP_ID=tYourActualAppId/' frontend/.env
```

**OR** manually edit the files as shown above.

---

## ✅ Verify Your Configuration

After adding your App ID, check that both files are correct:

### Backend `.env` should have:
```bash
TALKJS_APP_ID=tYourActualAppId
TALKJS_SECRET_KEY=sk_test_Br92so06mz3CYq3sWxbEBS6SoqOPIrmz
```

### Frontend `.env` should have:
```bash
VITE_TALKJS_APP_ID=tYourActualAppId
```

---

## 🧪 Test Your Setup

Once you've added the App ID:

```bash
# Start the backend
npm run dev

# In another terminal, start the frontend
# (or use npm run dev from root if using workspace)

# Test the API
curl http://localhost:3000/

# Should show chat endpoints in the response
```

---

## 🔐 Security Note

✅ **Good News**: The secret key is already in `.gitignore`, so it won't be committed to Git.

The `.env` files are ignored by Git, keeping your credentials safe:
- ✅ `backend/.env` is in `.gitignore`
- ✅ `frontend/.env` is in `.gitignore`

---

## 📍 Current Status

| Item | Status |
|------|--------|
| TalkJS Account | ✅ You have one (based on secret key) |
| Secret Key | ✅ Added to `backend/.env` |
| App ID (Backend) | ⚠️ **Needs your input** |
| App ID (Frontend) | ⚠️ **Needs your input** |
| Database Migration | ⏳ Ready to run after App ID is added |

---

## 🎯 Next Steps After Adding App ID

1. **Run Database Migration**:
   ```bash
   ./scripts/setup-chat-db.sh
   ```
   Or manually in Supabase Dashboard SQL Editor:
   - Copy contents of `supabase/migrations/20251101130000_chat_enhancements.sql`
   - Paste and run

2. **Start Development**:
   ```bash
   npm run dev
   ```

3. **Test Chat Feature**:
   - Create test accounts
   - Create a match
   - Open chat page
   - Send messages

---

## 🆘 Need Help Finding Your App ID?

If you can't find your App ID:

1. **Check your TalkJS email** - It might have been sent when you signed up
2. **Create a new app** in the TalkJS dashboard if needed
3. **Contact TalkJS support** if you're having trouble

The App ID is not sensitive (it's used in frontend code), so don't worry about it being exposed.

---

## 🔄 What If I Don't Have a TalkJS App Yet?

1. Go to: https://talkjs.com/dashboard
2. Click "Create New App" or "New Application"
3. Give it a name (e.g., "SkillSwap")
4. Copy the App ID from the dashboard
5. Add it to both `.env` files as shown above

---

**Once you add your App ID, you're all set to run the chat feature!** 🎉
