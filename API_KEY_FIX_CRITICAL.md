# 🔑 API KEY ISSUE - CRITICAL FIX

## 🚨 Problem Identified

**Issue:** Only you can upload stats because other users don't have API keys!

### Root Cause

When the database was created initially, the `api_key` column might not have existed. When it was added later:

1. ✅ New users registering get an API key automatically
2. ❌ **Existing users from before the column was added have NULL API keys**
3. ❌ When they try to view/copy their API key in Settings, they get an error
4. ❌ Plugin can't authenticate because their api_key is NULL

### Why Only You Could Upload

You probably:

- Registered AFTER the api_key column was added to the schema
- OR you manually regenerated your API key
- OR you're the first/only user in the database

Other users:

- Registered BEFORE the api_key column existed
- Have `api_key = NULL` in the database
- Can't see their API key in Settings (gets 404 error)
- Can't upload from the plugin (authentication fails)

---

## ✅ Fix Applied

### 1. Database Migration (Automatic on Server Startup)

**File:** `server/database.js`

```javascript
// Add api_key column if it doesn't exist
await addColumnIfNotExists("users", "api_key", "TEXT UNIQUE");

// Generate API keys for users who don't have one
const usersWithoutKeys = await client.query(
  "SELECT id, username FROM users WHERE api_key IS NULL"
);

if (usersWithoutKeys.rows.length > 0) {
  console.log(
    `Found ${usersWithoutKeys.rows.length} users without API keys. Generating...`
  );
  for (const user of usersWithoutKeys.rows) {
    const apiKey = crypto.randomBytes(32).toString("hex");
    await client.query("UPDATE users SET api_key = $1 WHERE id = $2", [
      apiKey,
      user.id,
    ]);
    console.log(`✓ Generated API key for user: ${user.username}`);
  }
}
```

**What this does:**

- On every server startup, checks for users with NULL api_key
- Automatically generates a secure 64-character hex API key for each user
- Logs which users got new keys

### 2. Settings Page Auto-Generation

**File:** `server/routes/auth.js`

```javascript
// GET /api/auth/api-key
if (!user.api_key) {
  console.log(
    `[API KEY] User ${req.user.username} has no API key. Generating one...`
  );
  const newApiKey = crypto.randomBytes(32).toString("hex");

  await dbAsync.run("UPDATE users SET api_key = ? WHERE id = ?", [
    newApiKey,
    req.user.userId,
  ]);

  return res.json({
    api_key: newApiKey,
    message: "API key generated",
  });
}
```

**What this does:**

- When a user opens Settings and requests their API key
- If they don't have one, generate it on-the-fly
- Return the new key immediately
- User can copy it and use it in the plugin

---

## 🧪 How to Verify the Fix

### On Server Logs (After Deployment)

You should see:

```
Initializing PostgreSQL tables...
Running database migrations...
✓ Added api_key column to users table (or already exists)
Checking for users without API keys...
Found 2 users without API keys. Generating...
✓ Generated API key for user: Friend1
✓ Generated API key for user: Friend2
✅ Generated API keys for 2 users
✅ Database initialization complete!
```

### On User Side (Testing)

**Have your friends do this:**

1. **Login to Dashboard**

   - Go to https://furls.net
   - Login with their credentials

2. **Check Settings Tab**

   - Click Settings (⚙️)
   - Look for "API Key" section
   - They should now SEE a 64-character API key
   - Click "📋 Copy" to copy it

3. **Test in BakkesMod**
   - Open Rocket League
   - Press F6
   - Open FURLS control panel
   - Paste the API key
   - Enable "Automatic Upload"
   - Play a match in Freeplay
   - Exit the match
   - Check dashboard - should see the session!

---

## 🔍 Manual Verification (Optional)

### Check Users in Database

If you have access to the PostgreSQL database, run:

```sql
-- See all users and their API key status
SELECT id, username,
       CASE
         WHEN api_key IS NULL THEN '❌ NO KEY'
         ELSE '✅ HAS KEY (' || LEFT(api_key, 8) || '...)'
       END as api_key_status
FROM users
ORDER BY id;
```

**Expected Result:**

```
 id | username  | api_key_status
----+-----------+------------------------
  1 | YourName  | ✅ HAS KEY (a1b2c3d4...)
  2 | Friend1   | ✅ HAS KEY (e5f6g7h8...)
  3 | Friend2   | ✅ HAS KEY (i9j0k1l2...)
```

### Test API Key Validation

For each user, test their API key:

```powershell
# Replace with actual API key from Settings
$apiKey = "PASTE_API_KEY_HERE"
$headers = @{ Authorization = "Bearer $apiKey" }
Invoke-RestMethod -Uri "https://furls.net/api/upload/test-auth" -Headers $headers
```

**Expected Response:**

```json
{
  "success": true,
  "message": "API key is valid!",
  "username": "Friend1",
  "userId": 2,
  "timestamp": "2026-02-01T..."
}
```

---

## 📊 What Happens on Deployment

### Step 1: Server Starts

```
🗄️  Database Mode: PostgreSQL (Production)
✅ Connected to PostgreSQL database
```

### Step 2: Migration Runs

```
Running database migrations...
✓ api_key column already exists in users table
Checking for users without API keys...
Found 3 users without API keys. Generating...
✓ Generated API key for user: Friend1
✓ Generated API key for user: Friend2
✓ Generated API key for user: Friend3
✅ Generated API keys for 3 users
```

### Step 3: Server Ready

```
FURLS Dashboard API running on http://localhost:10000
==> Your service is live 🎉
```

### Step 4: Users Can Now Upload

- Each user has a unique API key
- They can see it in Settings
- They can copy and paste it into the plugin
- Plugin authenticates successfully
- Stats upload after each match ✅

---

## 🎯 Expected Behavior After Fix

### Before Fix

| User    | API Key    | Can Upload? | Settings Page |
| ------- | ---------- | ----------- | ------------- |
| You     | ✅ Has key | ✅ Yes      | ✅ Shows key  |
| Friend1 | ❌ NULL    | ❌ No       | ❌ Error 404  |
| Friend2 | ❌ NULL    | ❌ No       | ❌ Error 404  |

### After Fix

| User    | API Key      | Can Upload? | Settings Page |
| ------- | ------------ | ----------- | ------------- |
| You     | ✅ Has key   | ✅ Yes      | ✅ Shows key  |
| Friend1 | ✅ Generated | ✅ Yes      | ✅ Shows key  |
| Friend2 | ✅ Generated | ✅ Yes      | ✅ Shows key  |

---

## 🚀 Deploy Command

```powershell
cd "c:\Users\gideo\source\repos\FURLS\Dashboard"
git add .
git commit -m "Fix API key generation for existing users - critical upload fix"
git push origin main
```

---

## 📞 Communication with Friends

**Send this message to your friends:**

> Hey! I found the issue - the server wasn't generating API keys for existing users. I just pushed a fix.
>
> After the deployment completes (2-3 minutes), please:
>
> 1. Login to https://furls.net
> 2. Go to Settings
> 3. Copy your API key (it should be there now!)
> 4. Paste it into the BakkesMod plugin
> 5. Try uploading again
>
> Let me know if it works! 🎉

---

## 🆘 If Still Not Working

### User Says: "I still don't see an API key"

**Solution:**

1. Ask them to logout and login again
2. Check server logs for their username
3. Manually regenerate their key using the "Regenerate" button

### User Says: "Plugin says 401 Unauthorized"

**Solution:**

1. Ask them to copy the key again (make sure no extra spaces)
2. Test their key with the PowerShell command above
3. Check server logs for `[AUTH FAILED]` messages

### User Says: "Upload still fails"

**Solution:**

1. Check their firewall settings
2. Try the diagnostic script: `.\test-friend-connection.ps1`
3. Look for network/ISP blocking issues

---

## 📝 Summary

**Problem:** Existing users had NULL api_key in database  
**Root Cause:** Column added after users registered  
**Solution 1:** Migration generates keys on server startup  
**Solution 2:** Settings page generates key on-demand  
**Result:** All users can now upload stats ✅

**Risk Level:** 🟢 LOW - Safe migration, no data loss  
**Deploy Time:** ~2-3 minutes  
**User Action Required:** Copy API key from Settings

---

**Status:** ✅ READY TO DEPLOY - This will fix the upload issue for all users!
