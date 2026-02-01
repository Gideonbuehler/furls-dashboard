# FURLS Dashboard - Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Dependencies (Already Done!)

The dependencies are already installed. If you need to reinstall:

```bash
npm install
cd client && npm install
```

### Step 2: Start the Dashboard

Open a terminal in the Dashboard folder and run:

```bash
npm run dev
```

This will start:

- **Backend API**: http://localhost:3001
- **Frontend Dashboard**: http://localhost:5173 (or next available port)

### Step 3: Configure the Plugin

The FURLS plugin will now automatically export stats when a match ends. The data is saved to:

```
%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json
```

You can also manually export stats at any time using the BakkesMod console:

```
export_stats
```

### Step 4: Play Rocket League!

1. Start Rocket League with BakkesMod
2. The FURLS plugin should be loaded
3. Play a freeplay/training session
4. When the match ends, stats will be automatically exported
5. The dashboard will update automatically (refreshes every 2 seconds)

## 📊 Dashboard Features

### Dashboard Tab

- Real-time session stats (accuracy, speed, boost, possession)
- All-time statistics summary
- Trend charts showing progression

### Heatmap Tab

- Interactive field heatmap
- Toggle between shots and goals view
- Click zones for detailed statistics
- Visual accuracy overlay

### History Tab

- Complete session history table
- Performance trends
- Best session highlights

### Stats Tab

- Detailed current session breakdown
- Career statistics
- Performance metrics

## 🔧 Troubleshooting

### Dashboard shows "Not Connected"

1. Make sure BakkesMod is running
2. Check that the FURLS plugin is loaded
3. Play a session and complete it
4. Check if the file exists: `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`

### Data not updating

- The dashboard auto-refreshes every 2 seconds
- Make sure you complete a session (match end event)
- Try manually exporting: type `export_stats` in the BakkesMod console (F6)

### Port already in use

If port 3001 or 5173 is already in use:

1. Edit `server/index.js` and change `PORT = 3001` to another port
2. Edit `client/src/App.jsx` and update `API_URL` to match

## 🎮 Console Commands

In the BakkesMod console (F6):

- `export_stats` - Export current session stats to JSON
- `export_heatmap` - Export heatmap data to CSV
- `furls_reset_stats` - Reset current session stats
- `reset_alltime_heatmap` - Clear all-time heatmap data

## 📁 File Structure

```
Dashboard/
├── server/
│   └── index.js          # Backend API server
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main React app
│   │   ├── App.css       # App styles
│   │   ├── components/   # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Heatmap.jsx
│   │   │   ├── SessionHistory.jsx
│   │   │   └── StatsOverview.jsx
│   │   └── main.jsx      # React entry point
│   └── package.json
├── package.json
└── README.md
```

## 🌐 API Endpoints

- `GET /api/stats/current` - Current session stats
- `GET /api/stats/history` - Session history
- `GET /api/stats/alltime` - All-time summary
- `GET /api/heatmap` - Heatmap data
- `GET /api/health` - Server health check

## 💡 Tips

1. **Keep the dashboard open** while playing for real-time updates
2. **Use dual monitors** - dashboard on one, game on the other
3. **Export regularly** if you want to track specific sessions
4. **Check the heatmap** to identify your best shooting positions
5. **Review history** to see your improvement over time

## 🎯 Next Steps

- Play training sessions to generate data
- Explore different tabs to see various visualizations
- Track your improvement over time
- Use the heatmap to optimize your shot positions

Enjoy tracking your Rocket League training progress! 🚗⚽
