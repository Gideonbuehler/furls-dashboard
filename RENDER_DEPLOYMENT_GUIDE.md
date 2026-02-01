# 🚀 FURLS - Render.com Deployment Guide

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
Your code needs to be on GitHub for Render to deploy it.

```powershell
# Initialize git (if not already done)
cd c:\Users\gideo\source\repos\FURLS\Dashboard
git init
git add .
git commit -m "Initial commit - FURLS Dashboard with public platform features"

# Create a new repository on GitHub (github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/furls-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render.com

### 2.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `furls-dashboard` repository

### 2.2 Configure Web Service

**Basic Settings:**
- **Name**: `furls-backend` (or `furls-api`)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (or type `server` if you want)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server/index.js`

**Instance Type:**
- Free tier is fine to start!
- Can upgrade later if needed

### 2.3 Set Environment Variables

Click **"Environment"** tab and add:

```
NODE_ENV=production
JWT_SECRET=<generate-a-random-secret-here>
```

To generate a secure JWT secret:
```powershell
# Run in PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Copy the output and use it as your `JWT_SECRET`.

### 2.4 Deploy!

1. Click **"Create Web Service"**
2. Render will automatically deploy your backend
3. Wait 2-5 minutes for deployment
4. Your API will be available at: `https://furls-backend.onrender.com`

**Copy this URL! You'll need it for the plugin configuration.**

---

## Step 3: Configure the Plugin

### 3.1 Get Your API Key

1. Start your local dashboard: `npm start` (in Dashboard folder)
2. Register/login at http://localhost:5173
3. Open browser console (F12)
4. Run this command:
```javascript
await fetch('http://localhost:3002/api/auth/api-key', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(d => console.log('Your API Key:', d.apiKey))
```

5. **Copy your API key!**

### 3.2 Configure Plugin to Upload to Server

In Rocket League with BakkesMod loaded:

1. Press **F6** to open BakkesMod console
2. Type these commands:

```
furls_server_url https://furls-backend.onrender.com
furls_api_key YOUR_API_KEY_HERE
furls_enable_upload 1
```

Replace `YOUR_API_KEY_HERE` with the key you copied.

**These settings are saved permanently!**

### 3.3 Test the Upload

1. Play a freeplay session in Rocket League
2. Score a goal or finish the session
3. Check the console - you should see: `[FURLS] ✓ Stats uploaded successfully to server!`

---

## Step 4: Deploy Frontend to Render.com

### 4.1 Build the Frontend

```powershell
cd c:\Users\gideo\source\repos\FURLS\Dashboard\client

# Update API URL to point to your Render backend
# Edit: client/src/services/api.js
# Change: const API_BASE_URL = 'http://localhost:3002/api';
# To: const API_BASE_URL = 'https://furls-backend.onrender.com/api';

# Build
npm run build
```

### 4.2 Deploy Static Site

**Option A: Render Static Site (Recommended)**

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Select your repository
4. Configure:
   - **Name**: `furls-dashboard`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Click **"Create Static Site"**
6. Your dashboard will be at: `https://furls-dashboard.onrender.com`

**Option B: Vercel (Faster, Free)**

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

Follow prompts, your site will be at: `https://furls-dashboard.vercel.app`

---

## Step 5: Register Your Domain (Optional)

### Option 1: Use Custom Domain

If you own `furls.rl` or `furls.com`:

1. In Render dashboard, go to your web service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed

### Option 2: Use Render's Free Subdomain

You already have:
- **Backend**: `https://furls-backend.onrender.com`
- **Frontend**: `https://furls-dashboard.onrender.com`

These work immediately!

---

## Step 6: Update Plugin Configuration

### 6.1 Update Server URL in Plugin

Since your backend is now live, update the default URL in the plugin:

Edit `FURLS.cpp`, line ~100:
```cpp
std::string serverUrl = "https://furls-backend.onrender.com"; // Your Render URL
```

Recompile the plugin and distribute to users.

Or users can set it via console:
```
furls_server_url https://furls-backend.onrender.com
```

---

## Step 7: Test the Complete Flow

### 7.1 Test Registration
1. Go to `https://furls-dashboard.onrender.com`
2. Register a new account
3. Login

### 7.2 Test Plugin Upload
1. Configure plugin with your API key (Step 3.2)
2. Play Rocket League freeplay
3. Score a goal
4. Check dashboard - stats should appear!

### 7.3 Test Public Features
1. Search for your username: `https://furls-dashboard.onrender.com/search`
2. View your profile: `https://furls-dashboard.onrender.com/profile/YOUR_USERNAME`
3. Check leaderboard: `https://furls-dashboard.onrender.com/leaderboard`

---

## 🎉 You're Live!

Your FURLS platform is now publicly accessible!

### Public URLs:
- **Dashboard**: `https://furls-dashboard.onrender.com`
- **API**: `https://furls-backend.onrender.com`
- **Your Profile**: `https://furls-dashboard.onrender.com/profile/YOUR_USERNAME`

### Share with Others:
Anyone can now:
1. Register an account
2. Configure the plugin with their API key
3. Upload their training stats
4. View public leaderboards
5. Search for other players

---

## 📊 Monitoring & Maintenance

### View Logs
- Go to Render Dashboard
- Click on your service
- Click **"Logs"** tab
- See real-time server activity

### Check Database
Since you're using SQLite, the database is stored on the Render server.

**Important**: Render's free tier may delete the database on deploys!

**Solution**: Upgrade to paid tier ($7/month) or migrate to PostgreSQL.

---

## 🔧 Troubleshooting

### Issue: Plugin Upload Fails

**Check:**
1. Is `furls_enable_upload` set to `1`?
2. Is your API key correct?
3. Is the server URL correct?

**Test manually:**
```powershell
# Test API endpoint
curl https://furls-backend.onrender.com/api/stats/upload `
  -Method POST `
  -Headers @{"Authorization"="Bearer YOUR_API_KEY"; "Content-Type"="application/json"} `
  -Body '{"timestamp":"2026-01-31T00:00:00Z","shots":10,"goals":5}'
```

### Issue: CORS Errors

The backend is configured to allow all origins. If you see CORS errors:

Edit `server/index.js`:
```javascript
app.use(cors({
  origin: ['https://furls-dashboard.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
```

### Issue: API Key Not Working

Regenerate your API key:
```javascript
// In browser console on dashboard:
await fetch('http://localhost:3002/api/auth/regenerate-api-key', {
  method: 'POST',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(d => console.log('New API Key:', d.apiKey))
```

---

## 💰 Cost Breakdown

### Free Tier (Render):
- **Backend**: Free (with 750 hours/month)
- **Frontend**: Free
- **Database**: Included (SQLite)
- **Total**: **$0/month**

### Limitations:
- Server sleeps after 15 min of inactivity (wakes on request)
- Database may be deleted on redeploys
- 100GB bandwidth/month

### Paid Tier ($7/month):
- Always-on server
- Persistent disk storage
- Better performance
- **Recommended if you have 10+ active users**

---

## 🚀 Next Steps

1. **Add Frontend Routes** for public profiles
2. **Share with Friends** - get beta testers!
3. **Monitor Usage** - check logs and server load
4. **Gather Feedback** - improve based on user input
5. **Upgrade If Needed** - if you get popular!

---

## 📞 Quick Reference

### Console Commands (In RL):
```
furls_server_url https://furls-backend.onrender.com
furls_api_key YOUR_API_KEY_HERE
furls_enable_upload 1
```

### Environment Variables:
- `JWT_SECRET` - Random 32+ character string
- `NODE_ENV` - production
- `PORT` - 3002 (auto-set by Render)

### Important URLs:
- **Backend**: https://furls-backend.onrender.com
- **Frontend**: https://furls-dashboard.onrender.com
- **Render Dashboard**: https://dashboard.render.com

---

**🎮 Your FURLS platform is now live and ready for players worldwide!**
