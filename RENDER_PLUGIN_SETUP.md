# 🌐 Using FURLS with Render.com (Production)

## 🎯 The Issue

You're trying to connect the BakkesMod plugin to your **Render.com server**, not localhost!

---

## ✅ Correct Configuration for Render.com

### 1. Find Your Render URL

Go to your Render Dashboard:
- Your service name is probably: **`furls-api`**
- Your URL will be something like: `https://furls-api.onrender.com`

Or check your `render.yaml` - it shows the service name.

### 2. Configure Plugin with Render URL

**In BakkesMod FURLS Plugin:**
```
API URL: https://your-app-name.onrender.com
API Key: (from your Render dashboard Settings)
```

⚠️ **Important:**
- Use `https://` (NOT `http://`)
- NO `/api` at the end
- Just the base Render URL

---

## 📋 Full Setup Steps for Render

### Step 1: Make Sure Render is Deployed

1. Go to https://dashboard.render.com
2. Check your **`furls-api`** service is running
3. Copy the service URL (e.g., `https://furls-api.onrender.com`)

### Step 2: Create an Account on Render

⚠️ **IMPORTANT:** Your local database accounts DON'T exist on Render!

1. Go to your Render URL in browser
2. Click **"Register"**
3. Create a NEW account (different from local)
4. Login with your new Render account

### Step 3: Get Your API Key from Render

1. Still on your Render site, go to **Settings** tab
2. Copy your **API Key**
3. This is what the plugin needs

### Step 4: Configure Plugin

**In BakkesMod:**
```
API URL: https://furls-api.onrender.com (or your actual URL)
API Key: (paste from Step 3)
```

### Step 5: Test Connection

Click **"Test Connection"** in plugin → Should work!

---

## 🔍 Find Your Render URL

If you don't know your Render URL:

### Option 1: Check render.yaml
```yaml
services:
  - type: web
    name: furls-api  # This is your service name
```

Your URL will be: `https://furls-api.onrender.com`

### Option 2: Check Render Dashboard
1. Go to https://dashboard.render.com
2. Click on your service
3. URL is shown at the top

---

## ⚠️ Important Differences: Local vs Render

| Aspect | Local (localhost) | Render (Production) |
|--------|-------------------|---------------------|
| Server URL | `http://localhost:3002` | `https://your-app.onrender.com` |
| Protocol | HTTP | HTTPS |
| Server Running | You start it manually | Always running |
| Database | SQLite (local file) | PostgreSQL (cloud) |
| Accounts | Your local users | Need new accounts |
| API Key | From local Settings | From Render Settings |

---

## 🆕 You Need a New Account on Render!

**Your local account doesn't exist on Render because:**
- Local uses SQLite database (on your computer)
- Render uses PostgreSQL database (in the cloud)
- They are completely separate!

**Steps:**
1. Go to your Render URL
2. Register a NEW account
3. Get API key from that account
4. Use that API key in plugin

---

## 🧪 Test Your Render Connection

### Test 1: Check if Render is responding
Open browser:
```
https://your-app.onrender.com/api/health
```

Should show:
```json
{
  "status": "ok"
}
```

### Test 2: Test with PowerShell

Replace with YOUR Render URL and API key:

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_RENDER_API_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    timestamp = (Get-Date).ToString("o")
    shots = 10
    goals = 7
    averageSpeed = 85.5
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-app.onrender.com/api/stats/upload" -Method POST -Headers $headers -Body $body
```

Should return:
```json
{
  "success": true,
  "message": "Stats uploaded successfully"
}
```

---

## 🐌 Render Free Tier Warning

**Render free tier sleeps after 15 minutes of inactivity!**

First request after sleep takes 30-60 seconds to wake up.

**Symptoms:**
- Plugin test times out
- First upload fails
- Subsequent uploads work fine

**Solutions:**
1. **Wait 60 seconds** after first request
2. **Upgrade to paid tier** ($7/month for always-on)
3. **Use localhost** for development (instant response)

---

## 💡 Recommended Setup

### For Development (Playing/Testing):
```
API URL: http://localhost:3002
- Fast response
- Free
- Need to keep server running
```

### For Production (Sharing with friends):
```
API URL: https://your-app.onrender.com
- Always available
- Friends can see your stats
- Slower on free tier
```

---

## 🔧 Quick Fix Checklist

- [ ] Render service is deployed and running
- [ ] I know my Render URL (from dashboard or render.yaml)
- [ ] I created a NEW account on Render site
- [ ] I got API key from Render Settings page (not local)
- [ ] Plugin URL is set to `https://...onrender.com` (not localhost)
- [ ] Plugin has Render API key (not local API key)
- [ ] Test connection works (may take 60s first time if sleeping)

---

## 📝 Common Mistakes

### ❌ Using localhost with Render
```
API URL: http://localhost:3002  ← This won't reach Render!
```

### ❌ Using local API key with Render
```
API Key: (from localhost Settings)  ← This doesn't exist on Render!
```

### ❌ Not creating Render account
You need to register on the Render website, not just push code!

### ❌ Not waiting for Render to wake up
First request may time out - wait 60 seconds and try again

---

## ✅ Correct Configuration Summary

```
📍 For Render.com Production:
   URL: https://your-app.onrender.com
   API Key: (from Render website Settings page)
   
📍 For Local Development:
   URL: http://localhost:3002
   API Key: (from localhost:5173 Settings page)
```

**You can switch between them anytime!**

---

## 🆘 Still Getting 503?

### Check 1: Is Render service running?
Go to Render Dashboard → Check service status

### Check 2: Is it sleeping?
Free tier sleeps - first request wakes it (takes 60s)

### Check 3: Test health endpoint
```
https://your-app.onrender.com/api/health
```

If this times out → Render is sleeping, wait and retry  
If this works → Plugin URL or API key is wrong

---

**Bottom line:** Use your Render URL (`https://...onrender.com`) and create a new account on that site to get an API key!
