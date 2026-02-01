# 🎉 FURLS Web Dashboard - YOU'RE ALL SET!

## ✅ What's Been Created

Your FURLS plugin now has a **beautiful web dashboard** with:

- 📊 **Real-time statistics dashboard**
- 🔥 **Interactive heatmap visualizations**
- 📈 **Session history tracking**
- 📋 **Detailed performance analytics**
- 🎨 **Modern dark theme UI**
- 🔄 **Auto-updating data (every 2 seconds)**

## 🚀 Quick Start (3 Steps!)

### Step 1: Generate Test Data (Optional - to preview dashboard)
```bash
cd Dashboard
npm run test-data
```
This creates sample data so you can see the dashboard immediately!

### Step 2: Start the Dashboard
```bash
npm run dev
```
Or just double-click: **`start.bat`**

This starts:
- ✅ Backend API on http://localhost:3001
- ✅ Frontend on http://localhost:5173

### Step 3: Open in Browser
Go to: **http://localhost:5173**

You should see the dashboard with test data!

## 🎮 Using with Rocket League

### Automatic Export (Recommended)
The plugin now **automatically exports** your stats when a match ends!

1. Build the updated FURLS plugin (it has the new export code)
2. Load Rocket League with BakkesMod
3. Play a training/freeplay session
4. When match ends → **stats auto-export** → dashboard updates!

### Manual Export
Press **F6** in-game (BakkesMod console) and type:
```
export_stats
```

## 📂 Where Data is Saved

The plugin exports to:
```
%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json
```

The dashboard watches this file and updates automatically!

## 🎨 Dashboard Tours

### Dashboard Tab (📊)
- **Current Session**: Accuracy, speed, boost, time
- **All-Time Stats**: Career totals and averages  
- **Trend Charts**: See your improvement over time

### Heatmap Tab (🔥)
- **Field Visualization**: Color-coded shot/goal locations
- **Toggle Views**: Switch between shots and goals
- **Zone Details**: Click any zone for detailed stats
- **Accuracy Mode**: See success rate per zone

### History Tab (📈)
- **Session Table**: All your past sessions
- **Performance Metrics**: Sortable columns
- **Best Highlights**: Your top performances

### Stats Tab (📋)
- **Current Session**: Full breakdown of this session
- **Career Stats**: All-time totals
- **Performance Metrics**: Detailed analytics

## 🛠️ Files Modified/Created

### Plugin Files (C++)
✏️ **Modified:**
- `FURLS\FURLS.h` - Added `ExportStatsToJSON()` declaration
- `FURLS\FURLS.cpp` - Added JSON export function + auto-export on match end

### Dashboard Files (New!)
📁 **Dashboard/**
- `package.json` - Root dependencies
- `start.bat` - Easy start script
- `server/index.js` - API server (watches data file)
- `server/test-data.js` - Test data generator
- `client/` - React frontend with 4 main tabs
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick reference
- `SETUP_SUMMARY.md` - Complete overview

## 🔧 Build the Plugin

Before using with Rocket League, rebuild the plugin:

1. Open the FURLS solution in Visual Studio
2. Build the project (Ctrl+Shift+B)
3. The new DLL will include the export functionality
4. BakkesMod will automatically reload it

## 🎯 Console Commands

In BakkesMod console (F6):
- `export_stats` - Export current session to JSON
- `export_heatmap` - Export heatmap to CSV
- `furls_reset_stats` - Reset current session
- `reset_alltime_heatmap` - Clear all-time data

## 💡 Pro Tips

1. **Test First**: Run `npm run test-data` to see the dashboard with sample data
2. **Dual Monitors**: Keep dashboard open on second screen while playing
3. **Live Updates**: Dashboard refreshes every 2 seconds automatically
4. **Mobile Friendly**: Responsive design works on phones/tablets too
5. **Track Progress**: Use history tab to see your improvement

## 🐛 Troubleshooting

### Dashboard shows "Not Connected"
- Make sure the API server is running (npm run dev)
- Check that data file exists (run `npm run test-data`)
- Verify the path: `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`

### No data after playing
- Ensure the plugin is loaded in BakkesMod (F2 → Plugins → FURLS)
- Complete a full session (match must end)
- Or manually export: type `export_stats` in console (F6)
- Rebuild the plugin if you haven't yet

### Port already in use
- Edit `server/index.js` line 7: change `PORT = 3001`
- Edit `client/src/App.jsx` line 10: update `API_URL`

### Can't install dependencies
- Your Node.js might be outdated (need v20+)
- Dependencies are already installed anyway!
- Just run: `npm run dev`

## 📊 Data Format Example

```json
{
  "timestamp": "2026-01-30T20:00:00Z",
  "shots": 50,
  "goals": 25,
  "averageSpeed": 1500.5,
  "boostCollected": 500.0,
  "boostUsed": 450.0,
  "gameTime": 300.0,
  "shotHeatmap": [[...], ...],
  "goalHeatmap": [[...], ...]
}
```

## 🌟 Features Highlight

✨ **Real-time Updates** - Dashboard auto-refreshes  
✨ **Beautiful UI** - Modern dark theme with gradients  
✨ **Interactive Heatmaps** - Click zones for details  
✨ **Session History** - Track all your training  
✨ **Trend Charts** - Visualize your improvement  
✨ **Performance Metrics** - Detailed analytics  
✨ **Responsive Design** - Works on any device  
✨ **Auto Export** - No manual work needed  

## 🎬 Quick Demo

1. **Generate test data**: `npm run test-data`
2. **Start dashboard**: `npm run dev` (or run `start.bat`)
3. **Open browser**: http://localhost:5173
4. **Explore tabs**: Dashboard, Heatmap, History, Stats
5. **See it update**: Change tabs and watch the data!

## 📖 Further Reading

- **README.md** - Complete documentation
- **QUICKSTART.md** - Quick reference guide
- **SETUP_SUMMARY.md** - Technical overview

## 🎮 Next Steps

1. ✅ Generate test data: `npm run test-data`
2. ✅ Start dashboard: `npm run dev`
3. ✅ Open browser: http://localhost:5173
4. ✅ Explore the dashboard!
5. ⏭️ Rebuild the FURLS plugin
6. ⏭️ Play Rocket League!
7. ⏭️ Watch your stats appear!

---

## 🎉 You're Ready!

Your FURLS plugin now has a **professional web dashboard** for tracking all your training statistics!

**To preview it RIGHT NOW:**
```bash
cd Dashboard
npm run test-data
npm run dev
```

Then open: **http://localhost:5173**

Enjoy! 🚗⚽📊
