# 🚨 User Upload Troubleshooting Guide

## Problem: Your stats upload works, but other users' don't

---

## 🔍 Quick Diagnostic Script

Run this PowerShell script to test any user's API key:

```powershell
.\diagnose-user-uploads.ps1
```

It will:

- ✅ Test if API key is valid
- ✅ Test if upload endpoint works
- ✅ Show exactly what's wrong

---

## 🐛 Common Issues & Solutions

### Issue 1: **User Has No API Key**

**Symptom:** Settings page shows empty/no API key

**Root Cause:** User registered BEFORE the API key migration was deployed

**Solution:**

```sql
-- Check if user has API key (run on database)
SELECT username, api_key FROM users WHERE username = 'their_username';

-- If NULL, generate one manually:
UPDATE users
SET api_key = encode(gen_random_bytes(32), 'hex')
WHERE username = 'their_username';
```

**OR** have them:

1. Logout
2. Login again
3. Visit Settings tab (triggers auto-generation)

---

### Issue 2: **API Key Has Extra Spaces**

**Symptom:** Key looks right but auth fails with 401

**Root Cause:** Copy/paste added spaces or newlines

**How to Check:**

```powershell
$apiKey = "paste_key_here"
Write-Host "Length: $($apiKey.Length) (should be 64)"
Write-Host "Trimmed: $($apiKey.Trim().Length)"
```

**Solution:** Tell user to:

1. Select ONLY the key (no spaces before/after)
2. Copy again
3. Paste into plugin config
4. Check the config file directly (no quotes, no spaces)

---

### Issue 3: **Wrong Server URL in Plugin**

**Symptom:** Plugin shows no errors, but nothing uploads

**Root Cause:** Plugin pointing to localhost or wrong URL

**Check:** Plugin config file location:

- Windows: `%APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg`

**Should contain:**

```
furls_api_key "their_64_character_api_key_here"
furls_server_url "https://furls.net"
```

**Common mistakes:**

- ❌ `http://localhost:3000` (local dev server)
- ❌ `https://furls.net/` (trailing slash)
- ❌ `http://furls.net` (missing https)
- ✅ `https://furls.net` (correct!)

---

### Issue 4: **Plugin Config File Not Saving**

**Symptom:** User sets API key in plugin, but doesn't persist

**Root Cause:** BakkesMod/Rocket League running as admin, can't write to user folder

**Solution:**

1. Close Rocket League
2. Close BakkesMod
3. Run both WITHOUT admin privileges
4. Set API key again in plugin
5. Test upload

---

### Issue 5: **Firewall Blocking Uploads**

**Symptom:** Auth test works in browser, but plugin can't upload

**Root Cause:** Firewall blocking outbound HTTPS from Rocket League

**Test:**

```powershell
Test-NetConnection -ComputerName furls.net -Port 443
```

**Solution:**

1. Add firewall rule for Rocket League
2. Or temporarily disable firewall to test
3. Check antivirus software too

---

### Issue 6: **User Created During Migration**

**Symptom:** User registered recently but has no API key

**Root Cause:** Migration was running when they registered

**Solution:**

```sql
-- Force regenerate their API key
UPDATE users
SET api_key = encode(gen_random_bytes(32), 'hex')
WHERE username = 'their_username';
```

---

## 🧪 Step-by-Step Testing Process

### Test Their Setup:

1. **Test API Key via Web:**

   ```powershell
   .\diagnose-user-uploads.ps1
   ```

   - Paste their API key
   - Should see: ✅ API key is VALID
   - Should see: ✅ Upload endpoint WORKS

2. **Check Their Dashboard:**

   - Have them login at https://furls.net
   - Go to Settings tab
   - API key should be visible
   - If not, they need to logout/login

3. **Verify Plugin Config:**

   - Open: `%APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg`
   - Check `furls_api_key` matches Settings page
   - Check `furls_server_url` is `https://furls.net`

4. **Test Plugin Connection:**

   - Open BakkesMod console (F6)
   - Type: `furls_test_connection`
   - Should see success message
   - If error, check logs

5. **Test Actual Upload:**
   - Play freeplay training
   - Take 5-10 shots
   - Exit match
   - Check dashboard for new session

---

## 🔧 Database Investigation

### Check User Status:

```sql
-- Get user's complete status
SELECT
    id,
    username,
    email,
    api_key IS NOT NULL as has_api_key,
    LENGTH(api_key) as key_length,
    last_active,
    total_sessions,
    total_shots,
    total_goals,
    created_at
FROM users
WHERE username = 'their_username';
```

### Check Their Upload History:

```sql
-- See if they've ever uploaded
SELECT
    s.id,
    s.timestamp,
    s.shots,
    s.goals,
    s.created_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE u.username = 'their_username'
ORDER BY s.timestamp DESC
LIMIT 10;
```

---

## 📊 Server-Side Checks

### View Upload Logs:

On Render.com dashboard:

1. Go to your service
2. Click "Logs"
3. Search for user's username
4. Look for:
   - `[AUTH FAILED]` - Invalid API key
   - `[AUTH SUCCESS]` - Key works
   - `[UPLOAD START]` - Upload received
   - `[UPLOAD SUCCESS]` - Upload saved
   - `[UPLOAD ERROR]` - Upload failed

### Common Log Errors:

```
[AUTH FAILED] Invalid API key from IP: xxx.xxx.xxx.xxx
→ They're using wrong/old API key

[AUTH FAILED] No API key provided from IP: xxx.xxx.xxx.xxx
→ Plugin not sending API key header

[UPLOAD ERROR] User: username (ID: X) Error: ...
→ Database error, check server logs
```

---

## 🎯 Most Likely Causes (In Order)

1. **70% - Copy/Paste Issue**

   - Extra spaces in API key
   - Solution: Copy key again carefully

2. **15% - Plugin Config Issue**

   - Wrong server URL
   - Config file not saving
   - Solution: Edit config file manually

3. **10% - Missing API Key**

   - User registered before migration
   - Solution: Run database update script

4. **5% - Other Issues**
   - Firewall blocking
   - BakkesMod not loading plugin
   - Plugin outdated

---

## ✅ Success Checklist

Before considering it "working":

- [ ] User can see API key in Settings
- [ ] API key is exactly 64 characters
- [ ] API key auth test passes (use diagnostic script)
- [ ] Upload endpoint test passes (use diagnostic script)
- [ ] Plugin config file has correct API key
- [ ] Plugin config file has correct server URL
- [ ] User can login to dashboard
- [ ] After playing freeplay, session appears in dashboard

---

## 🆘 Still Not Working?

If all tests pass but uploads still fail:

1. **Check Plugin Version:**

   - Ensure they have latest plugin build
   - Plugin might not be uploading at all

2. **Check BakkesMod Console:**

   - Open console with F6 in-game
   - Look for FURLS plugin errors
   - Should see upload confirmations

3. **Enable Debug Logging:**

   - In plugin config, add: `furls_debug 1`
   - Logs saved to: `%APPDATA%\bakkesmod\bakkesmod\logs\`

4. **Test with cURL:**

   ```powershell
   $apiKey = "their_key_here"
   $body = @{
       shots = 10
       goals = 5
       gameTime = 300
       timestamp = (Get-Date).ToUniversalTime().ToString("o")
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "https://furls.net/api/upload/upload" `
       -Method Post `
       -Headers @{"Authorization"="Bearer $apiKey"; "Content-Type"="application/json"} `
       -Body $body
   ```

   - If this works, problem is in plugin
   - If this fails, problem is in API key

---

## 📞 Quick Support Response

Template message for users:

```
Hi! Let's troubleshoot your upload issue. Please follow these steps:

1. Go to https://furls.net and login
2. Click Settings tab
3. Copy your API key (the long code)
4. Send me just the FIRST 8 characters

Then check:
5. Open: %APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg
6. Verify the API key matches (first 8 chars)
7. Verify server URL is exactly: https://furls.net

If everything matches, try:
8. Close Rocket League
9. Close BakkesMod
10. Reopen both
11. Play freeplay, take 5 shots, exit
12. Check dashboard for new session

Let me know what happens!
```

---

## 🐛 Known Issues

### Issue: PostgreSQL vs SQLite

Your local dev might use SQLite, production uses PostgreSQL.

- Make sure migration ran on production
- Check Render logs for "Generated API keys for X users"

### Issue: Timing

If migration runs while user is logged in:

- Their session might have old data
- They need to logout/login to refresh

---

**Run the diagnostic script first! It will catch 90% of issues.**

```powershell
.\diagnose-user-uploads.ps1
```
