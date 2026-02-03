# ✅ FURLS Plugin Upload Checklist

## For Users Having Upload Issues

If your stats aren't uploading to the dashboard, go through this checklist step by step.

---

## 1️⃣ Account Setup

- [ ] I have an account at https://furls.net
- [ ] I can login successfully
- [ ] I can see the Settings page
- [ ] I can see my API key on the Settings page

---

## 2️⃣ Plugin Installation

In BakkesMod console (press `F6` in Rocket League):

```
plugin list
```

- [ ] I see "FURLS" in the plugin list
- [ ] The plugin shows as "loaded"

If you don't see FURLS:

1. Download the latest plugin from the official source
2. Copy `FURLS.dll` to: `%APPDATA%/bakkesmod/bakkesmod/plugins/`
3. Restart BakkesMod
4. Check `plugin list` again

---

## 3️⃣ Plugin Configuration

### Check Current Settings

In BakkesMod console:

```
readcvar furls_server_url
readcvar furls_api_key
readcvar furls_auto_upload
```

### Expected Values:

- `furls_server_url` should be: **`https://furls.net`** (no trailing slash!)
- `furls_api_key` should be: **Your API key from dashboard**
- `furls_auto_upload` should be: **1**

### If Values Are Wrong:

In BakkesMod console:

```
writecvar furls_server_url "https://furls.net"
writecvar furls_api_key "YOUR_KEY_FROM_DASHBOARD"
writecvar furls_auto_upload "1"
```

**⚠️ CRITICAL:**

- [ ] Server URL is exactly `https://furls.net` (NOT `http`, NOT with trailing `/`)
- [ ] API key matches what's on the dashboard
- [ ] Auto upload is enabled (set to 1)

---

## 4️⃣ Test Your API Key

Copy this into PowerShell (replace YOUR_KEY with your actual key):

```powershell
$apiKey = "YOUR_KEY_FROM_DASHBOARD"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://furls.net/api/upload/test-auth" -Headers $headers
```

- [ ] Command returns `"success": true`
- [ ] Shows my username

If this fails:

1. Double-check you copied the API key correctly (no extra spaces)
2. Make sure you're logged in to the dashboard
3. Try regenerating your API key on the dashboard

---

## 5️⃣ Test Upload Manually

Copy this into PowerShell:

```powershell
$apiKey = "YOUR_KEY_FROM_DASHBOARD"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$testData = @{
    shots = 10
    goals = 3
    gameTime = 120
    timestamp = (Get-Date).ToString("o")
    averageSpeed = 1500
    boostCollected = 50
    boostUsed = 45
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://furls.net/api/upload/upload" -Method Post -Headers $headers -Body $testData
```

- [ ] Command returns `"success": true`
- [ ] Go to dashboard and refresh - you should see a new session

If this works but the plugin doesn't:
→ The problem is the plugin, not your account or the server

---

## 6️⃣ Test In-Game Upload

1. Launch Rocket League
2. Press `F6` to open BakkesMod console
3. Join a Freeplay match
4. **Take at least 3-5 shots at the goal**
5. Exit the match (ESC → Forfeit or Leave Match)
6. **Immediately check the BakkesMod console**

**Look for these messages:**

```
[STATS] Match ended processing complete
[FURLS] Starting upload...
[FURLS] Stats uploaded successfully!
```

**Questions:**

- [ ] I see "[STATS] Match ended" in console
- [ ] I see "[FURLS] Starting upload" in console
- [ ] I see upload success or error message
- [ ] I took at least 1 shot during the match
- [ ] Match lasted at least 10 seconds

**If you see NO messages:**
→ Plugin isn't detecting match end or isn't loaded

**If you see error messages:**
→ Copy the exact error and share it

---

## 7️⃣ Check Dashboard

After a successful upload:

1. Go to https://furls.net
2. Login
3. Go to Dashboard tab
4. Refresh the page

- [ ] I see my sessions listed
- [ ] Stats are updating (shots, goals, etc.)
- [ ] Session appears within 5 seconds of match end

---

## 8️⃣ Common Issues

### Issue: Plugin doesn't log anything to console

**Possible causes:**

- Plugin isn't loaded
- Match end events aren't firing
- You didn't take any shots (plugin requires shots > 0 OR goals > 0 OR gameTime > 10s)

**Solution:**

```
plugin load FURLS
```

Then try playing a match again.

---

### Issue: "401 Unauthorized" error

**Cause:** API key is wrong or missing

**Solution:**

1. Go to dashboard Settings page
2. Copy API key exactly (select all, copy)
3. In BakkesMod console:

```
writecvar furls_api_key "PASTE_KEY_HERE"
```

4. Try uploading again

---

### Issue: "404 Not Found" error

**Cause:** Server URL is wrong

**Solution:**
In BakkesMod console:

```
writecvar furls_server_url "https://furls.net"
```

Make sure there's:

- ✅ No trailing slash
- ✅ HTTPS not HTTP
- ✅ Exactly `furls.net` (not `furls.net`)

---

### Issue: Manual test works but plugin doesn't

**This means:**

- ✅ Your API key is valid
- ✅ Server is working
- ✅ Network connection is fine
- ❌ Plugin isn't uploading properly

**Next steps:**

1. Verify plugin config file at: `%APPDATA%/bakkesmod/bakkesmod/plugins/settings/furls.cfg`
2. Check that it contains:

```
furls_server_url "https://furls.net"
furls_api_key "YOUR_KEY"
furls_auto_upload "1"
```

3. Restart BakkesMod after changing config
4. Try uploading again

---

### Issue: Stats appear but are wrong/delayed

**Cause:** Plugin stats collection might have issues

**Solution:**

- Make sure you're using the latest plugin version
- Check if other stats plugins interfere
- Try disabling other plugins temporarily

---

## 9️⃣ Advanced Diagnostics

If nothing works, provide this information:

### System Info

```
Windows version:
BakkesMod version:
Rocket League version:
```

### Plugin Info

```
In BakkesMod console:
plugin list
```

Copy the FURLS line.

### Config Values

```
In BakkesMod console:
readcvar furls_server_url
readcvar furls_api_key
readcvar furls_auto_upload
```

### Network Test

```powershell
# In PowerShell
Test-NetConnection -ComputerName furls.net -Port 443
```

### Recent Logs

Check: `%APPDATA%/bakkesmod/bakkesmod/logs/`

Look for files with today's date and search for "FURLS" or "upload"

---

## 🔟 Getting Help

If you've gone through this entire checklist and still have issues:

1. **Screenshot your BakkesMod console** after attempting a match
2. **Copy the output** of the PowerShell test commands
3. **Share your plugin config file** (remove your API key first!)
4. **Describe what happens** when you play a match and exit

With this information, we can identify the exact problem.

---

## ✅ Success Checklist

When everything works correctly, you should see:

- ✅ Plugin shows in `plugin list`
- ✅ Console shows upload messages after each match
- ✅ Dashboard updates within seconds of match end
- ✅ Stats are accurate (shots, goals, etc.)
- ✅ Heatmaps appear on dashboard
- ✅ No error messages in console

---

## Quick Reference Commands

**BakkesMod Console Commands:**

```
plugin list                                    # Check if FURLS is loaded
readcvar furls_server_url                     # Check server URL
readcvar furls_api_key                        # Check API key (first 8 chars)
writecvar furls_server_url "https://furls.net"  # Set server URL
writecvar furls_auto_upload "1"               # Enable auto upload
```

**PowerShell Test Commands:**

```powershell
# Test API key
$apiKey = "YOUR_KEY"; $headers = @{"Authorization" = "Bearer $apiKey"}; Invoke-RestMethod -Uri "https://furls.net/api/upload/test-auth" -Headers $headers

# Test network
Test-NetConnection -ComputerName furls.net -Port 443
```

**File Locations:**

```
Plugin DLL:    %APPDATA%/bakkesmod/bakkesmod/plugins/FURLS.dll
Config file:   %APPDATA%/bakkesmod/bakkesmod/plugins/settings/furls.cfg
Logs:          %APPDATA%/bakkesmod/bakkesmod/logs/
```

---

**Dashboard:** https://furls.net  
**Support:** Share console output and config values for help
