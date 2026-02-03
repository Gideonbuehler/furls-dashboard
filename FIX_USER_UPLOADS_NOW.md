# 🚨 URGENT: User Upload Issue - Action Plan

## ✅ What Works

- Your account uploads successfully
- Server is running
- Database is accessible
- Upload endpoint exists

## ❌ What Doesn't Work

- Other users can't upload stats
- You verified they set up the plugin correctly

## 🎯 Most Likely Cause

**Users don't have API keys in the database.**

Even though the document says the migration was deployed, it might not have run on production, or the users were created before the migration.

---

## 🚀 IMMEDIATE ACTION STEPS

### Step 1: Run the Diagnostic Script

```powershell
.\test-user-upload.ps1
```

This will walk through testing with an affected user and pinpoint the exact issue.

### Step 2: Check Production Database

Access your PostgreSQL database on Render and run:

```sql
-- Check how many users have API keys
SELECT
    COUNT(*) as total_users,
    COUNT(api_key) as users_with_keys,
    COUNT(*) - COUNT(api_key) as users_without_keys
FROM users;

-- See which users DON'T have API keys
SELECT id, username, email, created_at
FROM users
WHERE api_key IS NULL OR api_key = ''
ORDER BY created_at;
```

### Step 3: Generate Missing API Keys

If users are missing API keys, run this SQL:

```sql
-- Generate API keys for ALL users without one
UPDATE users
SET api_key = encode(gen_random_bytes(32), 'hex')
WHERE api_key IS NULL OR api_key = '';

-- Verify it worked
SELECT
    username,
    LENGTH(api_key) as key_length,
    SUBSTRING(api_key, 1, 8) || '...' as key_preview,
    CASE
        WHEN api_key IS NULL THEN '❌ STILL NULL'
        ELSE '✅ HAS KEY'
    END as status
FROM users
ORDER BY created_at DESC;
```

### Step 4: Have Users Refresh Their Keys

Tell affected users to:

1. Logout of https://furls.net
2. Login again
3. Go to Settings tab
4. Copy the API key (should now be visible)
5. Update their BakkesMod plugin config
6. Restart BakkesMod and Rocket League

---

## 🔍 Diagnostic Tools Created

I've created several tools to help you:

### 1. `test-user-upload.ps1` - Interactive Diagnostic

- Tests server health
- Tests API key validity
- Tests upload endpoint
- Verifies session appears in dashboard
- **RUN THIS FIRST with an affected user**

### 2. `diagnose-user-uploads.ps1` - API Key Tester

- Tests multiple users' API keys
- Shows exactly what's wrong
- Provides specific fix instructions

### 3. `check-user-apikey.ps1` - Quick Database Query Generator

- Generates SQL to check specific user
- Shows how to manually fix their API key

### 4. `diagnose-database.sql` - Database Diagnostic Queries

- Complete set of SQL queries
- Check for data inconsistencies
- Find users without API keys

### 5. `USER_UPLOAD_TROUBLESHOOTING.md` - Complete Guide

- Every possible issue and solution
- Step-by-step troubleshooting
- Plugin configuration details

---

## 🎯 Quick Decision Tree

```
Does server respond?
├─ NO → Server is down, check Render logs
└─ YES → Continue

Can you login at furls.net?
├─ NO → Authentication system broken
└─ YES → Continue

Does Settings page show an API key?
├─ NO → Run SQL to generate missing keys
└─ YES → Continue

Run .\test-user-upload.ps1 with user's API key
├─ Auth fails → API key not in database (regenerate)
├─ Upload fails → Server issue (check logs)
├─ Upload works but session not visible → Display issue
└─ Everything works → Problem is in BakkesMod plugin config
```

---

## 🔧 Common Issues & Quick Fixes

### Issue 1: User Has No API Key (Most Likely)

**Symptom:** Settings page shows nothing  
**Fix:** Run SQL to generate keys (see Step 3 above)  
**Time:** 2 minutes

### Issue 2: API Key Copy/Paste Error

**Symptom:** Auth test fails  
**Fix:** Have user copy key again carefully  
**Time:** 30 seconds

### Issue 3: Wrong Server URL

**Symptom:** Plugin doesn't upload  
**Fix:** Check plugin config file has `https://furls.net`  
**Time:** 1 minute

### Issue 4: Plugin Not Loading

**Symptom:** Nothing happens in-game  
**Fix:** Check BakkesMod is running, plugin is enabled  
**Time:** 2 minutes

---

## 📞 Quick Support Script

Send this to affected users:

```
Hi! Your FURLS upload isn't working. Let's fix it:

1. Go to https://furls.net and login
2. Click "Settings" tab at the top
3. Do you see an API key? (long code of letters/numbers)

IF YES:
  - Copy the entire key (double-click to select all)
  - Open: %APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg
  - Make sure it shows:
    furls_api_key "your_key_here"
    furls_server_url "https://furls.net"
  - Restart BakkesMod and Rocket League
  - Try again

IF NO:
  - Tell me "no API key shown"
  - I'll fix it on my end
  - Then logout and login again
  - It should appear in Settings
```

---

## 🚨 CRITICAL CHECKS

Before doing anything else, verify:

### ✅ Check 1: Migration Ran on Production

```bash
# In Render dashboard, check logs for:
"Generated API keys for X users"
```

### ✅ Check 2: Database Has API Key Column

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'api_key';
```

### ✅ Check 3: New Users Get API Keys

```sql
-- Check most recent user
SELECT username, api_key IS NOT NULL as has_key, created_at
FROM users
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🎯 SUCCESS CRITERIA

You'll know it's fixed when:

1. ✅ SQL query shows all users have API keys
2. ✅ Affected users can see API key in Settings
3. ✅ `test-user-upload.ps1` script passes all tests
4. ✅ Test upload creates session visible in dashboard
5. ✅ Real plugin upload works in-game

---

## 📊 Monitoring After Fix

After generating missing API keys, monitor:

```sql
-- Check recent uploads
SELECT
    u.username,
    COUNT(s.id) as session_count,
    MAX(s.timestamp) as last_session,
    u.last_active
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
WHERE u.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.username, u.last_active
ORDER BY last_session DESC;
```

Watch server logs for:

```
[AUTH SUCCESS] User: username
[UPLOAD START] User: username
[UPLOAD SUCCESS] User: username
```

---

## 🆘 If Still Broken After All This

1. **Check Render Logs**

   - Look for authentication errors
   - Look for database connection errors

2. **Test API Endpoint Directly**

   ```powershell
   Invoke-RestMethod -Uri "https://furls.net/api/upload/test-auth" `
       -Method Get `
       -Headers @{"Authorization"="Bearer [their_key]"}
   ```

3. **Verify Database Connection**

   ```sql
   SELECT NOW(); -- Should return current time
   ```

4. **Check for PostgreSQL vs SQLite Mismatch**
   - Ensure production is using PostgreSQL
   - Check DATABASE_URL environment variable

---

## 🎬 Start Here

**RIGHT NOW, run this:**

```powershell
cd "c:\Users\gideo\source\repos\FURLS\Dashboard"
.\test-user-upload.ps1
```

Have an affected user ready with:

- Their login credentials
- Access to their Settings page
- Willingness to try uploading

This script will tell you EXACTLY what's wrong.

---

**Need the database access details for Render PostgreSQL?**

- Go to Render dashboard → Your service → Environment → DATABASE_URL
- Use a PostgreSQL client (pgAdmin, DBeaver, or psql command line)
- Connect and run the diagnostic queries

**Most likely you'll find:** Users have NULL api_key values.  
**Quick fix:** Run the UPDATE query in Step 3.  
**Total time to fix:** Under 5 minutes.

---

## 📋 Pre-Flight Checklist

Before running test-user-upload.ps1:

- [ ] Server is running (check https://furls.net)
- [ ] You have database access
- [ ] You have an affected user ready to test
- [ ] User has login credentials
- [ ] You're in the Dashboard directory

**GO! Run the script now!** 🚀
