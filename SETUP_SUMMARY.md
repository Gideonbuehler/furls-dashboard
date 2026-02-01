# FURLS Web Dashboard - Complete Setup Summary

## 🎉 What Has Been Created

I've built a complete web-based dashboard for your FURLS BakkesMod plugin that includes:

### 1. **Backend API Server** (Node.js + Express)

- **Location**: `Dashboard/server/index.js`
- **Port**: 3001
- **Features**:
  - Watches BakkesMod data folder for file changes
  - Serves stats via REST API
  - Automatically updates when new data is exported
  - Tracks session history (last 100 sessions)
  - Computes all-time statistics

### 2. **Frontend Dashboard** (React + Vite)

- **Location**: `Dashboard/client/`
- **Port**: 5173
- **Features**:
  - 4 main tabs: Dashboard, Heatmap, History, Stats
  - Real-time data updates (every 2 seconds)
  - Beautiful dark theme with gradients
  - Responsive design (works on mobile)
  - Interactive charts with Recharts
  - Connection status indicator

### 3. **Plugin Data Export** (C++)

- **Modified**: `FURLS.cpp` and `FURLS.h`
- **Added**:
  - `ExportStatsToJSON()` function
  - Automatic export on match end
  - Console command: `export_stats`
  - JSON format with all stats and heatmap data

## 📊 Dashboard Features

### Dashboard Tab (📊)

- **Current Session Cards**:
  - Accuracy (goals/shots percentage)
  - Average Speed
  - Boost Usage
  - Session Time & Possession
- **All-Time Statistics**:
  - Total sessions, shots, goals
  - Average accuracy and speed
  - Total play time
- **Charts**:
  - Accuracy progression over sessions
  - Shots vs Goals comparison

### Heatmap Tab (🔥)

- Interactive field visualization
- Toggle between shots and goals
- Click zones for detailed stats
- Color-coded intensity
- Accuracy overlay per zone

### History Tab (📈)

- Complete session history table
- Sortable columns
- Color-coded accuracy ratings
- Summary statistics (best performances)

### Stats Tab (📋)

- Detailed current session breakdown
- Shooting statistics
- Speed & movement metrics
- Boost management
- Time and possession stats
- All-time career overview

## 🚀 How to Use

### First Time Setup:

1. Open terminal in `Dashboard` folder
2. Dependencies are already installed!

### Start the Dashboard:

```bash
# Option 1: Easy start (Windows)
start.bat

# Option 2: NPM command
npm run dev

# Option 3: Manual (two terminals)
npm run server    # Terminal 1
npm run client    # Terminal 2
```

### In Rocket League:

1. Load BakkesMod with FURLS plugin
2. Play a training/freeplay session
3. **Data exports automatically when match ends!**
4. Or use console command: `export_stats` (F6)

### View Your Stats:

1. Open browser to `http://localhost:5173`
2. Dashboard auto-refreshes every 2 seconds
3. Explore different tabs!

## 📁 File Structure

```
Dashboard/
├── start.bat                  # Easy start script
├── package.json              # Root dependencies
├── README.md                 # Full documentation
├── QUICKSTART.md            # Quick start guide
├── server/
│   └── index.js             # API server
└── client/
    ├── package.json         # Frontend dependencies
    ├── src/
    │   ├── App.jsx          # Main app component
    │   ├── App.css          # App styling
    │   ├── index.css        # Global styles
    │   └── components/
    │       ├── Dashboard.jsx        # Dashboard tab
    │       ├── Dashboard.css
    │       ├── Heatmap.jsx          # Heatmap tab
    │       ├── Heatmap.css
    │       ├── SessionHistory.jsx   # History tab
    │       ├── SessionHistory.css
    │       ├── StatsOverview.jsx    # Stats tab
    │       └── StatsOverview.css
    └── vite.config.js
```

## 🔧 Plugin Changes

### FURLS.h

- Added: `void ExportStatsToJSON();` declaration

### FURLS.cpp

- **New Function**: `ExportStatsToJSON()` (lines ~2145-2240)

  - Exports all current session stats to JSON
  - Includes full shot and goal heatmaps
  - Adds timestamp
  - Saves to: `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`

- **Modified**: `EventMatchEnded` hook (line ~178-197)

  - Now calls `ExportStatsToJSON()` automatically
  - Exports data when match ends

- **Console Command**: `export_stats` (line ~490-491)
  - Manually trigger export anytime

## 📊 Data Format

The plugin exports this JSON structure:

```json
{
  "timestamp": "2026-01-30T20:00:00Z",
  "shots": 50,
  "goals": 25,
  "averageSpeed": 1500.5,
  "speedSamples": 1000,
  "boostCollected": 500.0,
  "boostUsed": 450.0,
  "gameTime": 300.0,
  "possessionTime": 150.0,
  "teamPossessionTime": 200.0,
  "opponentPossessionTime": 100.0,
  "shotHeatmap": [[0, 1, 2, ...], ...],   // 62x50 grid
  "goalHeatmap": [[0, 0, 1, ...], ...]    // 62x50 grid
}
```

## 🎯 API Endpoints

- `GET /api/stats/current` - Current session stats
- `GET /api/stats/history` - All session history
- `GET /api/stats/alltime` - Computed all-time summary
- `GET /api/heatmap` - Shot and goal heatmap data
- `GET /api/health` - Server status check

## 🎨 Design Features

- **Dark Theme**: Professional purple-black gradient
- **Responsive**: Works on desktop, tablet, mobile
- **Animations**: Smooth transitions and hover effects
- **Color Coding**:
  - Green = Good performance (>50% accuracy)
  - Orange = Medium (30-50%)
  - Red = Needs improvement (<30%)
- **Real-time**: Auto-updates without refresh
- **Status Indicator**: Shows connection status

## 🔍 Technologies Used

### Backend:

- Node.js
- Express (API server)
- CORS (cross-origin requests)
- Chokidar (file watching)

### Frontend:

- React 19
- Vite (build tool)
- Axios (HTTP requests)
- Recharts (charts/graphs)
- CSS3 (styling)

### Plugin:

- C++ (BakkesMod plugin)
- JSON export format

## 💡 Pro Tips

1. **Dual Monitor Setup**: Keep dashboard on second monitor while playing
2. **Track Progress**: Check history tab to see improvement
3. **Optimize Shots**: Use heatmap to find your best shooting positions
4. **Manual Export**: Use `export_stats` command to save mid-session
5. **Session Analysis**: Review detailed stats after each session

## 🐛 Troubleshooting

### "Not Connected" Error

- Check that BakkesMod is running
- Play at least one complete session
- Verify file exists: `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`
- Check server console for errors

### No Data Showing

- Complete a full training session (wait for match end)
- Or manually run: `export_stats` in console (F6)
- Refresh browser page
- Check browser console (F12) for errors

### Port Conflicts

- Change port in `server/index.js` (line 7)
- Update `API_URL` in `client/src/App.jsx` (line 10)

## 🚀 Next Steps

1. **Build the Plugin**: Compile FURLS.cpp with the new changes
2. **Start Dashboard**: Run `start.bat` or `npm run dev`
3. **Play Rocket League**: Do some training!
4. **Watch Stats**: See your dashboard update in real-time

## 📦 What to Commit to Git

Recommended to commit:

- All files in `Dashboard/` folder
- Modified `FURLS.cpp` and `FURLS.h`
- Exclude: `node_modules/`, `dist/`, `.env` (already in .gitignore)

## 🎮 Future Enhancements Ideas

- Export to PDF/Excel
- Share sessions with friends
- Goal replays integration
- Training pack recommendations
- Skill rating calculation
- Mobile app version
- Leaderboards
- Session comparison tool

---

**Enjoy your new FURLS Training Dashboard!** 🚗⚽📊

If you have any questions or issues, check the README.md and QUICKSTART.md files in the Dashboard folder.
