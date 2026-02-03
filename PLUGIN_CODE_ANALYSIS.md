# 🔬 Plugin Code Analysis - Upload Function

## Plugin HTTP Upload Code Review

Based on the C++ source code, here's how the plugin uploads work:

### Endpoint Construction

```cpp
std::wstring requestPath = path;
requestPath += L"/api/stats/upload";
```

**What this means:**
- If user sets `furls_server_url = "https://furls.net"`
- Plugin parses this into: `scheme=https`, `host=furls.net`, `path=/`
- Then appends `/api/stats/upload`
- **Final URL**: `https://furls.net/api/stats/upload` ✅

### Server Compatibility

Your server has this endpoint mounted at **two** locations:

```javascript
// server/index.js line 30-31
app.use("/api/upload", uploadRoutes);  // Plugin endpoint (new)
app.use("/api/stats", uploadRoutes);   // Legacy endpoint (what plugin uses)
```

**Result**: Plugin calls `/api/stats/upload` which is **CORRECT** ✅

Both endpoints work, so there's no routing issue!

## Plugin Error Messages

The plugin has **excellent error logging**:

| Status Code | Plugin Message | Meaning |
|-------------|----------------|---------|
| 200 | `✅ Stats uploaded successfully!` | Upload worked! |
| 401 | `✗ Upload failed: Invalid API key` | API key wrong/missing |
| 403 | `✗ Upload failed: Forbidden` | API key revoked |
| 404 | `✗ Upload failed: Endpoint not found` | Wrong server URL |
| 503 | `⚠ Upload failed: Server unavailable` | Server down |
| 5xx | `✗ Upload failed: Server error` | Backend problem |
| Other | `⚠ Upload returned unexpected status` | Unknown issue |

**Additional errors:**
- `✗ Failed to receive response from server` - Network timeout
- `✗ Failed to send request to server` - Connection failed
- `✗ Failed to connect to server` - DNS/network issue
- `✗ Failed to initialize HTTP session` - WinHTTP setup failed
- `✗ Upload exception: {error}` - C++ exception caught

## Diagnostic Workflow

### Step 1: Check if Plugin is Even Trying to Upload

Have user open **BakkesMod console** (F6 in-game) and look for ANY message starting with `[FURLS]`.

**If they see NO messages:**
- Match end event isn't firing
- Plugin isn't loaded
- Upload is disabled (`furls_enable_upload = 0`)

**If they see messages:**
- Check the specific error message (see table above)
- This tells you exactly what's wrong!

### Step 2: Interpret the Error Message

#### Error: `✗ Upload failed: Invalid API key (401)`
**Problem**: API key doesn't exist in database or is wrong

**Solution**:
```sql
-- Check if user has API key
SELECT username, api_key FROM users WHERE username = 'USERNAME';

-- Generate missing API keys
UPDATE users SET api_key = encode(gen_random_bytes(32), 'hex') 
WHERE api_key IS NULL OR api_key = '';
```

Then have user:
1. Logout of furls.net
2. Login again
3. Go to Settings
4. Copy new API key
5. Paste into BakkesMod plugin settings

#### Error: `✗ Upload failed: Endpoint not found (404)`
**Problem**: Wrong server URL

**Solution**:
Check BakkesMod console commands:
```
furls_server_url  // Should show: https://furls.net
```

If it shows old URL:
```
writecvar furls_server_url "https://furls.net"
```

**Common wrong URLs:**
- ❌ `https://furls-dashboard.onrender.com` (OLD - won't work)
- ❌ `https://furls.net/` (trailing slash → double slash)
- ❌ `http://furls.net` (HTTP not HTTPS)
- ✅ `https://furls.net` (CORRECT)

#### Error: `✗ Failed to connect to server`
**Problem**: Network/DNS issue

**Solution**:
1. Check if furls.net is reachable:
   ```powershell
   Test-NetConnection -ComputerName furls.net -Port 443
   ```

2. Check Windows Firewall:
   - BakkesMod needs outbound HTTPS (443) access
   - Rocket League needs network permissions

3. Check antivirus:
   - Some AVs block BakkesMod plugins from making HTTP requests
   - Temporarily disable to test

#### Error: `✗ Failed to initialize HTTP session`
**Problem**: WinHTTP initialization failed

**Solution**:
- Usually means Windows networking is broken
- Try restarting Rocket League/BakkesMod
- Check if other plugins that use HTTP work

#### No Error Message at All
**Problem**: Upload function never runs

**Reasons:**
1. **Match end event not hooked** - Plugin bug
2. **Upload conditions not met** - Need to check:
   ```cpp
   if (shots > 0 || goals > 0 || gameTime > 10)
   ```
   User must take at least 1 shot, score 1 goal, OR play 10+ seconds

3. **Plugin not tracking stats** - Stats object is empty
4. **Auto-upload disabled** - Check `furls_enable_upload`

## Testing Commands for Users

### Check Plugin Status
```
plugin list           // Confirm FURLS is loaded
furls_enable_upload   // Should return 1
furls_server_url      // Should return https://furls.net
furls_api_key         // Should show 64-char hex string
```

### Manual Upload Test
```
furls_test_upload     // Trigger manual upload
```

Watch console for `[FURLS]` messages to see what happens.

### View Current Settings
```
writecvar furls_enable_upload
writecvar furls_server_url
writecvar furls_api_key
```

### Fix Common Issues
```
// Wrong server URL
writecvar furls_server_url "https://furls.net"

// Upload disabled
writecvar furls_enable_upload "1"

// Wrong API key
writecvar furls_api_key "PASTE_KEY_FROM_DASHBOARD"
```

## PowerShell Test Script Update

Your `testUsers.ps1` script already tests:
- ✅ Server health
- ✅ API key validity
- ✅ Upload endpoint
- ✅ Session visibility

**Add this section for plugin-specific testing:**

```powershell
Write-Host "Plugin Configuration Check" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Have the user open BakkesMod console (F6) and type these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   furls_server_url" -ForegroundColor White
Write-Host "   Expected: https://furls.net" -ForegroundColor Gray
Write-Host ""
Write-Host "   furls_api_key" -ForegroundColor White
Write-Host "   Expected: $($apiKey.Substring(0,8))..." -ForegroundColor Gray
Write-Host ""
Write-Host "   furls_enable_upload" -ForegroundColor White
Write-Host "   Expected: 1" -ForegroundColor Gray
Write-Host ""
Write-Host "Are all three values correct? (y/n): " -ForegroundColor Yellow -NoNewline
$configCorrect = Read-Host

if ($configCorrect -ne 'y') {
    Write-Host ""
    Write-Host "PROBLEM: Plugin configuration is wrong!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION: Have user run these in BakkesMod console:" -ForegroundColor Yellow
    Write-Host "   writecvar furls_server_url `"https://furls.net`"" -ForegroundColor White
    Write-Host "   writecvar furls_api_key `"$apiKey`"" -ForegroundColor White
    Write-Host "   writecvar furls_enable_upload `"1`"" -ForegroundColor White
    Write-Host ""
}
```

## Flowchart: Plugin Upload Decision Tree

```
User finishes match
    ↓
Is plugin loaded?
    NO → Plugin not in plugin list → Reinstall plugin
    YES ↓
    
Is match end event fired?
    NO → Other plugins work? 
        NO → BakkesMod issue → Restart BM
        YES → Plugin hook bug → Update plugin
    YES ↓
    
Are stats being tracked?
    NO → Shot tracking broken → Check stat cvars
    YES ↓
    
Do stats meet upload threshold?
    NO → Need shots>0 OR goals>0 OR time>10s
    YES ↓
    
Is auto-upload enabled?
    NO → furls_enable_upload = 0 → Enable it
    YES ↓
    
Is API key set?
    NO → API key empty → Copy from dashboard
    YES ↓
    
Is API key valid?
    NO → Check database for key → Generate if missing
    YES ↓
    
Is server URL correct?
    NO → Wrong URL (check for old URL/trailing slash)
    YES ↓
    
Can plugin reach server?
    NO → Firewall/network issue → Check connectivity
    YES ↓
    
Upload attempt made
    ↓
Check console message:
    "✅ Stats uploaded successfully!" → WORKING!
    "✗ Invalid API key (401)" → Key wrong/missing
    "✗ Endpoint not found (404)" → Wrong URL
    "✗ Failed to connect" → Network/DNS issue
    "✗ Server error (5xx)" → Backend problem
```

## Quick Reference: User Troubleshooting Steps

1. **Open BakkesMod console** (F6 in-game)

2. **Check plugin is loaded:**
   ```
   plugin list
   ```
   Should see `FURLS` in the list

3. **Check configuration:**
   ```
   furls_server_url      → Should be: https://furls.net
   furls_api_key         → Should be 64-char hex
   furls_enable_upload   → Should be: 1
   ```

4. **Play a test match:**
   - Start freeplay
   - Take 5-10 shots
   - Exit match
   - Watch console for `[FURLS]` messages

5. **Interpret console message:**
   - `✅ Stats uploaded successfully!` → It works!
   - `✗ Invalid API key` → Wrong key
   - `✗ Endpoint not found` → Wrong URL
   - No message at all → Match end not firing

6. **Common fixes:**
   ```
   // Fix server URL
   writecvar furls_server_url "https://furls.net"
   
   // Fix API key (get from dashboard settings)
   writecvar furls_api_key "YOUR_64_CHAR_KEY_HERE"
   
   // Enable upload
   writecvar furls_enable_upload "1"
   ```

7. **Test again** - Repeat step 4

## For Plugin Developer

If uploads still don't work after all config is correct:

1. **Add more logging:**
   ```cpp
   cvarManager->log("[FURLS] Upload starting...");
   cvarManager->log("[FURLS] Server URL: " + serverUrl);
   cvarManager->log("[FURLS] API Key length: " + std::to_string(apiKey.length()));
   cvarManager->log("[FURLS] Shots: " + std::to_string(shots));
   cvarManager->log("[FURLS] Goals: " + std::to_string(goals));
   cvarManager->log("[FURLS] Game time: " + std::to_string(gameTime));
   ```

2. **Log match end detection:**
   ```cpp
   cvarManager->log("[FURLS] Match ended event fired!");
   cvarManager->log("[FURLS] Upload conditions met: " + 
       std::string((shots > 0 || goals > 0 || gameTime > 10) ? "YES" : "NO"));
   ```

3. **Add command to force upload:**
   ```cpp
   cvarManager->registerNotifier("furls_force_upload", [this](std::vector<std::string> params) {
       cvarManager->log("[FURLS] Forcing upload regardless of conditions...");
       uploadStats(true); // bypass all checks
   }, "Force upload current stats", PERMISSION_ALL);
   ```

This would let users test upload without playing a match.

## Summary

**Plugin code is correct** ✅
- Uses right endpoint: `/api/stats/upload`
- Has good error logging
- Handles all HTTP status codes properly

**Server routes are correct** ✅
- Both `/api/upload/upload` and `/api/stats/upload` work
- API key authentication works
- Database saves sessions properly

**The issue is almost certainly:**
1. Wrong `furls_server_url` (old URL or trailing slash)
2. Missing/wrong `furls_api_key` (not in database)
3. Upload disabled (`furls_enable_upload = 0`)
4. Match end events not firing (plugin load issue)
5. Stats not being tracked (tracking broken)

**To find out which one**, have users check BakkesMod console for `[FURLS]` messages!
