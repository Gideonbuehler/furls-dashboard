# 🚨 CRITICAL FIXES - API Keys + Leaderboard

## 🔴 Critical Issue: Users Can't Upload Stats

### **Root Cause:**

Users who registered BEFORE the `api_key` column was added to the database schema don't have API keys generated. Only users who registered AFTER the migration have API keys.

### **Impact:**

- ❌ Existing users can't upload stats (401 Unauthorized)
- ❌ Settings page shows no API key for old users
- ✅ New users work fine (have API keys)
- ✅ You (admin) work fine because you registered recently

---

## ✅ Fixes Implemented

### 1. **Database Migration - Generate Missing API Keys**

Added automatic API key generation for users who don't have one.

**File:** `server/database.js`

```javascript
// Generate API keys for users who don't have one
const usersWithoutKeys = await dbAsync.all(
  `SELECT id, username FROM users WHERE api_key IS NULL OR api_key = ''`
);

if (usersWithoutKeys.length > 0) {
  console.log(`🔑 Generating API keys for ${usersWithoutKeys.length} users...`);

  for (const user of usersWithoutKeys) {
    const apiKey = crypto.randomBytes(32).toString("hex");
    await dbAsync.run(`UPDATE users SET api_key = ? WHERE id = ?`, [
      apiKey,
      user.id,
    ]);
    console.log(`  ✓ Generated API key for user: ${user.username}`);
  }

  console.log(`✅ API key generation complete!`);
}
```

### 2. **Settings Page - Auto-Generate on First View**

If a user visits Settings and has no API key, one is automatically generated.

**File:** `server/routes/auth.js`

```javascript
router.get("/api-key", authenticateToken, async (req, res) => {
  try {
    const user = await dbAsync.get("SELECT api_key FROM users WHERE id = ?", [
      req.user.userId,
    ]);

    // If no API key exists, generate one
    if (!user || !user.api_key) {
      const newApiKey = crypto.randomBytes(32).toString("hex");
      await dbAsync.run("UPDATE users SET api_key = ? WHERE id = ?", [
        newApiKey,
        req.user.userId,
      ]);
      return res.json({ apiKey: newApiKey });
    }

    res.json({ apiKey: user.api_key });
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({ error: "Failed to fetch API key" });
  }
});
```

### 3. **Leaderboard Query - Fixed Missing Columns**

Added COALESCE to all columns and ORDER BY clause.

**File:** `server/routes/public.js`

```javascript
let orderBy = "COALESCE(total_shots, 0) DESC";
if (stat === "goals") orderBy = "COALESCE(total_goals, 0) DESC";
if (stat === "accuracy")
  orderBy =
    "(CAST(COALESCE(total_goals, 0) AS FLOAT) / NULLIF(COALESCE(total_shots, 0), 0)) DESC";
if (stat === "sessions") orderBy = "COALESCE(total_sessions, 0) DESC";

const query = `
  SELECT id, username, 
         COALESCE(display_name, username) as display_name, 
         avatar_url, 
         COALESCE(total_shots, 0) as total_shots, 
         COALESCE(total_goals, 0) as total_goals, 
         COALESCE(total_sessions, 0) as total_sessions,
         ROUND((CAST(COALESCE(total_goals, 0) AS FLOAT) / NULLIF(COALESCE(total_shots, 0), 0) * 100), 2) as accuracy
  FROM users
  WHERE (COALESCE(profile_visibility, 'public') = 'public')
  AND COALESCE(total_shots, 0) > 0
  ORDER BY ${orderBy}
  LIMIT ? OFFSET ?
`;
```

---

## 🔧 All Changes Made

### Modified Files:

1. ✅ `server/database.js` - API key migration
2. ✅ `server/routes/auth.js` - Auto-generate API keys
3. ✅ `server/routes/public.js` - Fixed leaderboard queries
4. ✅ `server/routes/stats.js` - Fixed friends leaderboard (previous)
5. ✅ `client/src/components/Leaderboard.jsx` - Response handling (previous)
6. ✅ `client/src/components/Friends.jsx` - Profile viewing (previous)
7. ✅ `client/src/components/ProfileModal.jsx` - Syntax fix (previous)

---

## 🚀 Deploy Now

```powershell
cd "c:\Users\gideo\source\repos\FURLS\Dashboard"
git add .
git commit -m "CRITICAL: Auto-generate missing API keys and fix leaderboard queries"
git push origin main
```

---

## 📊 Expected Deployment Logs

Watch Render logs for these messages:

### ✅ Success Messages:

```
Initializing PostgreSQL tables...
✓ Users table ready
✓ Sessions table ready
✓ Friendships table ready
✓ User settings table ready
✓ Indexes created
Running database migrations...
✓ Added missing columns to users table
🔑 Generating API keys for X users...
  ✓ Generated API key for user: username1
  ✓ Generated API key for user: username2
  ...
✅ API key generation complete!
✅ Database initialization complete!
```

### 🎯 What This Will Fix:

- ✅ All existing users will get API keys automatically
- ✅ Stats uploads will work for everyone
- ✅ Settings page will show API keys for all users
- ✅ Leaderboard will work (no 500 errors)
- ✅ Friend profiles will load correctly

---

## 🧪 Testing After Deployment

### Test 1: Existing User Gets API Key

1. Login as an existing user (not you)
2. Go to Settings tab
3. Verify API key is displayed
4. Copy the key
5. Test it in the plugin

### Test 2: Stats Upload Works

1. Configure plugin with the API key
2. Play freeplay, shoot some shots
3. Exit match
4. Check dashboard for new session

### Test 3: Leaderboard Works

1. Go to Leaderboard tab
2. Select "Global"
3. Try all stats: Accuracy, Goals, Shots, Sessions
4. Should display ranked players (no 500 error)

### Test 4: Friend Profile Works

1. Go to Friends tab
2. Click "View Stats" on a friend
3. Should show their profile (no 500 error)

---

## 📝 Quick Test Script

```powershell
# Test after deployment
Write-Host "Testing API Key Generation..." -ForegroundColor Cyan

# Test leaderboard endpoints
$endpoints = @(
    "https://furls.net/api/public/leaderboard/accuracy",
    "https://furls.net/api/public/leaderboard/goals",
    "https://furls.net/api/public/leaderboard/shots",
    "https://furls.net/api/public/leaderboard/sessions"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Get
        Write-Host "✅ $(Split-Path $endpoint -Leaf): $($response.Count) players" -ForegroundColor Green
    } catch {
        Write-Host "❌ $(Split-Path $endpoint -Leaf): $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

---

## 🆘 Troubleshooting

### Issue: Users still can't upload after deployment

**Fix:** Tell them to:

1. Logout
2. Login again
3. Go to Settings
4. Copy NEW API key
5. Update plugin

### Issue: Leaderboard still shows 500 error

**Check:** Server logs for SQL error details
**Fix:** May need to add more COALESCE or check column names

### Issue: Migration didn't run

**Check:** Render logs for migration messages
**Fix:** Restart Render service manually

---

## 🎯 Success Criteria

After deployment is successful when:

- [ ] Render logs show "🔑 Generating API keys for X users..."
- [ ] All users can see their API key in Settings
- [ ] Stats upload works for all users
- [ ] Leaderboard loads without 500 errors
- [ ] Friend profiles load without 500 errors
- [ ] New registrations still work normally

---

**Status:** ✅ READY FOR IMMEDIATE DEPLOYMENT  
**Priority:** 🔴 CRITICAL - Users can't upload stats  
**Risk Level:** 🟢 LOW - Safe migrations with fallbacks  
**ETA:** 2-3 minutes deploy time

---

## 💡 Why This Happened

The `api_key` column was added to the database schema, but:

1. Existing users had no API key (NULL)
2. No migration to backfill API keys
3. New users get API keys on registration (works)
4. Old users have no API keys (broken)

This fix ensures ALL users, old and new, have valid API keys.

---

**DEPLOY IMMEDIATELY TO FIX USER UPLOADS!** 🚀
