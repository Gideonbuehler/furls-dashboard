# 🚨 PLAYLIST & MMR NOT UPLOADING - DIAGNOSIS

## The Problem

You played a match but playlist and MMR data didn't upload to your dashboard.

---

## ✅ What I've Created for You

### 1. Database Diagnostic Tool

**File:** `check_remote_playlist_mmr.js`  
**Purpose:** Check if your production database has the required columns

**How to use:**

```powershell
# Get your DATABASE_URL from Render.com (Database → Connection String)
$env:DATABASE_URL = "postgres://your-url-here"
node check_remote_playlist_mmr.js
```

### 2. Easy PowerShell Script

**File:** `check-remote-playlist.ps1`  
**Purpose:** Guides you through the diagnostic process

**How to use:**

```powershell
.\check-remote-playlist.ps1
```

---

## 🔍 Two Possible Causes

### Cause #1: Database Migrations Haven't Run on Render

**Symptoms:**

- Database is missing `playlist`, `is_ranked`, `mmr`, `mmr_change` columns
- The diagnostic script will show "❌ NO PLAYLIST/MMR COLUMNS FOUND!"

**Solution:**

1. Go to Render.com dashboard
2. Select your web service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Check logs for migration success messages
6. Re-run the diagnostic

---

### Cause #2: BakkesMod Plugin Not Sending Data

**Symptoms:**

- Database HAS the columns (diagnostic shows ✅ checkmarks)
- But all sessions show NULL for playlist/MMR data
- The diagnostic will show "Sessions with Playlist: 0"

**Solution:**
The BakkesMod plugin needs to be updated to send these fields:

```json
{
  "shots": 10,
  "goals": 5,
  "playlist": "Ranked Doubles 2v2",
  "isRanked": true,
  "mmr": 1250.5,
  "mmrChange": 12.3
}
```

**This requires:**

- Access to the BakkesMod plugin C++ source code
- Updating the plugin to capture playlist/MMR data from the game
- Recompiling the plugin DLL
- Installing the updated plugin in BakkesMod

---

## 📋 Action Plan

### Step 1: Run Diagnostic

```powershell
# Set your production database URL
$env:DATABASE_URL = "postgres://..."

# Run the check
node check_remote_playlist_mmr.js
```

### Step 2: Read Results

**If you see "❌ NO COLUMNS FOUND":**
→ Go to Step 3 (Redeploy)

**If you see "✅ Columns exist" but "Sessions with Playlist: 0":**
→ Go to Step 4 (Plugin Issue)

### Step 3: Redeploy on Render (If Migrations Missing)

1. Render.com → Your Web Service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait ~5 minutes for deployment
5. Check logs for "✓ Added playlist column to sessions table"
6. Return to Step 1 (verify fix)

### Step 4: Update Plugin (If Database OK But No Data)

1. Locate your BakkesMod plugin source code
2. Find where match data is uploaded (HTTP POST to /api/stats/upload)
3. Add code to capture:
   - Current playlist name
   - Is ranked match (boolean)
   - Current MMR value
   - MMR change from match
4. Include these fields in the JSON payload
5. Recompile plugin DLL
6. Copy new DLL to BakkesMod plugins folder
7. Restart BakkesMod
8. Play a match and test

---

## 🤔 Which One Is It?

**Most likely scenario:**

Based on the fact that:

- ✅ The backend code is complete (server accepts these fields)
- ✅ The frontend displays this data (when available)
- ✅ The database schema includes these columns (in the code)
- ❌ You played a match and nothing uploaded

**My diagnosis: 90% chance it's Cause #2** (Plugin not sending data)

BUT, if you recently deployed this feature to Render, there's a chance the migrations haven't run yet (Cause #1).

---

## 📞 Next Steps

1. **Run the diagnostic first:**

   ```powershell
   node check_remote_playlist_mmr.js
   ```

2. **Share the results with me:**

   - Does it say columns are missing?
   - Or does it say columns exist but no data?

3. **Based on results, I'll guide you to:**
   - Redeploy on Render (if migrations missing)
   - OR investigate the BakkesMod plugin (if no data being sent)

---

## 📂 Files Created

1. ✅ `check_remote_playlist_mmr.js` - Database diagnostic tool
2. ✅ `check-remote-playlist.ps1` - PowerShell helper script
3. ✅ `PLAYLIST_MMR_TROUBLESHOOTING.md` - Detailed troubleshooting guide
4. ✅ `PLAYLIST_MMR_DIAGNOSIS_SUMMARY.md` - This file (quick reference)

---

**Ready to diagnose! Run the script and let me know what you find.** 🔍
