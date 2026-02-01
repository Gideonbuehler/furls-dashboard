# FURLS Training Dashboard

A modern web-based dashboard for visualizing your Rocket League training statistics from the FURLS BakkesMod plugin.

## Features

- 📊 **Real-time Stats Dashboard** - View current session statistics including accuracy, speed, boost usage, and more
- 🔥 **Interactive Heatmaps** - Visualize where you shoot from and score goals with color-coded heat maps
- 📈 **Session History** - Track your progress across multiple training sessions
- 📋 **Detailed Statistics** - Comprehensive breakdown of all tracked metrics
- 🎯 **Live Updates** - Automatically refreshes to show the latest data from your training

## Setup

### Prerequisites

- Node.js (version 20+ recommended)
- The FURLS BakkesMod plugin installed and running
- Rocket League with BakkesMod

### Installation

1. **Install dependencies:**

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

2. **Configure data path:**

The server will automatically watch your BakkesMod data folder at:
`%APPDATA%\bakkesmod\bakkesmod\data`

If your BakkesMod installation is in a different location, edit `server/index.js` and update the `DATA_FOLDER` constant.

### Running the Dashboard

1. **Start both server and client:**

```bash
npm run dev
```

This will start:

- Backend API server on `http://localhost:3001`
- Frontend React app on `http://localhost:5173` (or next available port)

2. **Access the dashboard:**

Open your browser to `http://localhost:5173`

### Alternative: Run separately

```bash
# Terminal 1 - Start the API server
npm run server

# Terminal 2 - Start the React frontend
npm run client
```

## How It Works

1. The FURLS plugin tracks your training statistics in Rocket League
2. The plugin exports data to JSON files in the BakkesMod data folder
3. The Node.js server watches for file changes and serves the data via API
4. The React frontend fetches and visualizes the data in real-time

## Dashboard Sections

### 📊 Dashboard

- Current session overview with key metrics
- All-time statistics summary
- Accuracy and performance trend charts

### 🔥 Heatmap

- Interactive field heatmap showing shot locations
- Toggle between shots and goals visualization
- Click zones to see detailed statistics for specific areas

### 📈 History

- Complete session history table
- Performance trends over time
- Best session highlights

### 📋 Stats

- Detailed breakdown of current session
- All-time career statistics
- Comprehensive performance metrics

## Data Export from Plugin

The FURLS plugin needs to export data in the following format:

**File:** `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`

```json
{
  "timestamp": "2026-01-30T12:00:00Z",
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
  "shotHeatmap": [[0, 1, 2, ...], ...],
  "goalHeatmap": [[0, 0, 1, ...], ...]
}
```

## Troubleshooting

### Dashboard shows "Not Connected"

- Make sure the FURLS plugin is running and has exported data
- Check that the data file exists at `%APPDATA%\bakkesmod\bakkesmod\data\furls_stats.json`
- Verify the server is running on port 3001

### No data appears

- Complete at least one training session with the plugin active
- The plugin will export data when a match ends
- Check the browser console and server logs for errors

### Port already in use

- Change the port in `server/index.js` (default: 3001)
- Update the API_URL in `client/src/App.jsx` to match

## Building for Production

```bash
# Build the React frontend
npm run build

# Serve with Node.js
npm start
```

## Technologies Used

- **Frontend:** React, Recharts, Axios
- **Backend:** Node.js, Express, Chokidar
- **Styling:** CSS3 with modern gradients and animations
- **Build Tool:** Vite

## License

MIT

## Credits

Created for the FURLS (Freeplay Ultimate Rocket League Stats) BakkesMod plugin.
