# 🚀 FURLS Dashboard - Simple Start Guide

## ✅ Dashboard is Now Running!

Your dashboard should now be visible at: **http://localhost:3002**

## 🎯 Quick Start (Easiest Method)

### Option 1: Double-click the batch file

1. Go to `Dashboard` folder
2. Double-click **`start-simple.bat`**
3. Browser opens automatically to http://localhost:3002
4. Done! 🎉

### Option 2: Manual start

```bash
cd Dashboard
node server/index.js
```

Then open: http://localhost:3002

## 📊 What You'll See

The dashboard has **2 main tabs**:

### 📊 Dashboard Tab

- **Current Session Stats**:

  - 🎯 Accuracy (goals/shots %)
  - ⚡ Average Speed
  - 💨 Boost Used/Collected
  - ⏱️ Session Time & Possession

- **All-Time Statistics**:
  - Total Sessions, Shots, Goals
  - Average Accuracy
- **📈 History Chart**:
  - Accuracy progression over sessions
  - Goals per session

### 📋 Stats Tab

- Detailed breakdown of current session
- All statistics in one view

## 🎮 Using with Rocket League

### Automatic Export (Once you rebuild the plugin)

1. Build the updated FURLS plugin (includes new export code)
2. Load Rocket League with BakkesMod
3. Play a training/freeplay session
4. When match ends → **stats auto-export to JSON**
5. Dashboard updates automatically every 2 seconds!

### Manual Export

Press **F6** in Rocket League (BakkesMod console) and type:

```
export_stats
```

## 📁 Data Location

Stats are saved to:

```
%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json
```

The dashboard watches this file for changes.

## 🧪 Test Data

To generate sample data (already done!):

```bash
npm run test-data
```

This creates realistic training stats so you can see the dashboard working immediately.

## 🔧 What Changed in the Plugin

### Files Modified:

- **FURLS.h** - Added `ExportStatsToJSON()` function declaration
- **FURLS.cpp** - Added JSON export function that:
  - Exports all session stats (shots, goals, speed, boost, possession, time)
  - Exports full shot and goal heatmaps (62x50 grids)
  - Adds timestamp to each session
  - Automatically exports when match ends
  - Can be manually triggered with `export_stats` console command

### To Use the New Export Feature:

1. **Rebuild the plugin** in Visual Studio (Ctrl+Shift+B)
2. The new DLL will be automatically loaded by BakkesMod
3. Play Rocket League and complete a session
4. Stats will auto-export!

## 🎨 Dashboard Features

✨ **Real-time Updates** - Refreshes every 2 seconds  
✨ **Beautiful Dark Theme** - Professional purple-black gradient  
✨ **Responsive Design** - Works on any screen size  
✨ **Auto-updating Charts** - See your progress visually  
✨ **Session History** - Track up to 100 past sessions  
✨ **Connection Status** - Know when data is being received

## 💡 Pro Tips

1. **Keep Dashboard Open** - It updates automatically while you play
2. **Dual Monitors** - Dashboard on one screen, game on the other
3. **Check Connection Status** - Green dot = connected, red = disconnected
4. **Generate Test Data** - Use `npm run test-data` to preview anytime
5. **Use Manual Export** - Type `export_stats` in console (F6) to save mid-session

## 🐛 Troubleshooting

### Dashboard shows "Not Connected"

- Make sure the server is running (green dot should appear after 2 seconds)
- Check that test data exists (run `npm run test-data`)
- Verify file exists: `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`

### Port already in use

- The start script automatically kills any existing process
- Or manually change port in `server/index.js` line 8

### No data after playing Rocket League

1. Make sure FURLS plugin is loaded (F2 → Plugins → check FURLS)
2. **Rebuild the plugin** with the new export code
3. Complete a full session (match must end)
4. Or use console: `export_stats` (F6)

### Server won't start

- Close any running Node processes
- Run `start-simple.bat` which auto-closes existing instances
- Check Node.js is installed: `node --version`

## 📊 Dashboard Technology

**Simple & Lightweight:**

- Pure HTML/CSS/JavaScript
- No build process needed
- CDN-hosted libraries (Chart.js, Axios)
- Works with any Node.js version
- Single HTML file dashboard

**Backend:**

- Node.js + Express
- Watches BakkesMod data folder
- REST API for stats
- Auto-loads on file changes

## 🎯 Current Status

✅ Server running on http://localhost:3002  
✅ Test data generated  
✅ Dashboard visible in browser  
✅ Auto-refresh enabled (every 2 seconds)  
✅ Connection status: Connected

## 🎮 Next Steps

1. ✅ **Dashboard is working** with test data
2. ⏭️ **Rebuild FURLS plugin** in Visual Studio
3. ⏭️ **Play Rocket League** with BakkesMod
4. ⏭️ **Complete a session** → stats export automatically
5. ⏭️ **Watch dashboard update** in real-time!

---

## 🎉 You're All Set!

Your FURLS Training Dashboard is **live and running**!

**To see it now:**

- Open: http://localhost:3002
- Or run: `start-simple.bat`

**To use with Rocket League:**

1. Rebuild the FURLS plugin (has new export code)
2. Play training sessions
3. Stats export automatically when match ends
4. Dashboard updates every 2 seconds!

Enjoy tracking your Rocket League training! 🚗⚽📊
