const express = require("express");
const router = express.Router();
const { dbAsync } = require("../database");
const crypto = require("crypto");

// Middleware to verify API key from plugin
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!apiKey) {
    console.log(`[AUTH FAILED] No API key provided from IP: ${clientIp}`);
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const user = await dbAsync.get(
      "SELECT id, username FROM users WHERE api_key = ?",
      [apiKey]
    );

    if (!user) {
      console.log(
        `[AUTH FAILED] Invalid API key from IP: ${clientIp}, Key prefix: ${apiKey.substring(
          0,
          8
        )}...`
      );
      return res.status(401).json({ error: "Invalid API key" });
    }

    console.log(
      `[AUTH SUCCESS] User: ${user.username} (ID: ${user.id}) from IP: ${clientIp}`
    );
    req.user = user;
    next();
  } catch (err) {
    console.error(`[AUTH ERROR] Exception for IP: ${clientIp}`, err);
    return res.status(401).json({ error: "Invalid API key" });
  }
};

// Downsample a large heatmap grid (e.g. 50x62) to a 10x10 grid for the dashboard
function downsampleGrid(grid, targetWidth = 10, targetHeight = 10, scaleFactor = 1) {
  if (!grid || !Array.isArray(grid) || grid.length === 0) return null;

  const srcHeight = grid.length;
  const srcWidth = grid[0].length;

  // If already 10x10, just apply scale factor
  if (srcHeight === targetHeight && srcWidth === targetWidth) {
    if (scaleFactor === 1) return grid;
    return grid.map(row => row.map(v => Math.round((v || 0) / scaleFactor)));
  }

  const result = Array.from({ length: targetHeight }, () => Array(targetWidth).fill(0));
  const yRatio = srcHeight / targetHeight;
  const xRatio = srcWidth / targetWidth;

  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      let sum = 0;
      const yStart = Math.floor(ty * yRatio);
      const yEnd = Math.floor((ty + 1) * yRatio);
      const xStart = Math.floor(tx * xRatio);
      const xEnd = Math.floor((tx + 1) * xRatio);

      for (let sy = yStart; sy < yEnd; sy++) {
        for (let sx = xStart; sx < xEnd; sx++) {
          if (grid[sy] && grid[sy][sx] != null) {
            sum += grid[sy][sx];
          }
        }
      }
      result[ty][tx] = Math.round(sum / scaleFactor);
    }
  }
  return result;
}

// Upload stats from plugin
router.post("/upload", authenticateApiKey, async (req, res) => {
  const stats = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  // Flexible field name support for playlist/MMR
  const playlist = stats.playlist || stats.playlistName || stats.playlist_name || null;
  const isRanked = stats.isRanked || stats.is_ranked || stats.ranked || false;
  // Use explicit null checks — 0 is a valid MMR/mmrChange value!
  const rawMmr = stats.mmr ?? stats.currentMMR ?? stats.current_mmr ?? null;
  const rawMmrChange = stats.mmrChange ?? stats.mmr_change ?? stats.mmrDelta ?? null;
  const mmr = rawMmr !== null && rawMmr !== undefined ? parseFloat(rawMmr) : null;
  const mmrChange = rawMmrChange !== null && rawMmrChange !== undefined ? parseFloat(rawMmrChange) : null;

  console.log(
    `[UPLOAD START] User: ${username}, Shots: ${stats.shots}, Goals: ${stats.goals}, GameTime: ${stats.gameTime}s`
  );
  console.log(
    `[UPLOAD META] Playlist: ${playlist}, Ranked: ${isRanked}, MMR: ${mmr}, MMR Change: ${mmrChange}`
  );

  try {
    // Validate required fields
    if (stats.shots === undefined || stats.goals === undefined) {
      console.log(`[UPLOAD FAILED] Missing required fields from ${username}`);
      return res
        .status(400)
        .json({ error: "Missing required fields: shots and goals" });
    }

    // Process heatmap data — downsample from plugin's 50x62 grid to dashboard's 10x10
    // Plugin sends shotHeatmap values as multiples of 5 (5.0 per shot), so divide by 5
    let shotHeatmap = stats.shotHeatmap || stats.shotGrid || [];
    let goalHeatmap = stats.goalHeatmap || stats.goalGrid || [];

    if (Array.isArray(shotHeatmap) && shotHeatmap.length > 10) {
      // Plugin sends 50x62 grid with values as multiples of 5
      console.log(`[UPLOAD HEATMAP] Downsampling shot heatmap from ${shotHeatmap.length}x${shotHeatmap[0]?.length || 0} to 10x10`);
      shotHeatmap = downsampleGrid(shotHeatmap, 10, 10, 5);
    }
    if (Array.isArray(goalHeatmap) && goalHeatmap.length > 10) {
      console.log(`[UPLOAD HEATMAP] Downsampling goal heatmap from ${goalHeatmap.length}x${goalHeatmap[0]?.length || 0} to 10x10`);
      goalHeatmap = downsampleGrid(goalHeatmap, 10, 10, 1);
    }

    // Save session
    const result = await dbAsync.run(
      `INSERT INTO sessions (
        user_id, timestamp, shots, goals, average_speed,
        speed_samples, boost_collected, boost_used, game_time,
        possession_time, team_possession_time, opponent_possession_time,
        shot_heatmap, goal_heatmap, playlist, is_ranked, mmr, mmr_change
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        stats.timestamp || new Date().toISOString(),
        stats.shots || 0,
        stats.goals || 0,
        stats.averageSpeed || 0,
        stats.speedSamples || 0,
        stats.boostCollected || 0,
        stats.boostUsed || 0,
        stats.gameTime || 0,
        stats.possessionTime || 0,
        stats.teamPossessionTime || 0,
        stats.opponentPossessionTime || 0,
        JSON.stringify(shotHeatmap),
        JSON.stringify(goalHeatmap),
        playlist,
        isRanked ? 1 : 0,
        mmr,
        mmrChange,
      ]
    );

    // Update user totals AND last_active timestamp (plugin connection indicator)
    await dbAsync.run(
      `UPDATE users 
       SET total_sessions = total_sessions + 1,
           total_shots = total_shots + ?,
           total_goals = total_goals + ?,
           last_active = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [stats.shots || 0, stats.goals || 0, userId]
    );

    console.log(
      `[UPLOAD SUCCESS] User: ${username} (ID: ${userId}) - Session #${result.lastID} - ${stats.shots} shots, ${stats.goals} goals, Playlist: ${playlist}, MMR: ${mmr} (${mmrChange >= 0 ? '+' : ''}${mmrChange})`
    );
    res.json({
      success: true,
      message: "Stats uploaded successfully",
      sessionId: result.lastID,
    });
  } catch (err) {
    console.error(`[UPLOAD ERROR] User: ${username} (ID: ${userId})`, err);
    res.status(500).json({ error: "Failed to save stats" });
  }
});

// Check plugin connection status (when was the last upload)
router.get("/plugin-status", authenticateApiKey, async (req, res) => {
  try {
    const user = await dbAsync.get(
      "SELECT last_active FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!user || !user.last_active) {
      return res.json({
        connected: false,
        lastUpload: null,
        message: "No data uploaded yet from plugin",
      });
    }

    const lastUpload = new Date(user.last_active);
    const now = new Date();
    const diffMinutes = (now - lastUpload) / (1000 * 60);

    // Consider connected if upload within last 5 minutes
    const connected = diffMinutes < 5;

    res.json({
      connected,
      lastUpload: user.last_active,
      minutesSinceUpload: Math.floor(diffMinutes),
      message: connected
        ? "Plugin connected and active"
        : `Last upload was ${Math.floor(diffMinutes)} minutes ago`,
    });
  } catch (err) {
    console.error("Error checking plugin status:", err);
    res.status(500).json({ error: "Failed to check plugin status" });
  }
});

// Test API key authentication (for troubleshooting)
router.get("/test-auth", authenticateApiKey, async (req, res) => {
  console.log(
    `[AUTH TEST] User: ${req.user.username} (ID: ${req.user.id}) - API key is valid!`
  );
  res.json({
    success: true,
    message: "API key is valid!",
    username: req.user.username,
    userId: req.user.id,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
