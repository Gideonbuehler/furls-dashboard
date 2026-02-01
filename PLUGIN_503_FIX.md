# 🔧 503 Error - FURLS Plugin Connection Fix

## 🔴 Problem: 503 Error When Testing Plugin Connection

The **503 Service Unavailable** error means the FURLS Dashboard server isn't running or the plugin can't reach it.

---

## ✅ Quick Fix Steps

### Step 1: Make Sure the Server is Running

#### Check if server is running:
```powershell
# Open PowerShell and check if port 3002 is in use
netstat -ano | findstr :3002
```

If you see output, the server is running. If not, start it:

#### Start the server:
```powershell
cd "c:\Users\gideo\source\repos\FURLS\Dashboard"
npm start
```

You should see:
```
✅ Connected to SQLite database
FURLS Dashboard API running on http://localhost:3002
```

**Keep this terminal window open!** The server needs to stay running.

---

### Step 2: Test Server Connection

Open a browser or use PowerShell to test the health endpoint:

#### In Browser:
```
http://localhost:3002/api/health
```

Should return:
```json
{
  "status": "ok",
  "dataFolderExists": true,
  "statsFileExists": false,
  "sessionsLoaded": 0
}
```

#### In PowerShell:
```powershell
curl http://localhost:3002/api/health
```

---

### Step 3: Configure Plugin with Correct URL

In your BakkesMod plugin settings, the API URL should be:

**For Local Development:**
```
http://localhost:3002
```

**For Production (Render.com):**
```
https://furls-dashboardonrender.com
```

⚠️ **Make sure there's NO `/api` at the end!**

✅ Correct: `http://localhost:3002`  
❌ Wrong: `http://localhost:3002/api`  
❌ Wrong: `http://localhost:3002/api/stats/upload`

The plugin will automatically append the correct path.

---

### Step 4: Get Your API Key

1. **Start the server** (if not already running)
2. **Open browser**: http://localhost:5173 (or wherever your frontend is)
3. **Login** to your account
4. **Go to Settings** tab
5. **Copy your API Key**

---

### Step 5: Test Plugin Connection

In BakkesMod plugin settings:
1. Set **API URL**: `http://localhost:3002`
2. Paste your **API Key**
3. Click **"Test Connection"**

Should see: ✅ **Connection successful!**

---

## 🔍 Common Issues & Solutions

### Issue 1: "Server not running"
**Symptom:** 503 error, connection refused  
**Solution:** Start the server with `npm start` and keep it running

### Issue 2: "Wrong port"
**Symptom:** 503 error even when server is running  
**Solution:** Check your `.env` file - should have `PORT=3002`

### Issue 3: "CORS error"
**Symptom:** Plugin can reach server but gets blocked  
**Solution:** Server already has CORS enabled - should work

### Issue 4: "Invalid API key"
**Symptom:** 401 Unauthorized error (not 503)  
**Solution:** Regenerate API key in Settings and update plugin

### Issue 5: "Can't reach localhost"
**Symptom:** Plugin can't connect to localhost  
**Solution:** Make sure Windows Firewall isn't blocking port 3002

---

## 📋 Complete Setup Checklist

- [ ] Server is running (`npm start` in Dashboard folder)
- [ ] Server shows "FURLS Dashboard API running on http://localhost:3002"
- [ ] Health check works: http://localhost:3002/api/health
- [ ] You can login to dashboard at http://localhost:5173
- [ ] You have copied your API key from Settings
- [ ] Plugin URL is set to `http://localhost:3002`
- [ ] Plugin has your API key pasted in
- [ ] Test connection shows success

---

## 🧪 Testing the Connection

### Manual Test with PowerShell

Replace `YOUR_API_KEY_HERE` with your actual API key:

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY_HERE"
    "Content-Type" = "application/json"
}

$body = @{
    timestamp = (Get-Date).ToString("o")
    shots = 10
    goals = 7
    averageSpeed = 85.5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/stats/upload" -Method POST -Headers $headers -Body $body
```

Should return:
```json
{
  "success": true,
  "message": "Stats uploaded successfully"
}
```

---

## 🚀 Running Server Permanently

### Option 1: Keep Terminal Open
Just leave the `npm start` terminal window open while playing

### Option 2: Run as Background Process (Windows)
```powershell
# Start server in background
Start-Process powershell -ArgumentList "cd 'c:\Users\gideo\source\repos\FURLS\Dashboard'; npm start" -WindowStyle Hidden
```

### Option 3: Use the Start Script
Double-click `start-dashboard.bat` in the Dashboard folder

---

## 📝 Server Startup Script

Create this file if it doesn't exist: `start-dashboard.bat`

```batch
@echo off
echo Starting FURLS Dashboard Server...
cd /d "%~dp0"
call npm start
pause
```

Double-click to start the server easily!

---

## 🌐 Production (Render.com) Setup

If you want to use your deployed version instead:

1. **Get your Render URL** (from Render dashboard)
2. **Set plugin URL to**: `https://your-app.onrender.com`
3. **Use same API key** (works for both local and production)
4. **No need to run local server**

⚠️ **Note:** Render free tier sleeps after inactivity - first upload may be slow

---

## ❓ Still Not Working?

### Check Server Logs
Look for errors in the terminal where you ran `npm start`

### Check Plugin Logs
BakkesMod console will show connection errors

### Test Endpoint Manually
```powershell
# Test without API key (should get 401, not 503)
curl http://localhost:3002/api/stats/plugin-status
```

If you get 503, server isn't running.  
If you get 401, server is running but needs API key.

---

## 💡 Pro Tip

Create a shortcut to start everything at once:

**`start-all.ps1`:**
```powershell
# Start backend
Start-Process powershell -ArgumentList "cd 'c:\Users\gideo\source\repos\FURLS\Dashboard'; npm start"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "cd 'c:\Users\gideo\source\repos\FURLS\Dashboard\client'; npm run dev"

# Open browser
Start-Process "http://localhost:5173"
```

---

**Bottom line:** Make sure your server is running with `npm start` and the plugin URL is set to `http://localhost:3002`! 🎯
