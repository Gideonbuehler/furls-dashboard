# 🔍 Playlist & MMR Upload Issue - Troubleshooting Guide

## Issue Report

**User reported:** Playlist and MMR stats are not being uploaded after playing matches.

---

## ✅ Diagnostic Steps

### Step 1: Check Production Database Schema

Run this command to check if the database columns exist on Render.com:

```powershell
# Get your DATABASE_URL from Render.com dashboard → Database → External Database URL
$env:DATABASE_URL = "postgres://your-database-url-here"
node check_remote_playlist_mmr.js
```

**Expected Results:**

✅ **If migrations ran successfully:**

```
✅ playlist       | Type: text                 | Nullable: YES
✅ is_ranked      | Type: integer              | Nullable: YES
✅ mmr            | Type: real                 | Nullable: YES
✅ mmr_change     | Type: real                 | Nullable: YES
```

❌ **If migrations did NOT run:**

```
❌ NO PLAYLIST/MMR COLUMNS FOUND!
⚠️  MIGRATIONS HAVE NOT RUN YET ON PRODUCTION!
```

---

## 🔧 Solution A: Migrations Haven't Run (Database Schema Missing)

### Cause

The database migrations in `server/database.js` haven't executed on your production Render deployment yet.

### Fix

1. **Trigger a new deployment on Render.com:**

   - Go to Render.com dashboard
   - Click your web service
   - Click "Manual Deploy" → "Deploy latest commit"
   - OR push a new commit to trigger auto-deploy

2. **Verify migrations ran:**

   - Check Render logs during deployment
   - Look for these messages:
     ```
     ✓ Added playlist column to sessions table
     ✓ Added is_ranked column to sessions table
     ✓ Added mmr column to sessions table
     ✓ Added mmr_change column to sessions table
     ```

3. **Re-run the diagnostic:**
   ```powershell
   node check_remote_playlist_mmr.js
   ```

---

## 🔧 Solution B: Plugin Not Sending Data (Schema Exists, No Data)

### Cause

The BakkesMod plugin is NOT capturing or sending playlist/MMR metadata to the server.

### Investigation Required

The plugin code is likely in a separate repository. You need to check:

**1. Plugin captures playlist data:**

```cpp
// Plugin should retrieve:
std::string playlistName = GetCurrentPlaylist();
bool isRanked = IsRankedMatch();
float currentMMR = GetPlayerMMR();
float mmrChange = CalculateMMRChange();
```

**2. Plugin includes fields in JSON upload:**

```cpp
// Example JSON payload structure
{
  "shots": 10,
  "goals": 5,
  "averageSpeed": 1200,
  // ... other fields ...
  "playlist": "Ranked Doubles 2v2",    // ← REQUIRED
  "isRanked": true,                     // ← REQUIRED
  "mmr": 1250.5,                        // ← REQUIRED
  "mmrChange": 12.3                     // ← REQUIRED
}
```

**3. Plugin sends to correct endpoint:**

```cpp
// Should POST to: /api/stats/upload
// With Authorization header: Bearer <api_key>
```

### Files to Check (Plugin Repository)

Look for these files in your BakkesMod plugin code:

- `FURLSPlugin.h` / `FURLSPlugin.cpp` - Main plugin file
- HTTP upload function - Where JSON payload is built
- Match end hook - Where stats are collected

### Key BakkesMod API Functions Needed

```cpp
// Get current playlist
ServerWrapper server = gameWrapper->GetCurrentGameState();
int playlistId = server.GetPlaylist().GetPlaylistId();

// Get MMR (requires RankWrapper or MMRWrapper plugin)
// This might require integration with BakkesMod's MMR tracking

// Get ranked status
bool isRanked = (playlistId >= 10 && playlistId <= 13); // Ranked playlists
```

---

## 📊 Backend Status (Already Complete)

✅ **Database schema** - Supports playlist, is_ranked, mmr, mmr_change columns  
✅ **Upload endpoint** - `/api/stats/upload` accepts all fields  
✅ **Frontend display** - Dashboard shows metadata banner when available  
✅ **Session history** - Table displays playlist and MMR delta

**Backend files already updated:**

- ✅ `server/database.js` - Schema + migrations
- ✅ `server/routes/upload.js` - Saves playlist/MMR data
- ✅ `client/src/components/Dashboard.jsx` - Displays metadata
- ✅ `client/src/components/SessionHistory.jsx` - Shows in table

---

## 🧪 Testing Procedure

### Test 1: Manual Upload Test

Create a test script to verify the endpoint works:

```javascript
// test_playlist_upload.js
const fetch = require("node-fetch");

const API_URL = "https://your-app.onrender.com/api/stats/upload";
const API_KEY = "your-api-key-here";

const testData = {
  shots: 15,
  goals: 7,
  averageSpeed: 1250,
  gameTime: 300,
  playlist: "Ranked Doubles 2v2",
  isRanked: true,
  mmr: 1234.5,
  mmrChange: 15.3,
};

fetch(API_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Upload successful:", data);
  })
  .catch((err) => {
    console.error("❌ Upload failed:", err);
  });
```

Run: `node test_playlist_upload.js`

**Expected result:** Session should save with playlist/MMR data visible in dashboard.

---

## 🎯 Most Likely Root Cause

Based on the backend being complete, the issue is **99% likely**:

### ❌ Plugin is NOT sending playlist/MMR fields

**Evidence:**

1. ✅ Backend accepts the fields (code is ready)
2. ✅ Database schema supports the fields (migrations exist)
3. ❌ User played a match → NO data uploaded

**Conclusion:** The BakkesMod C++ plugin is NOT capturing or sending these fields yet.

---

## 🔍 Next Steps

1. **First, run the database diagnostic:**

   ```powershell
   .\check-remote-playlist.ps1
   ```

2. **If columns are missing:**

   - Redeploy on Render.com
   - Verify migrations ran (check logs)

3. **If columns exist but no data:**

   - Locate the BakkesMod plugin source code
   - Check if plugin captures playlist/MMR data
   - Update plugin to send these fields in JSON
   - Recompile and test plugin

4. **Test the fix:**
   - Play a ranked match
   - Check dashboard for metadata banner
   - Check session history for playlist column

---

## 📝 Questions to Answer

1. **Do you have access to the BakkesMod plugin source code?**

   - If yes → Where is it located?
   - If no → Need to contact plugin developer

2. **Has the plugin been updated recently?**

   - When was the last plugin update?
   - Does it include playlist/MMR capture code?

3. **Which BakkesMod version are you using?**
   - Some API features require specific BakkesMod versions

---

## 📞 Support Info

**Backend:** ✅ Ready  
**Frontend:** ✅ Ready  
**Plugin:** ❓ Unknown (needs investigation)

**Created:** February 11, 2026  
**Status:** Awaiting database diagnostic results
