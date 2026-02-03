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

// Upload stats from plugin
router.post("/upload", authenticateApiKey, async (req, res) => {
  const stats = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  console.log(
    `[UPLOAD START] User: ${username}, Shots: ${stats.shots}, Goals: ${stats.goals}, GameTime: ${stats.gameTime}s`
  );

  try {
    // Validate required fields
    if (stats.shots === undefined || stats.goals === undefined) {
      console.log(`[UPLOAD FAILED] Missing required fields from ${username}`);
      return res
        .status(400)
        .json({ error: "Missing required fields: shots and goals" });
    }    // Save session
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
        JSON.stringify(stats.shotHeatmap || []),
        JSON.stringify(stats.goalHeatmap || []),
        stats.playlist || null,
        stats.isRanked ? 1 : 0,
        stats.mmr || null,
        stats.mmrChange || null,
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
      `[UPLOAD SUCCESS] User: ${username} (ID: ${userId}) - Session #${result.lastID} - ${stats.shots} shots, ${stats.goals} goals`
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
