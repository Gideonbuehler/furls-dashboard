const express = require("express");
const router = express.Router();
const { dbAsync } = require("../database");
const crypto = require("crypto");

// Middleware to verify API key from plugin
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const user = await dbAsync.get(
      "SELECT id, username FROM users WHERE api_key = ?",
      [apiKey]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("API key authentication error:", err);
    return res.status(401).json({ error: "Invalid API key" });
  }
};

// Upload stats from plugin
router.post("/upload", authenticateApiKey, async (req, res) => {
  const stats = req.body;
  const userId = req.user.id;

  try {
    // Save session
    await dbAsync.run(
      `INSERT INTO sessions (
        user_id, timestamp, shots, goals, average_speed,
        speed_samples, boost_collected, boost_used, game_time,
        possession_time, team_possession_time, opponent_possession_time,
        shot_heatmap, goal_heatmap
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        stats.timestamp,
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
      `[UPLOAD SUCCESS] User ${req.user.username} - ${stats.shots} shots, ${stats.goals} goals`
    );
    res.json({ success: true, message: "Stats uploaded successfully" });
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
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

module.exports = router;
