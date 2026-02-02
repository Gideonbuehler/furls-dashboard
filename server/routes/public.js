const express = require("express");
const router = express.Router();
const { dbAsync } = require("../database");

// Public profile page
router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;

  try {
    console.log(`[PUBLIC PROFILE] Fetching profile for: ${username}`);
    
    // First, check if user exists with minimal query
    const userCheck = await dbAsync.get(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );

    if (!userCheck) {
      console.log(`[PUBLIC PROFILE] User not found: ${username}`);
      return res.status(404).json({ error: "Player not found" });
    }

    // Now get full user data
    const user = await dbAsync.get(
      `SELECT id, username, display_name, avatar_url, bio, 
              total_shots, total_goals, total_sessions, 
              created_at, profile_visibility, last_active
       FROM users 
       WHERE id = ?`,
      [userCheck.id]
    );

    console.log(`[PUBLIC PROFILE] User found: ${user.username}, visibility: ${user.profile_visibility || 'null'}`);

    if (user.profile_visibility === "private") {
      return res.status(403).json({ error: "Profile is private" });
    }

    // Calculate accuracy
    const accuracy = user.total_shots > 0 
      ? ((user.total_goals / user.total_shots) * 100).toFixed(1)
      : 0;

    console.log(`[PUBLIC PROFILE] Fetching sessions for user ID: ${user.id}`);

    // Get recent sessions (if public)
    const sessions = await dbAsync.all(
      `SELECT id, timestamp, shots, goals, average_speed, game_time
       FROM sessions 
       WHERE user_id = ?
       ORDER BY timestamp DESC 
       LIMIT 20`,
      [user.id]
    );

    console.log(`[PUBLIC PROFILE] Found ${sessions ? sessions.length : 0} sessions for ${username}`);

    res.json({ 
      user: {
        ...user,
        accuracy: parseFloat(accuracy)
      }, 
      sessions: sessions || [] 
    });
  } catch (error) {
    console.error(`[PUBLIC PROFILE ERROR] User: ${username}`);
    console.error(`[PUBLIC PROFILE ERROR] Message:`, error.message);
    console.error(`[PUBLIC PROFILE ERROR] Stack:`, error.stack);
    res.status(500).json({ 
      error: "Failed to load profile", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Public stats endpoint
router.get("/stats/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await dbAsync.get(
      `SELECT id, profile_visibility FROM users WHERE username = ?`,
      [username]
    );

    if (!user) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (user.profile_visibility === "private") {
      return res.status(403).json({ error: "Stats are private" });
    }

    // Get all-time stats
    const stats = await dbAsync.get(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(shots) as total_shots,
        SUM(goals) as total_goals,
        AVG(CASE WHEN shots > 0 THEN (goals * 1.0 / shots) * 100 ELSE 0 END) as avg_accuracy,
        AVG(average_speed) as avg_speed,
        SUM(game_time) as total_play_time
      FROM sessions
      WHERE user_id = ?`,
      [user.id]
    );

    res.json(stats || {});
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// Search players
router.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    const players = await dbAsync.all(
      `SELECT username, avatar_url, total_shots, total_goals
       FROM users
       WHERE username LIKE ? 
       AND (profile_visibility = 'public' OR profile_visibility IS NULL)
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json(players || []);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Global leaderboard
router.get("/leaderboard/:stat", async (req, res) => {
  const { stat } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  console.log(`[PUBLIC LEADERBOARD] Stat: ${stat}, Limit: ${limit}, Offset: ${offset}`);

  let orderBy = "total_shots DESC";
  if (stat === "goals") orderBy = "total_goals DESC";
  if (stat === "accuracy")
    orderBy = "(CAST(total_goals AS FLOAT) / NULLIF(total_shots, 0)) DESC";
  if (stat === "sessions") orderBy = "total_sessions DESC";
  const query = `
    SELECT id, username, display_name, avatar_url, total_shots, total_goals, total_sessions,
           ROUND((CAST(total_goals AS FLOAT) / NULLIF(total_shots, 0) * 100), 2) as accuracy
    FROM users
    WHERE (profile_visibility = 'public' OR profile_visibility IS NULL)
    AND total_shots > 0
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  try {
    console.log(`[PUBLIC LEADERBOARD] Executing query...`);
    const players = await dbAsync.all(query, [
      parseInt(limit),
      parseInt(offset),
    ]);

    console.log(`[PUBLIC LEADERBOARD] Found ${players.length} players`);
    res.json(players || []);
  } catch (error) {
    console.error("[PUBLIC LEADERBOARD ERROR]", error.message);
    console.error("[PUBLIC LEADERBOARD ERROR STACK]", error.stack);
    res.status(500).json({ 
      error: "Failed to load leaderboard",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
