# FURLS Dashboard - Data Flow Guide

## 📊 How Data Flows from Plugin to Dashboard

### Overview

The FURLS system has a complete data pipeline that automatically saves your training stats:

1. **Plugin** captures stats during gameplay
2. **Plugin** exports stats to JSON file
3. **Dashboard** reads the file and displays current stats
4. **Dashboard** auto-saves to database (when logged in)
5. **Dashboard** loads your historical stats from database

---

## 🎮 Step 1: Plugin Exports Data

### File Location

The BakkesMod plugin automatically writes stats to:

```
%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json
```

Actual path on your system:

```
C:\Users\gideo\AppData\Roaming\bakkesmod\bakkesmod\data\furls_stats.json
```

### When Data is Exported

The plugin calls `ExportStatsToJSON()` automatically when:

- A freeplay/training match ends
- You score a goal (goal replay triggers export)
- You manually trigger export via console command: `furls_export_stats`

### Data Format

The JSON file contains:

```json
{
  "timestamp": "2026-01-30T20:50:40.128Z",
  "shots": 65,
  "goals": 33,
  "averageSpeed": 1451.47,
  "speedSamples": 986,
  "boostCollected": 313.96,
  "boostUsed": 311.72,
  "gameTime": 274.48,
  "possessionTime": 138.16,
  "teamPossessionTime": 160.47,
  "opponentPossessionTime": 135.10,
  "shotHeatmap": [[...], ...],
  "goalHeatmap": [[...], ...]
}
```

---

## 🖥️ Step 2: Dashboard Reads File

### Server Watches for Changes

The backend server (`server/index.js`) uses `chokidar` to watch the file:

```javascript
const DATA_FOLDER = path.join(process.env.APPDATA, "bakkesmod/bakkesmod/data");
const STATS_FILE = path.join(DATA_FOLDER, "furls_stats.json");

// Watches for file changes in real-time
const watcher = chokidar.watch([STATS_FILE], {
  persistent: true,
  ignoreInitial: false,
});
```

### Frontend Polls for Updates

The frontend (`client/src/App.jsx`) polls every 2 seconds:

```javascript
useEffect(() => {
  loadAllData(); // Initial load

  const interval = setInterval(() => {
    loadAllData(); // Poll every 2 seconds
  }, 2000);

  return () => clearInterval(interval);
}, [showAuth]);
```

---

## 💾 Step 3: Auto-Save to Database (When Logged In)

### Automatic Saving

When you're logged in, the dashboard automatically saves each session:

```javascript
// From App.jsx - loadAllData()
if (currentRes?.data) {
  setCurrentStats(currentRes.data);

  // Auto-save to user's account if authenticated and new session
  if (authAPI.isAuthenticated() && currentRes.data.timestamp) {
    statsAPI
      .saveSession(currentRes.data)
      .catch((err) => console.log("Could not save session:", err));
  }
}
```

### What Gets Saved

Every time the JSON file is updated:

1. Dashboard detects the change
2. Reads the new stats
3. **Automatically** calls `POST /api/user/stats/sessions`
4. Saves to your user account in the database

### Database Tables

Your stats are saved to:

- **`sessions`** table - Individual training sessions
  - Stores: shots, goals, speed, boost, possession, timestamps
  - Linked to your `user_id`
- **`users`** table - Your account info and aggregate stats
  - Auto-updates: total_sessions, total_shots, total_goals

---

## 📈 Step 4: Dashboard Displays Data

### Data Priority System

#### When NOT Logged In:

- ✅ Current session: From local file
- ✅ Session history: From local file (in-memory)
- ✅ All-time stats: From local file (calculated)
- ✅ Heatmap: From local file

#### When Logged In:

- ✅ Current session: **Still from local file** (real-time from plugin)
- ✅ Session history: **From DATABASE** (your saved sessions)
- ✅ All-time stats: **From DATABASE** (aggregated from all your sessions)
- ✅ Heatmap: From local file (current session)

### Code Implementation

```javascript
// From App.jsx - loadAllData()

// Always load current session from local file (real-time)
const currentRes = await localStatsAPI.getCurrent();
setCurrentStats(currentRes.data);

// Load from database if authenticated
if (authAPI.isAuthenticated()) {
  const userHistoryRes = await statsAPI.getHistory(50, 0);
  const userAllTimeRes = await statsAPI.getAllTimeStats();

  setSessionHistory(userHistoryRes.data); // Database stats
  setAllTimeStats(userAllTimeRes.data); // Database stats
} else {
  // Fallback to local file stats
  setSessionHistory(localHistoryRes.data);
  setAllTimeStats(localAllTimeRes.data);
}
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BAKKESMOD PLUGIN                         │
│  (Captures stats during freeplay/training)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Exports on match end / goal
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              furls_stats.json (Local File)                  │
│  C:\Users\...\AppData\Roaming\bakkesmod\...\data\           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Watched by chokidar
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           DASHBOARD BACKEND (port 3002)                     │
│  - Detects file changes                                     │
│  - Serves stats via API                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Polled every 2 seconds
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           DASHBOARD FRONTEND (port 5173)                    │
│  - Displays current session (from file)                     │
│  - Auto-saves to database (if logged in)                    │
│  - Loads history from database (if logged in)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Saves session data
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (furls.db)                            │
│  - users table (account info)                               │
│  - sessions table (all your training sessions)              │
│  - friendships table (your friends)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

### 1. Plugin is Exporting Data

- [ ] File exists: `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`
- [ ] File updates when you finish training
- [ ] File contains JSON with shots, goals, speed, etc.

### 2. Backend Server is Running

- [ ] Server started: `npm start` (in Dashboard folder)
- [ ] Server running on port 3002
- [ ] Console shows: "Server running on http://localhost:3002"
- [ ] File watcher active (shows file change logs)

### 3. Frontend is Running

- [ ] Frontend started: `cd client && npm run dev`
- [ ] Frontend running on port 5173
- [ ] Browser opens: `http://localhost:5173`

### 4. Authentication Works

- [ ] Can register a new account
- [ ] Can login with username/password
- [ ] User info appears in top-right corner
- [ ] Logout button works

### 5. Data is Being Saved

- [ ] Play some freeplay in Rocket League
- [ ] Finish the training (let match end or score goal)
- [ ] Check dashboard - current stats update
- [ ] Check database - session saved to your account
- [ ] View "History" tab - your sessions appear

---

## 🧪 Testing the Data Flow

### Test 1: Verify File is Being Written

```powershell
# Check if file exists
Test-Path "$env:APPDATA\bakkesmod\bakkesmod\data\furls_stats.json"

# View the file content
Get-Content "$env:APPDATA\bakkesmod\bakkesmod\data\furls_stats.json" | ConvertFrom-Json | ConvertTo-Json
```

### Test 2: Verify Dashboard Reads File

```powershell
# Test backend API
curl http://localhost:3002/api/stats/current
```

### Test 3: Verify Auto-Save Works

1. Login to dashboard
2. Play freeplay in Rocket League
3. Score a goal or finish training
4. Check backend logs - should show "Session saved"
5. Go to "History" tab - new session appears

### Test 4: Verify Database Has Data

```powershell
# Navigate to Dashboard folder
cd c:\Users\gideo\source\repos\FURLS\Dashboard

# Run test script
node test_system.js
```

---

## 🐛 Troubleshooting

### Issue: Stats Not Updating in Dashboard

**Check 1: Is the plugin exporting?**

```powershell
# View file modification time
Get-Item "$env:APPDATA\bakkesmod\bakkesmod\data\furls_stats.json" | Select-Object LastWriteTime
```

Should update when you finish training.

**Check 2: Is backend running?**

```powershell
# Check if port 3002 is listening
netstat -ano | findstr :3002
```

**Check 3: Is frontend running?**

```powershell
# Check if port 5173 is listening
netstat -ano | findstr :5173
```

### Issue: Stats Not Saving to Database

**Check 1: Are you logged in?**

- Top-right should show your username
- Logout button should be visible

**Check 2: Is auto-save working?**

- Open browser console (F12)
- Look for error messages
- Should see "Session saved" or similar

**Check 3: Check database directly**

```javascript
// In test_system.js or Node REPL
const db = require("./server/database.js");
db.all("SELECT * FROM sessions WHERE user_id = 1", console.log);
```

---

## 📝 Key Points

### ✅ What Works Automatically:

1. **Plugin exports** stats when match ends
2. **Dashboard reads** the file every 2 seconds
3. **Dashboard auto-saves** to your account (when logged in)
4. **Dashboard loads** your history from database (when logged in)

### ✅ What You Need to Do:

1. **Start the servers** (backend and frontend)
2. **Login** to your account
3. **Play Rocket League** freeplay/training
4. **That's it!** Everything else is automatic

### ✅ Data Sources:

- **Current session**: Always from local file (real-time)
- **History**: From database (if logged in) or local (if not)
- **All-time stats**: From database (if logged in) or local (if not)
- **Leaderboards**: Always from database (requires login)
- **Friends**: Always from database (requires login)

---

## 🎯 Next Steps

1. **Test the flow**: Play some freeplay and verify stats appear
2. **Check database**: Verify sessions are being saved
3. **Test friends**: Add a friend and compare stats
4. **Test leaderboard**: View rankings with your friends

Your FURLS Dashboard is fully configured and ready to track your training progress! 🚀
