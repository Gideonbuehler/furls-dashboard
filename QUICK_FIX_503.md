# 🔧 Quick Fix: 503 Error with FURLS Plugin

## ✅ Your Server IS Running!

I just checked - your server is running on port 3002 and responding correctly.

---

## 🎯 The Fix: Check Plugin URL Configuration

The 503 error is likely because your **BakkesMod plugin URL is wrong**.

### ✅ Correct Configuration:

**API URL in plugin:**

```
http://localhost:3002
```

### ❌ Common Mistakes:

- ❌ `http://localhost:3002/api` (extra /api)
- ❌ `http://localhost:3002/api/stats/upload` (full path - plugin adds this automatically)
- ❌ `https://localhost:3002` (https instead of http)
- ❌ `http://127.0.0.1:3002` (use localhost, not IP)

---

## 📋 Quick Setup Steps

### 1. Get Your API Key

1. Open browser: http://localhost:5173
2. Login to your account
3. Go to **Settings** tab
4. **Copy your API key**

### 2. Configure Plugin

In BakkesMod FURLS plugin settings:

- **API URL:** `http://localhost:3002`
- **API Key:** (paste from Settings)
- Click **"Test Connection"**

Should see: ✅ **Connection successful!**

---

## 🧪 Test Your Connection

I've created a test script! Run this in PowerShell:

```powershell
cd "c:\Users\gideo\source\repos\FURLS\Dashboard"
.\test-plugin-connection.ps1
```

This will:

- ✅ Check if server is running
- ✅ Test plugin endpoint
- ✅ Validate your API key
- ✅ Simulate a plugin upload

---

## 🔍 Why You Get 503

**503 = Service Unavailable** can mean:

1. **Server not running** → But yours IS running ✅
2. **Wrong URL** → Plugin can't find the endpoint
3. **Firewall blocking** → Windows Firewall might block it
4. **Plugin using HTTPS** → Should be HTTP for local

---

## 💡 Most Likely Issue

Your plugin is probably configured with:

```
http://localhost:3002/api/stats/upload
```

Change it to:

```
http://localhost:3002
```

The plugin will automatically add the `/api/stats/upload` part!

---

## ✅ Verify It Works

After fixing the URL:

1. **Test Connection** in plugin → Should succeed
2. **Play a training session** in Rocket League
3. **Check dashboard** → Should show 🟢 "Plugin Connected"

---

## 📞 Still Not Working?

Run the test script and share the output:

```powershell
.\test-plugin-connection.ps1
```

This will tell us exactly what's wrong!

---

**TL;DR:** Change your plugin URL to just `http://localhost:3002` (no extra paths!)
