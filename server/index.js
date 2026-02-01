const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Import database and auth
require('./database'); // Initialize database
const { authenticateToken } = require('./auth');

// Import routes
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/user/stats', statsRoutes);
app.use('/api/stats', uploadRoutes); // Plugin upload endpoint
app.use('/api/public', publicRoutes); // Public profiles and search

// Path to BakkesMod data folder - adjust this to your actual BakkesMod path
const DATA_FOLDER = path.join(process.env.APPDATA || '', 'bakkesmod/bakkesmod/data');
const STATS_FILE = path.join(DATA_FOLDER, 'furls_stats.json');
const HEATMAP_FILE = path.join(DATA_FOLDER, 'furls_alltime_heatmap.dat');

// In-memory cache of stats
let cachedStats = null;
let sessionHistory = [];

// Watch for file changes
if (fs.existsSync(DATA_FOLDER)) {
  const watcher = chokidar.watch([STATS_FILE], {
    persistent: true,
    ignoreInitial: false
  });

  watcher.on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
    loadStats();
  });

  watcher.on('add', (filePath) => {
    console.log(`File added: ${filePath}`);
    loadStats();
  });
}

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf8');
      const stats = JSON.parse(data);
      
      // Add to session history
      if (stats.timestamp && !sessionHistory.some(s => s.timestamp === stats.timestamp)) {
        sessionHistory.push(stats);
        // Keep only last 100 sessions
        if (sessionHistory.length > 100) {
          sessionHistory = sessionHistory.slice(-100);
        }
      }
      
      cachedStats = stats;
      console.log('Stats loaded successfully');
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load initial stats
loadStats();

// Legacy API Endpoints (for backward compatibility with local stats file)

// Get current session stats (from file - legacy)
app.get('/api/stats/current', (req, res) => {
  if (!cachedStats) {
    return res.status(404).json({ error: 'No stats available yet' });
  }
  res.json(cachedStats);
});

// Get session history
app.get('/api/stats/history', (req, res) => {
  res.json(sessionHistory);
});

// Get all-time stats summary
app.get('/api/stats/alltime', (req, res) => {
  const summary = {
    totalSessions: sessionHistory.length,
    totalShots: sessionHistory.reduce((sum, s) => sum + (s.shots || 0), 0),
    totalGoals: sessionHistory.reduce((sum, s) => sum + (s.goals || 0), 0),
    avgAccuracy: sessionHistory.length > 0 
      ? sessionHistory.reduce((sum, s) => {
          const accuracy = s.shots > 0 ? (s.goals / s.shots) * 100 : 0;
          return sum + accuracy;
        }, 0) / sessionHistory.length
      : 0,
    avgSpeed: sessionHistory.length > 0
      ? sessionHistory.reduce((sum, s) => sum + (s.averageSpeed || 0), 0) / sessionHistory.length
      : 0,
    totalPlayTime: sessionHistory.reduce((sum, s) => sum + (s.gameTime || 0), 0)
  };
  res.json(summary);
});

// Get heatmap data
app.get('/api/heatmap', (req, res) => {
  if (cachedStats && cachedStats.shotHeatmap) {
    res.json({
      shots: cachedStats.shotHeatmap,
      goals: cachedStats.goalHeatmap || []
    });
  } else {
    res.status(404).json({ error: 'No heatmap data available' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dataFolderExists: fs.existsSync(DATA_FOLDER),
    statsFileExists: fs.existsSync(STATS_FILE),
    sessionsLoaded: sessionHistory.length
  });
});

app.listen(PORT, () => {
  console.log(`FURLS Dashboard API running on http://localhost:${PORT}`);
  console.log(`Watching data folder: ${DATA_FOLDER}`);
  console.log(`Stats file: ${STATS_FILE}`);
});
