# 🔍 Personal Stats Not Updating - Diagnostic Checklist

## Your Current Situation

- ✅ API key is set up correctly
- ❌ Stats not appearing on dashboard after matches
- ✅ Plugin seems to be working

---

## 🎯 Step-by-Step Diagnosis

### Step 1: Run the Diagnostic Script

```powershell
cd c:\Users\gideo\source\repos\FURLS\Dashboard
.\test-my-connection.ps1
```

This will:

1. Verify your API key works
2. Upload a TEST session (99 shots, 88 goals, 9999 speed)
3. Tell you if the server is receiving data

**After running the script:**

- Go to https://furls-dashboard.onrender.com
- Login to your account
- Check **History** tab
- Look for the test session with **99 shots** and **88 goals**

---

### Step 2: Interpret Results

#### ✅ If you SEE the test session (99/88):

**Good news!** The server and dashboard are working perfectly.

**Problem:** BakkesMod plugin is NOT uploading your game data.

**Fix:**

1. Open Rocket League
2. Press `F6` (BakkesMod console)
3. Type: `plugin list`
4. Verify **FURLS** appears in the list
5. If not listed: Reinstall the plugin
6. If listed: Continue to Step 3

---

#### ❌ If you DON'T see the test session:

**Problem:** Dashboard is not showing uploaded data (database/query issue)

**Immediate Actions:**

1. Hard refresh browser: `Ctrl + Shift + R`
2. Try different browser (Chrome/Firefox/Edge)
3. Clear browser cache completely
4. Check browser console (F12) for errors
5. Try incognito/private mode

**If still not showing:**

- Check you're logged into the CORRECT account
- The test session was uploaded to YOUR account
- Database issue - contact admin with:
  - Your username
  - The timestamp from the script
  - Session ID from the script

---

### Step 3: Plugin Configuration Check

If test session appeared but game sessions don't:

#### Open FURLS Control Panel in BakkesMod:

1. Press `F6` in Rocket League
2. Open FURLS settings/control panel

#### Verify These Settings:

**✓ API Key:**

- Must be EXACTLY as shown in dashboard Settings
- No spaces before or after
- Copy-paste, don't type manually

**✓ Automatic Upload:**

- Checkbox must be ENABLED/CHECKED
- This is the most common issue!

**✓ Dashboard URL:**

- Should be: `https://furls-dashboard.onrender.com`
- Or leave default if plugin has it built-in

**✓ Upload Endpoint:**

- Should be: `https://furls-dashboard.onrender.com/api/upload/upload`
- Or leave default if plugin has it built-in

---

### Step 4: Test In-Game Upload

#### Start a Fresh Test:

1. **Close Rocket League completely**
2. **Reopen Rocket League**
3. **Press F6** (BakkesMod console should appear)
4. Type: `plugin load furls` (if needed)
5. **Go to Freeplay** (NOT training packs)
6. **Shoot 10 balls** at the goal (hit at least 5)
7. **EXIT completely:** Press Esc → "Leave Match"
8. **Watch the console** (F6) for messages:
   - Look for: "Uploading stats..." or "Upload successful"
   - Or look for: "Upload failed" or errors

#### What the Console Should Show:

```
[FURLS] Match ended - collecting stats...
[FURLS] Shots: 10, Goals: 5
[FURLS] Uploading to dashboard...
[FURLS] Upload successful! Session ID: 123
```

#### If Console Shows Nothing:

- Plugin is not detecting match end
- Or plugin is not configured correctly
- Or "Automatic Upload" is disabled

#### If Console Shows Errors:

- Note the exact error message
- Common errors:
  - "401 Unauthorized" → Wrong API key
  - "Network error" → Firewall blocking
  - "Timeout" → Connection issue

---

### Step 5: Check Dashboard Polling

The dashboard auto-refreshes every 2 seconds. You should see:

1. After exiting match, wait **5-10 seconds**
2. Dashboard should update automatically
3. Check **Dashboard** tab (shows most recent)
4. Check **History** tab (shows all sessions)
5. Check **Stats** tab (shows current session details)

**If not updating automatically:**

- Try manual refresh: `F5` or `Ctrl + R`
- Try hard refresh: `Ctrl + Shift + R`
- Check if you're on the right tab
- Check if session is actually there (scroll down in History)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Plugin uploads but dashboard shows old data"

**Cause:** Browser caching or polling issue

**Fix:**

```
1. Hard refresh: Ctrl + Shift + R
2. Clear browser cache
3. Try incognito mode
4. Check different tab (Dashboard vs History vs Stats)
5. Logout and login again
```

### Issue 2: "Console shows upload success but no session appears"

**Cause:** Uploading to wrong account or database write issue

**Fix:**

```
1. Verify API key matches your logged-in account
2. Check Settings page - username should match
3. Regenerate API key and update plugin
4. Check server logs (if you have access)
```

### Issue 3: "Stats only update when I manually refresh"

**Cause:** Auto-polling not working

**Fix:**

```
1. Check browser console (F12) for JavaScript errors
2. Disable browser extensions (ad blockers can break polling)
3. Try different browser
4. Check if setInterval is being blocked
```

### Issue 4: "First session works, but subsequent ones don't"

**Cause:** Token expiration or plugin session issue

**Fix:**

```
1. Logout and login to dashboard
2. Restart Rocket League completely
3. Reload plugin: F6 → plugin unload furls → plugin load furls
4. Re-verify API key in plugin
```

### Issue 5: "Training packs don't upload"

**Expected behavior!** Training packs may not trigger uploads.

**Use Freeplay instead:**

- Freeplay sessions always upload
- Training packs may or may not (depends on plugin)
- Casual/Competitive matches upload (if plugin supports)

---

## 📊 Server Logs (For Admin)

If you have access to Render logs, look for:

**Successful Upload:**

```
[AUTH SUCCESS] User: yourusername (ID: 123) from IP: x.x.x.x
[UPLOAD START] User: yourusername, Shots: 10, Goals: 5, GameTime: 300s
[UPLOAD SUCCESS] User: yourusername (ID: 123) - Session #456 - 10 shots, 5 goals
```

**Failed Authentication:**

```
[AUTH FAILED] Invalid API key from IP: x.x.x.x, Key prefix: abcd1234...
```

**Failed Upload:**

```
[UPLOAD ERROR] User: yourusername (ID: 123) [error details]
```

---

## 🔧 Advanced Troubleshooting

### Check Database Directly

If you have database access:

```sql
-- Check if sessions are being saved
SELECT * FROM sessions
WHERE user_id = YOUR_USER_ID
ORDER BY timestamp DESC
LIMIT 10;

-- Check user's last_active timestamp
SELECT username, last_active, total_sessions, total_shots
FROM users
WHERE username = 'yourusername';
```

### Check Network Traffic

Use browser DevTools (F12 → Network tab):

1. Watch for requests to `/api/stats/history`
2. Should happen every 2 seconds
3. Check response - should include your sessions
4. Check for 401/403/500 errors

### Test Raw API Endpoints

Using PowerShell:

```powershell
# Get your JWT token from browser (localStorage)
$token = "YOUR_JWT_TOKEN"
$headers = @{ Authorization = "Bearer $token" }

# Test history endpoint
Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/stats/history?limit=10&offset=0" -Headers $headers

# Test all-time stats
Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/stats/alltime" -Headers $headers
```

---

## ✅ Final Checklist

Before seeking help, confirm:

```
□ Ran test-my-connection.ps1 script
□ Test session (99 shots) appeared on dashboard
□ Game sessions NOT appearing
□ Plugin shows in `plugin list`
□ API key is correct and pasted in plugin
□ "Automatic Upload" is ENABLED
□ Played Freeplay (not training pack)
□ EXITED match completely (not just paused)
□ Console shows upload success message
□ Waited 10+ seconds for dashboard to update
□ Hard refreshed browser (Ctrl+Shift+R)
□ Checked History tab (not just Dashboard)
□ Tried different browser
□ Restarted Rocket League
```

---

## 📞 Getting Help

If still not working, provide:

**Required Information:**

1. Dashboard username
2. Result of test-my-connection.ps1
3. Screenshot of FURLS plugin settings
4. Screenshot/text of console messages after match
5. Screenshot of dashboard History tab
6. Browser used (Chrome/Firefox/Edge)
7. Approximate time you played (to check logs)

**Helpful Information:** 8. Does test session (99/88) appear on dashboard? (Y/N) 9. Does console show upload success? (Y/N) 10. Any error messages? (Copy exact text) 11. Tried different browsers? (Y/N) 12. Works for others on same network? (Y/N)

---

## 🎯 Most Likely Causes

Based on "API is set up correctly but stats don't update":

**90% chance:** Plugin's "Automatic Upload" is disabled
**5% chance:** Plugin not detecting match end correctly
**3% chance:** Browser caching/refresh issue
**2% chance:** Server-side database/query issue

**Start with:** Verify "Automatic Upload" is enabled in plugin!

---

**Dashboard:** https://furls-dashboard.onrender.com
**Test Script:** `.\test-my-connection.ps1`
