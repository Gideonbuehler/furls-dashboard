# BakkesMod Console Diagnostics for FURLS Plugin

## How to Open Console
Press **F6** while in Rocket League (BakkesMod must be running)

---

## Commands to Check Plugin Status

### 1. Check if Plugin is Loaded
```
plugin list
```
**Look for:** "FURLS" in the list

---

### 2. Check Upload Settings
```
furls_enable_upload
furls_api_key
furls_server_url
```

**Expected Output:**
- `furls_enable_upload` = `1` (enabled)
- `furls_api_key` = Your 64-character API key
- `furls_server_url` = `https://furls.net`

---

### 3. Test if Plugin is Tracking
After typing these commands, play a **freeplay session** and take **5-10 shots**, then exit:

**Look in console for these messages:**
- ✅ `[STATS] Match ended processing complete`
- ✅ `[FURLS] Starting upload...`
- ✅ `[FURLS] Stats uploaded successfully! Server response: ...`

**If you see:**
- ❌ No messages → Plugin not detecting match end
- ❌ `[STATS] Not enough data to upload` → Shot tracking not working
- ❌ `[FURLS] Upload failed` → API key or server issue

---

## Common Issues & Fixes

### Issue 1: No Match End Detection
**Symptoms:** No `[STATS] Match ended` message after exiting match

**Fixes:**
1. Make sure you're in an **actual match** (not main menu)
2. Play for at least **10 seconds**
3. Take at least **1 shot**
4. **Exit the match properly** (don't alt+F4)

---

### Issue 2: No Shots Detected
**Symptoms:** `[STATS] Not enough data to upload` appears

**Cause:** Plugin not tracking ball touches/shots

**Fixes:**
1. In freeplay, **hit the ball toward the goal**
2. Make sure ball **enters goal** or comes close
3. Don't shoot into your own goal
4. Restart BakkesMod if issue persists

---

### Issue 3: Upload Always Fails
**Symptoms:** `[FURLS] Upload failed` every time

**Fixes:**
1. Verify API key is correct:
   ```
   furls_api_key
   ```
   Compare with key from furls.net/dashboard/settings

2. Check server URL:
   ```
   furls_server_url
   ```
   Should be: `https://furls.net`

3. Set API key manually:
   ```
   furls_api_key YOUR_API_KEY_HERE
   ```

4. Enable uploads:
   ```
   furls_enable_upload 1
   ```

---

## Manual Upload Test

After playing a session, force an upload:

```
furls_upload_now
```

*Note: This command may not exist - check plugin commands with:*
```
help furls
```

---

## Full Reset

If nothing works, reset plugin settings:

1. Close Rocket League
2. Delete: `BakkesMod/plugins/settings/FURLS.set`
3. Restart Rocket League
4. Reconfigure plugin via BakkesMod Settings → Plugins → FURLS

---

## Report Issues

If none of these work, provide:
1. Screenshot of console after `plugin list`
2. Screenshot showing output of all three `furls_*` commands
3. Screenshot of console messages after playing a freeplay session
4. Your API key (first 8 characters only for security)

Send to: [Your support channel]
