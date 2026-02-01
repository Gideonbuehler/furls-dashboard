# 🎯 FURLS Plugin Setup - Render.com

## Your Render Configuration

**Service Name:** `furls-api`  
**Your URL:** `https://furls-api.onrender.com`

(Or check your actual URL in Render Dashboard if different)

---

## 🚀 Quick Setup for Render.com

### 1️⃣ Create Account on Render Site

```
1. Open browser: https://furls-api.onrender.com
2. Click "Register"
3. Create NEW account (username, email, password)
4. Login
```

⚠️ **Your local account doesn't exist on Render!**

---

### 2️⃣ Get API Key from Render

```
1. On the Render site, click "Settings" tab
2. Copy your API Key
```

---

### 3️⃣ Configure BakkesMod Plugin

```
API URL: https://furls-api.onrender.com
API Key: (paste from step 2)
```

⚠️ **Use `https://` (not `http://`)**  
⚠️ **NO `/api` at the end**

---

### 4️⃣ Test Connection

```
Click "Test Connection" in plugin
⏳ First time may take 60 seconds (Render waking up)
✅ Should succeed!
```

---

## ⚠️ Render Free Tier Limitation

**Render sleeps after 15 minutes of inactivity!**

- First request after sleep: **30-60 seconds** ⏳
- Subsequent requests: **Fast** ⚡

**If test times out:**

1. Wait 60 seconds
2. Try again → Should work!

---

## 🔄 Local vs Render

### 🏠 For Local Development:

```
URL: http://localhost:3002
API Key: (from http://localhost:5173 Settings)
Fast, free, must run server
```

### ☁️ For Render Production:

```
URL: https://furls-api.onrender.com
API Key: (from render site Settings)
Always available, first request slow
```

**You can switch between them anytime!**

---

## ✅ Checklist

- [ ] Created account on https://furls-api.onrender.com
- [ ] Got API key from Render Settings page
- [ ] Plugin URL = `https://furls-api.onrender.com`
- [ ] Plugin API key = (from Render, not local)
- [ ] Tested connection (waited 60s if needed)

---

## 🐛 Troubleshooting

### "503 Error"

→ Render is sleeping, wait 60 seconds and retry

### "401 Unauthorized"

→ Wrong API key, get it from Render Settings

### "Connection timeout"

→ First request waking Render up, wait and try again

### Health Check

Test in browser: `https://furls-api.onrender.com/api/health`  
Should show: `{"status":"ok"}`

---

**TL;DR:**

1. Register on https://furls-api.onrender.com
2. Get API key from Settings
3. Plugin URL = `https://furls-api.onrender.com`
4. First test may take 60s (waking up)
