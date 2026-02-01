# FURLS Public Platform - Migration Guide

## 🌐 Converting FURLS to a Public Platform (furls.rl)

This guide explains how to convert the current local FURLS dashboard into a public platform where anyone can look up any player's stats.

---

## 📊 Current Architecture (Local)

```
Your Computer:
- BakkesMod Plugin → Local File → Local Server → Local Database
- Only you can see your stats
- No internet connection needed
```

## 🌍 Target Architecture (Public Platform)

```
Player's Computer:
- BakkesMod Plugin → Upload to Server

FURLS.RL Server:
- Receives stats from all players
- Stores in cloud database
- Serves public website

Anyone with Internet:
- Can search for any player
- View stats, leaderboards, profiles
- Compare with friends
```

---

## 🔧 Required Changes

### 1. Plugin Upload Feature (CRITICAL)

**Current**: Plugin exports to local file
**Needed**: Plugin uploads directly to server

#### Option A: Add HTTP POST to Plugin

```cpp
// In FURLS.cpp - Add after ExportStatsToJSON()
void FURLS::UploadStatsToServer() {
    if (!enableServerUpload) return; // Make it optional

    std::string serverUrl = "https://furls.rl/api/stats/upload";
    std::string apiKey = GetUserApiKey(); // From config file
    std::string jsonData = GenerateStatsJSON();

    // Use curl or WinHTTP to POST data
    CURL *curl = curl_easy_init();
    if (curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, ("Authorization: Bearer " + apiKey).c_str());

        curl_easy_setopt(curl, CURLOPT_URL, serverUrl.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonData.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        CURLcode res = curl_easy_perform(curl);
        if (res == CURLE_OK) {
            cvarManager->log("[FURLS] Stats uploaded successfully!");
        } else {
            cvarManager->log("[FURLS] Upload failed: " + std::string(curl_easy_strerror(res)));
        }

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }
}

// Call this after ExportStatsToJSON()
void FURLS::OnMatchEnd() {
    ExportStatsToJSON();      // Keep local backup
    UploadStatsToServer();    // NEW: Upload to furls.rl
}
```

#### Option B: Desktop Companion App (Easier)

```javascript
// Create: furls-uploader.exe (Electron app)
// Runs in system tray, watches for file changes

const chokidar = require("chokidar");
const axios = require("axios");
const fs = require("fs");

const STATS_FILE = path.join(
  process.env.APPDATA,
  "bakkesmod/bakkesmod/data/furls_stats.json"
);

// Watch for changes
chokidar.watch(STATS_FILE).on("change", async () => {
  const stats = JSON.parse(fs.readFileSync(STATS_FILE));
  const apiKey = getStoredApiKey(); // From user settings

  try {
    await axios.post("https://furls.rl/api/stats/upload", stats, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    showNotification("Stats uploaded successfully!");
  } catch (err) {
    showNotification("Upload failed", "error");
  }
});
```

### 2. Server Changes

#### 2.1 Database Migration

```sql
-- Current: SQLite (server/furls.db)
-- Needed: PostgreSQL or MySQL

-- Migration script: migrate_to_postgres.sql
CREATE DATABASE furls_production;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL, -- NEW: For plugin uploads
    profile_visibility VARCHAR(20) DEFAULT 'public', -- NEW
    avatar_url VARCHAR(500),
    total_sessions INTEGER DEFAULT 0,
    total_shots INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_api_key ON users(api_key);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    shots INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    average_speed FLOAT DEFAULT 0,
    speed_samples INTEGER DEFAULT 0,
    boost_collected FLOAT DEFAULT 0,
    boost_used FLOAT DEFAULT 0,
    game_time FLOAT DEFAULT 0,
    possession_time FLOAT DEFAULT 0,
    team_possession_time FLOAT DEFAULT 0,
    opponent_possession_time FLOAT DEFAULT 0,
    shot_heatmap JSONB, -- PostgreSQL JSON type
    goal_heatmap JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_timestamp ON sessions(timestamp);

-- Add more indexes for leaderboard queries
CREATE INDEX idx_users_total_shots ON users(total_shots DESC);
CREATE INDEX idx_users_total_goals ON users(total_goals DESC);
```

#### 2.2 New API Endpoints

```javascript
// server/routes/public.js (NEW FILE)
const express = require("express");
const router = express.Router();

// Public profile page
router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;

  const user = await db.get(
    `SELECT username, avatar_url, total_shots, total_goals, 
            total_sessions, created_at, profile_visibility
     FROM users 
     WHERE username = $1`,
    [username]
  );

  if (!user) {
    return res.status(404).json({ error: "Player not found" });
  }

  if (user.profile_visibility === "private") {
    return res.status(403).json({ error: "Profile is private" });
  }

  // Get recent sessions (if public)
  const sessions = await db.all(
    `SELECT timestamp, shots, goals, average_speed 
     FROM sessions 
     WHERE user_id = (SELECT id FROM users WHERE username = $1)
     ORDER BY timestamp DESC 
     LIMIT 20`,
    [username]
  );

  res.json({ user, sessions });
});

// Search players
router.get("/search", async (req, res) => {
  const { q } = req.query;

  const players = await db.all(
    `SELECT username, avatar_url, total_shots, total_goals
     FROM users
     WHERE username ILIKE $1 
     AND profile_visibility = 'public'
     LIMIT 20`,
    [`%${q}%`]
  );

  res.json(players);
});

// Global leaderboard
router.get("/leaderboard/:stat", async (req, res) => {
  const { stat } = req.params; // 'shots', 'goals', 'accuracy'
  const { limit = 100, offset = 0 } = req.query;

  let orderBy = "total_shots";
  if (stat === "goals") orderBy = "total_goals";
  if (stat === "accuracy")
    orderBy = "(total_goals::float / NULLIF(total_shots, 0))";

  const players = await db.all(
    `SELECT username, avatar_url, total_shots, total_goals,
            (total_goals::float / NULLIF(total_shots, 0) * 100) as accuracy
     FROM users
     WHERE profile_visibility = 'public'
     AND total_shots > 0
     ORDER BY ${orderBy} DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.json(players);
});

module.exports = router;
```

#### 2.3 Upload Endpoint (Protected)

```javascript
// server/routes/upload.js (NEW FILE)
const express = require("express");
const router = express.Router();
const { authenticateApiKey } = require("../auth");

// Middleware to verify API key from plugin
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const user = await db.get(
    "SELECT id, username FROM users WHERE api_key = $1",
    [apiKey]
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.user = user;
  next();
};

// Upload stats from plugin
router.post("/upload", authenticateApiKey, async (req, res) => {
  const stats = req.body;
  const userId = req.user.id;

  try {
    // Save session
    await db.run(
      `INSERT INTO sessions (
        user_id, timestamp, shots, goals, average_speed,
        speed_samples, boost_collected, boost_used, game_time,
        possession_time, team_possession_time, opponent_possession_time,
        shot_heatmap, goal_heatmap
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        userId,
        stats.timestamp,
        stats.shots,
        stats.goals,
        stats.averageSpeed,
        stats.speedSamples,
        stats.boostCollected,
        stats.boostUsed,
        stats.gameTime,
        stats.possessionTime,
        stats.teamPossessionTime,
        stats.opponentPossessionTime,
        JSON.stringify(stats.shotHeatmap),
        JSON.stringify(stats.goalHeatmap),
      ]
    );

    // Update user totals
    await db.run(
      `UPDATE users 
       SET total_sessions = total_sessions + 1,
           total_shots = total_shots + $1,
           total_goals = total_goals + $2,
           last_active = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [stats.shots, stats.goals, userId]
    );

    res.json({ success: true, message: "Stats uploaded successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to save stats" });
  }
});

module.exports = router;
```

### 3. Frontend Changes

#### 3.1 Add Player Search Page

```javascript
// client/src/components/PlayerSearch.jsx
import { useState } from "react";
import axios from "axios";

function PlayerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await axios.get(`/api/public/search?q=${query}`);
    setResults(res.data);
  };

  return (
    <div className="player-search">
      <h2>🔍 Search Players</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search by username..."
      />
      <button onClick={handleSearch}>Search</button>

      <div className="search-results">
        {results.map((player) => (
          <div key={player.username} className="player-card">
            <img src={player.avatar_url || "/default-avatar.png"} />
            <h3>{player.username}</h3>
            <p>
              Shots: {player.total_shots} | Goals: {player.total_goals}
            </p>
            <a href={`/profile/${player.username}`}>View Profile →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3.2 Add Public Profile Page

```javascript
// client/src/components/PublicProfile.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/public/profile/${username}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err));
  }, [username]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="public-profile">
      <div className="profile-header">
        <img src={profile.user.avatar_url || "/default-avatar.png"} />
        <h1>{profile.user.username}</h1>
        <p>
          Member since {new Date(profile.user.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <h3>{profile.user.total_sessions}</h3>
          <p>Sessions</p>
        </div>
        <div className="stat-box">
          <h3>{profile.user.total_shots}</h3>
          <p>Total Shots</p>
        </div>
        <div className="stat-box">
          <h3>{profile.user.total_goals}</h3>
          <p>Total Goals</p>
        </div>
        <div className="stat-box">
          <h3>
            {(
              (profile.user.total_goals / profile.user.total_shots) *
              100
            ).toFixed(1)}
            %
          </h3>
          <p>Accuracy</p>
        </div>
      </div>

      <div className="recent-sessions">
        <h2>Recent Sessions</h2>
        {profile.sessions.map((session) => (
          <div key={session.timestamp} className="session-card">
            <span>{new Date(session.timestamp).toLocaleString()}</span>
            <span>
              {session.shots} shots, {session.goals} goals
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Hosting Requirements

#### 4.1 Cloud Infrastructure

```yaml
# Example: AWS/DigitalOcean setup

Services Needed:
  - Web Server: EC2/Droplet (Node.js app)
  - Database: RDS PostgreSQL or managed PostgreSQL
  - Storage: S3 for avatars/static files
  - CDN: CloudFront for fast delivery
  - Domain: furls.rl (register domain)
  - SSL: Let's Encrypt (free HTTPS)

Estimated Cost:
  - Server: $10-50/month (depending on traffic)
  - Database: $15-50/month
  - Storage: $1-5/month
  - Domain: $10-50/year
  Total: ~$35-100/month
```

#### 4.2 Deployment Script

```bash
# deploy.sh
#!/bin/bash

echo "Deploying FURLS to production..."

# Build frontend
cd client
npm run build

# Copy build to server
scp -r dist/* user@furls.rl:/var/www/furls/

# Restart backend
ssh user@furls.rl "cd /var/www/furls && pm2 restart furls-backend"

echo "Deployment complete!"
```

### 5. Security Considerations

```javascript
// server/middleware/security.js

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Rate limiting (prevent spam)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes
});

// API key rate limiting (for plugin uploads)
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 uploads per minute per user
});

// Security headers
app.use(helmet());

// CORS (allow specific domains)
app.use(
  cors({
    origin: ["https://furls.rl", "https://www.furls.rl"],
    credentials: true,
  })
);

// Input validation
const { body, validationResult } = require("express-validator");

app.post(
  "/api/stats/upload",
  [
    body("shots").isInt({ min: 0, max: 10000 }),
    body("goals").isInt({ min: 0, max: 10000 }),
    body("timestamp").isISO8601(),
    // ... more validations
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... handle upload
  }
);
```

### 6. Privacy Features

```javascript
// server/routes/settings.js

// User can control privacy
router.put("/settings/privacy", authenticateToken, async (req, res) => {
  const { profile_visibility, show_sessions } = req.body;

  await db.run(
    `UPDATE user_settings 
     SET profile_visibility = $1, show_sessions_publicly = $2 
     WHERE user_id = $3`,
    [profile_visibility, show_sessions, req.user.id]
  );

  res.json({ success: true });
});
```

---

## 📋 Migration Checklist

### Phase 1: Foundation

- [ ] Set up cloud server (AWS/DigitalOcean)
- [ ] Register domain (furls.rl)
- [ ] Set up PostgreSQL database
- [ ] Configure SSL certificate
- [ ] Deploy basic backend

### Phase 2: Upload System

- [ ] Add API key generation to user accounts
- [ ] Create upload endpoint
- [ ] Build companion uploader app OR
- [ ] Modify plugin to upload directly
- [ ] Test upload system

### Phase 3: Public Features

- [ ] Add public profile pages
- [ ] Add player search
- [ ] Add global leaderboards
- [ ] Add privacy settings
- [ ] Add avatar upload

### Phase 4: Polish

- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add error logging
- [ ] Create documentation
- [ ] Add user onboarding

### Phase 5: Launch

- [ ] Beta testing with small group
- [ ] Fix bugs
- [ ] Public announcement
- [ ] Monitor performance

---

## 🎯 Summary

**Yes, you can host this as furls.rl and let anyone look up players!**

**Key requirements:**

1. **Upload System**: Users need a way to send their stats to the server
2. **Public Endpoints**: Anyone can view profiles and leaderboards
3. **Privacy Controls**: Users can choose what's public
4. **Cloud Hosting**: Server + Database + Domain
5. **Security**: Rate limiting, validation, authentication

**Estimated Effort:**

- Plugin modification: 1-2 weeks
- Server changes: 2-3 weeks
- Frontend updates: 1-2 weeks
- Testing & deployment: 1-2 weeks
- **Total: 1.5-2 months** (full-time)

**Cost:**

- Hosting: $35-100/month
- Domain: $10-50/year
- Development time: (your time or hire developer)

Would you like me to start implementing any of these changes?
