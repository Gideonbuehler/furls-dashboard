# 🔍 Plugin Upload Endpoint Diagnostic

## Current Situation

**Test script works ✅** - Manual uploads via PowerShell succeed  
**In-game plugin doesn't work ❌** - No data appears after playing matches

## Server Endpoint Configuration

The server is correctly configured to accept uploads at **TWO** endpoints:

```javascript
// From server/index.js
app.use("/api/upload", uploadRoutes); // Line 30 - Plugin upload endpoint
app.use("/api/stats", uploadRoutes);  // Line 31 - Legacy endpoint
```

This means **BOTH** of these URLs work:
- ✅ `https://furls.net/api/upload/upload`
- ✅ `https://furls.net/api/stats/upload`

**Both endpoints point to the same upload handler** in `server/routes/upload.js`

## Test Results

Your PowerShell test script successfully uploads to:
```
https://furls.net/api/upload/upload
```

This confirms:
- ✅ Server is running
- ✅ API key authentication works
- ✅ Upload endpoint processes data correctly
- ✅ Database saves sessions properly

## The Plugin Problem

Since manual uploads work but the plugin doesn't, the issue is likely **one of these**:

### 1. Plugin is calling the wrong server URL

**Check the plugin config file** (usually in BakkesMod folder):
```
%APPDATA%/bakkesmod/bakkesmod/plugins/settings/furls.cfg
```

Look for these settings:
```
furls_server_url "https://furls.net"
furls_api_key "your-key-here"
furls_auto_upload "1"
```

**⚠️ CRITICAL: Check for these issues:**
- ❌ Old URL: `https://furls-dashboard.onrender.com`
- ❌ Trailing slash: `https://furls.net/`
- ❌ Missing https: `http://furls.net`
- ✅ Correct: `https://furls.net`

### 2. Plugin upload conditions are too strict

The plugin code you shared only uploads when:
```cpp
if (shots > 0 || goals > 0 || gameTime > 10) {
    // Upload
}
```

This means the plugin WON'T upload if:
- Zero shots taken
- Zero goals scored
- Game time less than 10 seconds

**To test this**: Play a match and make sure you shoot the ball at least once.

### 3. Match end events aren't firing

The plugin uploads on these events:
- `EventMatchEnded`
- `EventMatchWinnerSet`
- `Destroyed`

**To test this**: Check BakkesMod console (`F6` in-game) after a match ends. Look for:
```
[STATS] Match ended processing complete
[FURLS] Starting upload...
[FURLS] Stats uploaded successfully!
```

If you don't see these messages, the plugin isn't detecting match end.

### 4. Plugin is using wrong endpoint path

From the C++ code, the plugin should be making a POST request to:
```
{server_url}/api/stats/upload
```

So if `furls_server_url` is `https://furls.net`, the full URL becomes:
```
https://furls.net/api/stats/upload
```

This is correct and should work! ✅

## Debugging Steps

### Step 1: Check Plugin Console Logs

1. Launch Rocket League
2. Open BakkesMod console (`F6`)
3. Type: `plugin list` - Confirm FURLS is loaded
4. Play a freeplay match for at least 30 seconds and take a few shots
5. Exit the match (use ESC menu or forfeit)
6. Check console immediately for messages starting with `[FURLS]` or `[STATS]`

**What to look for:**
```
[STATS] Match ended processing complete
[FURLS] Starting upload...
[FURLS] Server: https://furls.net
[FURLS] Endpoint: /api/stats/upload
[FURLS] Stats uploaded successfully!
```

**Error messages to watch for:**
```
[FURLS] Upload failed: 401 Unauthorized
[FURLS] Upload failed: 404 Not Found
[FURLS] Upload failed: Connection timeout
[FURLS] Upload failed: Could not resolve host
```

### Step 2: Verify Plugin Configuration

1. Navigate to: `%APPDATA%/bakkesmod/bakkesmod/plugins/settings/`
2. Open `furls.cfg` in Notepad
3. Check these settings:

```cfg
furls_server_url "https://furls.net"
furls_api_key "YOUR_API_KEY_HERE"
furls_auto_upload "1"
furls_enable_heatmaps "1"
```

**To set them via console:**
```
writecvar furls_server_url "https://furls.net"
writecvar furls_api_key "YOUR_KEY_FROM_DASHBOARD"
writecvar furls_auto_upload "1"
```

### Step 3: Test API Key in Console

In BakkesMod console, try:
```
furls_test_upload
```

This should trigger a manual upload attempt and show detailed logs.

### Step 4: Check Windows Firewall

The plugin uses WinHTTP to make HTTPS requests. Ensure:
1. BakkesMod is allowed through Windows Firewall
2. Rocket League is allowed through Windows Firewall
3. No antivirus is blocking outgoing HTTPS connections

**To test network connectivity:**
```powershell
# In PowerShell
Test-NetConnection -ComputerName furls.net -Port 443
```

Should show:
```
TcpTestSucceeded : True
```

### Step 5: Enable Plugin Debug Logging

If the plugin supports debug mode, enable it:
```
writecvar furls_debug_logging "1"
```

Then check BakkesMod logs at:
```
%APPDATA%/bakkesmod/bakkesmod/logs/
```

## Quick Verification Test

Run this PowerShell command to test your API key works:

```powershell
$apiKey = "YOUR_API_KEY_HERE"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# Test authentication
Invoke-RestMethod -Uri "https://furls.net/api/upload/test-auth" -Headers $headers

# Test actual upload
$testData = @{
    shots = 10
    goals = 3
    gameTime = 120
    timestamp = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://furls.net/api/upload/upload" -Method Post -Headers $headers -Body $testData
```

If this works, your API key is valid and the server is accepting uploads.

## Possible Root Causes

### A. Plugin has hardcoded old URL

If the plugin source code has:
```cpp
std::string serverUrl = "https://furls-dashboard.onrender.com";
```

Then even if you set `furls_server_url` in the config, it won't be used.

**Solution**: Recompile the plugin with the correct URL or ensure it reads from config.

### B. Plugin isn't reading the config file

If the plugin doesn't load the config on startup, it will use default values.

**Solution**: Restart BakkesMod after changing the config file.

### C. Match events aren't hooking correctly

If BakkesMod's game state wrapper isn't detecting match end events.

**Solution**: Check if other plugins that hook match events work correctly.

### D. Upload is being silently suppressed

The plugin code might have additional conditions that prevent upload:
- Minimum match duration
- Online vs offline mode check
- Playlist type restrictions

**Solution**: Review the plugin source code for all upload conditions.

## What Works vs What Doesn't

| Method | Status | Notes |
|--------|--------|-------|
| PowerShell test script | ✅ Works | Confirms server + API key valid |
| Manual API call | ✅ Works | Confirms endpoint is correct |
| Plugin in freeplay | ❌ Doesn't work | Need to diagnose |
| Plugin in online match | ❌ Doesn't work | Need to diagnose |
| Dashboard displays data | ✅ Works | When data is uploaded |

## Next Steps

**For the user to do:**

1. **Check BakkesMod console during match** - Look for FURLS messages
2. **Verify config file** - Ensure `furls_server_url` is `https://furls.net`
3. **Share console logs** - Copy any error messages from BakkesMod console
4. **Try manual upload command** - Use `furls_test_upload` in console

**For you (developer) to do:**

1. **Review plugin source code** - Check if `furls_server_url` cvar is actually being read
2. **Check plugin build date** - Ensure user has the latest version
3. **Add more logging** - Add console output for every step of the upload process
4. **Test locally** - Run the plugin yourself and watch console output

## Expected Plugin Flow

```
1. Match starts
   → Plugin hooks game events
   → Starts collecting stats

2. Player takes shots
   → Stats increment: shots++
   → Heatmap data collected

3. Match ends (any of these events)
   → EventMatchEnded fires
   → EventMatchWinnerSet fires
   → Destroyed fires

4. Plugin checks upload conditions
   if (shots > 0 || goals > 0 || gameTime > 10) {
      → Proceed with upload
   } else {
      → Skip upload (insufficient data)
   }

5. Plugin constructs JSON payload
   {
     "shots": 10,
     "goals": 3,
     "gameTime": 120,
     ...
   }

6. Plugin makes HTTP request
   POST https://furls.net/api/stats/upload
   Authorization: Bearer {api_key}
   Body: {stats JSON}

7. Server responds
   → 200 OK: Upload successful
   → 401 Unauthorized: Invalid API key
   → 404 Not Found: Wrong endpoint
   → 500 Error: Server error

8. Plugin logs result to console
   [FURLS] Stats uploaded successfully!
   OR
   [FURLS] Upload failed: {error message}
```

## Key Questions to Answer

1. **Does the plugin log ANYTHING to BakkesMod console?**
   - If no: Plugin isn't loading or events aren't firing
   - If yes: Check what the logs say

2. **What is in the plugin config file right now?**
   - Need to see actual `furls.cfg` contents
   - Verify server URL is correct

3. **Does `plugin list` show FURLS as loaded?**
   - If no: Plugin installation issue
   - If yes: Plugin is running but not uploading

4. **Are match end events firing for other plugins?**
   - Test with another plugin that hooks match end
   - Confirms BakkesMod event system works

5. **What version of the plugin is installed?**
   - Older versions might have bugs
   - Might be using hardcoded old URL

## Contact Information

Once you have answers to these questions, we can pinpoint the exact issue.

The fact that manual uploads work means the server side is 100% correct. The problem is definitely in the plugin configuration or execution.
