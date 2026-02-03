# 🚀 Quick Setup Guide for Friends

## Step-by-Step Instructions

### 1️⃣ Create Your Account

1. Go to: **https://furls-dashboard.onrender.com**
2. Click "Register"
3. Choose a username and password
4. Login with your new account

### 2️⃣ Get Your API Key

1. Click on **Settings** tab (⚙️ icon)
2. You'll see your API key displayed
3. Click **"📋 Copy"** button to copy it

### 3️⃣ Configure BakkesMod Plugin

1. Open Rocket League
2. Press **F6** to open BakkesMod console
3. Open the **FURLS control panel**
4. Find **"Dashboard Integration"** section
5. **Paste your API key** (Ctrl+V)
6. **Enable "Automatic Upload"** checkbox
7. Close the panel

### 4️⃣ Test It!

1. Go to **Freeplay** in Rocket League
2. Shoot a few balls at the goal (5-10 shots)
3. **Exit the match** (press Esc → Leave Match)
4. Wait 5-10 seconds
5. Go back to the dashboard in your browser
6. Click **"Dashboard"** or **"History"** tab
7. You should see your session!

---

## ⚠️ Troubleshooting

### Not Working? Try This:

#### Test #1: Verify API Key

Open this URL in your browser (replace YOUR_API_KEY with your actual key):

```
https://furls-dashboard.onrender.com/api/upload/test-auth
```

Add this header: `Authorization: Bearer YOUR_API_KEY`

Or use PowerShell:

```powershell
$headers = @{ Authorization = "Bearer YOUR_API_KEY_HERE" }
Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/upload/test-auth" -Headers $headers
```

**If it says "Invalid API key":**

- Go back to Settings and regenerate your key
- Copy the NEW key
- Update it in the plugin

#### Test #2: Check Firewall

1. Open Windows Security
2. Go to "Firewall & network protection"
3. Click "Allow an app through firewall"
4. Make sure **BakkesMod** and **Rocket League** are both checked for:
   - ✅ Private networks
   - ✅ Public networks

#### Test #3: Different Network

- Try using your phone's hotspot
- If it works on hotspot but not your home network:
  - Your router/ISP might be blocking the connection
  - Check router settings or contact ISP

---

## 🆘 Common Issues

### Issue: "401 Unauthorized"

**Fix:** Your API key is wrong or expired

1. Regenerate in Settings
2. Copy the new key
3. Update in plugin

### Issue: "Network Error" or Timeout

**Fix:** Firewall or network blocking

1. Check Windows Firewall (see Test #2 above)
2. Disable antivirus temporarily to test
3. Try different network (mobile hotspot)

### Issue: Uploads Succeed But No Stats on Dashboard

**Fix:** Check you're logged into the right account

- Each person needs THEIR OWN account and API key
- Don't share API keys between players
- Make sure you're viewing YOUR dashboard

### Issue: Plugin Status Shows "Offline"

**Normal!** It only shows "Connected" if you uploaded in the last 5 minutes.

- Play a match
- Wait for upload to complete
- Refresh the page

---

## 📊 What Gets Tracked?

Every time you exit a match, the plugin uploads:

- ⚽ Shots and Goals
- ⚡ Average Speed
- 💨 Boost Usage
- ⏱️ Possession Time
- 🔥 Shot and Goal Heatmaps
- 📈 And more!

All your sessions appear in:

- **Dashboard** - Current session + all-time stats
- **History** - List of all sessions
- **Stats** - Detailed breakdown
- **Heatmap** - Visual shot locations

---

## 🔐 Important Notes

- **Each player needs their own account**
- **Don't share API keys** (they're like passwords)
- **Stats upload AFTER you exit a match**, not during
- **Training packs** count as matches too!
- **Server may be slow** on first request (Render free tier)

---

## ✅ Quick Checklist

Before asking for help, verify:

```
□ Created account on furls-dashboard.onrender.com
□ Logged in successfully
□ Copied API key from Settings page
□ Pasted API key into plugin
□ Enabled "Automatic Upload" in plugin
□ Windows Firewall allows BakkesMod
□ Played a FULL match in Freeplay
□ Exited the match completely
□ Waited 10 seconds for upload
□ Refreshed dashboard page
□ Checked the correct tab (Dashboard/History)
```

---

## 💬 Still Having Issues?

Provide these details:

1. Your dashboard username
2. Error messages from BakkesMod console (F6)
3. What happens when you test your API key (Test #1 above)
4. Your network type (home/school/work)
5. Antivirus/Firewall software installed

Once deployed, server logs will show:

- Authentication attempts
- Upload success/failures
- Detailed error messages

---

## 🎮 Ready to Play!

Once it's working:

1. Just play Rocket League normally
2. Stats automatically upload after each match
3. Check your dashboard anytime to see progress
4. Compare stats with friends on Leaderboard!

**Dashboard URL:** https://furls-dashboard.onrender.com

Good luck and have fun! 🚗⚽
