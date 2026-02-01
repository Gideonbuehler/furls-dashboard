# 🔧 FURLS Plugin Troubleshooting Guide

## Quick Diagnostics Checklist

### ✅ Step 1: Verify Plugin Installation
1. Open BakkesMod console (`F6` in Rocket League)
2. Type: `plugin list`
3. Confirm you see `FURLS` in the list
4. If not listed, reinstall the plugin

### ✅ Step 2: Check API Key Configuration
1. Go to: https://furls-dashboard.onrender.com
2. Register/Login to your account
3. Navigate to **Settings** tab
4. Copy your API key
5. In BakkesMod console (`F6`):
   ```
   Open FURLS control panel
   Paste your API key in the Dashboard Integration section
   Enable "Automatic Upload"
   ```

### ✅ Step 3: Verify Server URLs
Make sure the plugin is pointing to the correct server:

**Expected Configuration:**
- **API URL**: `https://furls-dashboard.onrender.com/api/upload/upload`
- **Dashboard URL**: `https://furls-dashboard.onrender.com`

### ✅ Step 4: Test Upload Manually
1. Open BakkesMod console (`F6`)
2. Join a Freeplay session
3. Shoot a few balls
4. Exit the match
5. Check the console for upload messages
6. Go to dashboard and check if session appears

---

## 🐛 Common Issues & Solutions

### Issue 1: "401 Unauthorized" or "Invalid API Key"
**Symptoms:**
- Console shows authentication errors
- Stats don't appear on dashboard
- Plugin status shows "Offline"

**Solutions:**
1. **Regenerate API Key:**
   - Go to Settings → Click "🔄 Regenerate Key"
   - Copy the NEW key
   - Update in plugin configuration
   
2. **Check for typos:**
   - API keys are case-sensitive
   - Copy-paste from dashboard (don't type manually)
   - Remove any extra spaces

3. **Clear plugin cache:**
   - Close Rocket League
   - Delete plugin config: `bakkesmod/data/furls_config.cfg`
   - Restart and reconfigure

---

### Issue 2: "Network Error" or "Connection Failed"
**Symptoms:**
- Upload times out
- Console shows network errors
- Works on some networks but not others

**Solutions:**

#### For Firewall Issues:
1. **Allow BakkesMod through Windows Firewall:**
   - Windows Security → Firewall & Network Protection
   - Allow an app through firewall
   - Add: `bakkesmod.exe` and `RocketLeague.exe`
   - Enable for both Private and Public networks

2. **Check Antivirus:**
   - Some antivirus software blocks BakkesMod HTTP requests
   - Add exception for BakkesMod folder
   - Temporarily disable to test

#### For Network Issues:
1. **Test server connectivity:**
   - Open browser: https://furls-dashboard.onrender.com
   - If it doesn't load, server might be down
   - Check server status in Settings tab

2. **Try different network:**
   - Mobile hotspot test (to rule out network restrictions)
   - Check if school/work network blocks external APIs
   - Contact network admin if on restricted network

3. **VPN/Proxy:**
   - If using VPN, try disabling it
   - Some VPNs block HTTP requests from games
   - Or try a different VPN server

---

### Issue 3: Stats Upload but Don't Appear on Dashboard
**Symptoms:**
- Plugin shows "Upload successful"
- Dashboard shows no new sessions
- Wrong account receiving stats

**Solutions:**
1. **Verify Correct Account:**
   - Check username in plugin matches dashboard account
   - Make sure you're logged into the right account
   - Each player needs their OWN API key

2. **Clear Browser Cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or clear browser cache completely

3. **Check Server Logs:**
   - Contact admin with your username
   - Provide timestamp of when you played

---

### Issue 4: "Plugin Status" Shows Offline
**Symptoms:**
- Red indicator in dashboard header
- Says "Plugin Offline"
- Even after successful uploads

**Explanation:**
- Plugin status checks last upload timestamp
- Shows "Connected" if upload within last 5 minutes
- Shows "Offline" if no recent uploads

**Solutions:**
1. **Play a match:**
   - Stats only upload AFTER you exit a match
   - Not during the match
   
2. **Wait a few seconds:**
   - Plugin indicator updates every 2 seconds
   - Give it time to refresh

---

## 🔍 Advanced Diagnostics

### Test Your API Key (Quick Check)
Use this URL in your browser or curl to test if your API key works:

```bash
curl -X GET https://furls-dashboard.onrender.com/api/upload/test-auth \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "API key is valid!",
  "username": "YourUsername",
  "userId": 123,
  "timestamp": "2026-02-01T12:00:00.000Z"
}
```

**Error Response (Failed):**
```json
{
  "error": "Invalid API key"
}
```

If you get an error, your API key is wrong or expired. Regenerate it in Settings.

### Enable Debug Logging
1. Open BakkesMod console (`F6`)
2. Enable verbose logging (if plugin supports it)
3. Check logs in: `bakkesmod/bakkesmod.log`

### Manual API Test (for developers)
Test if API key works using curl:

```bash
curl -X POST https://furls-dashboard.onrender.com/api/upload/upload \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-01-01T12:00:00Z",
    "shots": 10,
    "goals": 5,
    "averageSpeed": 1500,
    "speedSamples": 100,
    "boostCollected": 250,
    "boostUsed": 200,
    "gameTime": 300,
    "possessionTime": 150,
    "teamPossessionTime": 200,
    "opponentPossessionTime": 100,
    "shotHeatmap": [],
    "goalHeatmap": []
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Stats uploaded successfully"
}
```

---

## 🆘 Still Not Working?

### Contact Information:
1. **Check these details:**
   - Your username on the dashboard
   - Your friend's username (if helping them)
   - Error messages from BakkesMod console
   - Network type (home/school/work/mobile)
   - Antivirus/Firewall software installed

2. **Provide this info:**
   - Operating System (Windows 10/11?)
   - BakkesMod version
   - When the issue started
   - Does it work on other networks?

---

## 📋 Configuration Checklist

Print this and check off each item:

```
□ Plugin installed and shows in `plugin list`
□ Registered account on furls-dashboard.onrender.com
□ Copied API key from Settings page
□ Pasted API key into plugin configuration
□ Enabled "Automatic Upload" in plugin
□ Server URLs configured correctly
□ Firewall allows BakkesMod
□ Played a freeplay match (not training packs)
□ Exited match (waited for upload)
□ Checked dashboard for new session
□ Plugin status shows "Connected" (within 5 min)
```

---

## 🌐 Server Status

Current server: **https://furls-dashboard.onrender.com**

Check if server is up:
- Visit: https://furls-dashboard.onrender.com
- Should see login page
- Settings tab shows "🟢 Online"

⚠️ **Note:** Render.com free tier servers may sleep after inactivity.
First request after sleep takes 30-60 seconds to wake up.

---

## 🔐 Security Notes

- **Never share your API key** with others
- Each player needs their own account and API key
- API keys are like passwords - keep them private
- If compromised, regenerate immediately in Settings

