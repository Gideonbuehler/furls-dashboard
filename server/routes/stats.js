const express = require("express");
const { dbAsync } = require("../database");
const { authenticateToken, optionalAuth } = require("../auth");

const router = express.Router();

// Save current session stats to database (authenticated)
router.post("/save", authenticateToken, async (req, res) => {
  const statsData = req.body;

  try {
    const result = await dbAsync.run(
      `
      INSERT INTO sessions (
        user_id, timestamp, shots, goals, average_speed, speed_samples,
        boost_collected, boost_used, game_time, possession_time,
        team_possession_time, opponent_possession_time,
        shot_heatmap, goal_heatmap
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        req.user.userId,
        statsData.timestamp || new Date().toISOString(),
        statsData.shots || 0,
        statsData.goals || 0,
        statsData.averageSpeed || 0,
        statsData.speedSamples || 0,
        statsData.boostCollected || 0,
        statsData.boostUsed || 0,
        statsData.gameTime || 0,
        statsData.possessionTime || 0,
        statsData.teamPossessionTime || 0,
        statsData.opponentPossessionTime || 0,
        JSON.stringify(statsData.shotHeatmap || []),
        JSON.stringify(statsData.goalHeatmap || []),
      ]
    );

    res.status(201).json({
      message: "Session saved successfully",
      sessionId: result.id,
    });
  } catch (error) {
    console.error("Save session error:", error);
    res.status(500).json({ error: "Failed to save session" });
  }
});

// Get user's session history
router.get("/history", authenticateToken, async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  try {
    const sessions = await dbAsync.all(
      `
      SELECT 
        id, timestamp, shots, goals, average_speed, speed_samples,
        boost_collected, boost_used, game_time, possession_time,
        team_possession_time, opponent_possession_time,
        created_at
      FROM sessions
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `,
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );

    res.json(sessions);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to get history" });
  }
});

// Get user's all-time stats
router.get("/alltime", authenticateToken, async (req, res) => {
  try {
    const stats = await dbAsync.get(
      `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(shots) as total_shots,
        SUM(goals) as total_goals,
        AVG(CASE WHEN shots > 0 THEN (goals * 1.0 / shots) * 100 ELSE 0 END) as avg_accuracy,
        AVG(average_speed) as avg_speed,
        SUM(game_time) as total_play_time,
        SUM(boost_collected) as total_boost_collected,
        SUM(boost_used) as total_boost_used
      FROM sessions
      WHERE user_id = ?
    `,
      [req.user.userId]
    );

    res.json(
      stats || {
        total_sessions: 0,
        total_shots: 0,
        total_goals: 0,
        avg_accuracy: 0,
        avg_speed: 0,
        total_play_time: 0,
        total_boost_collected: 0,
        total_boost_used: 0,
      }
    );
  } catch (error) {
    console.error("Get all-time stats error:", error);
    res.status(500).json({ error: "Failed to get all-time stats" });
  }
});

// Check plugin connection status (JWT authenticated version for dashboard)
router.get("/plugin-status", authenticateToken, async (req, res) => {
  try {
    const user = await dbAsync.get(
      "SELECT last_active FROM users WHERE id = ?",
      [req.user.userId]
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

// Get specific session with heatmaps
router.get("/session/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const session = await dbAsync.get(
      `
      SELECT * FROM sessions WHERE id = ? AND user_id = ?
    `,
      [id, req.user.userId]
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Parse JSON heatmap data
    session.shotHeatmap = JSON.parse(session.shot_heatmap || "[]");
    session.goalHeatmap = JSON.parse(session.goal_heatmap || "[]");
    delete session.shot_heatmap;
    delete session.goal_heatmap;

    res.json(session);
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Get friend's stats (if privacy allows)
router.get("/friend/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params;

  try {
    // Check if they are friends
    const friendship = await dbAsync.get(
      `
      SELECT id FROM friendships
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
      AND status = 'accepted'
    `,
      [req.user.userId, friendId, friendId, req.user.userId]
    );

    if (!friendship) {
      return res.status(403).json({ error: "Not friends with this user" });
    }

    // Check friend's privacy settings
    const settings = await dbAsync.get(
      "SELECT privacy_stats FROM user_settings WHERE user_id = ?",
      [friendId]
    );

    if (settings && settings.privacy_stats === "private") {
      return res.status(403).json({ error: "User stats are private" });
    }

    // Get friend's stats
    const stats = await dbAsync.get(
      `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(shots) as total_shots,
        SUM(goals) as total_goals,
        AVG(CASE WHEN shots > 0 THEN (goals * 1.0 / shots) * 100 ELSE 0 END) as avg_accuracy,
        AVG(average_speed) as avg_speed,
        SUM(game_time) as total_play_time
      FROM sessions
      WHERE user_id = ?
    `,
      [friendId]
    );

    // Get friend's recent sessions
    const recentSessions = await dbAsync.all(
      `
      SELECT 
        id, timestamp, shots, goals, average_speed, game_time
      FROM sessions
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT 10
    `,
      [friendId]
    );

    res.json({
      stats: stats || {},
      recentSessions,
    });
  } catch (error) {
    console.error("Get friend stats error:", error);
    res.status(500).json({ error: "Failed to get friend stats" });
  }
});

// Get leaderboard (friends only or global)
router.get("/leaderboard", authenticateToken, async (req, res) => {
  const { type = "friends", stat = "accuracy" } = req.query;

  try {
    console.log(`[LEADERBOARD] Type: ${type}, Stat: ${stat}, User: ${req.user.userId}`);
    
    let query;
    let params = [];

    if (type === "friends") {
      // Get stats for user and their friends
      query = `
        SELECT 
          u.id, u.username, u.display_name, u.avatar_url,
          u.total_sessions,
          u.total_shots,
          u.total_goals,
          ROUND((CAST(u.total_goals AS FLOAT) / NULLIF(u.total_shots, 0) * 100), 2) as accuracy,
          ROUND((CAST(u.total_goals AS FLOAT) / NULLIF(u.total_shots, 0) * 100), 2) as avg_accuracy
        FROM users u
        WHERE (u.id = ? OR u.id IN (
          SELECT CASE 
            WHEN user_id = ? THEN friend_id
            WHEN friend_id = ? THEN user_id
          END
          FROM friendships
          WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
        ))
        AND u.total_shots > 0
      `;
      params = [
        req.user.userId,
        req.user.userId,
        req.user.userId,
        req.user.userId,
        req.user.userId,
      ];
    } else {
      // Global leaderboard - use users table directly
      query = `
        SELECT 
          u.id, u.username, u.display_name, u.avatar_url,
          u.total_sessions,
          u.total_shots,
          u.total_goals,
          ROUND((CAST(u.total_goals AS FLOAT) / NULLIF(u.total_shots, 0) * 100), 2) as accuracy,
          ROUND((CAST(u.total_goals AS FLOAT) / NULLIF(u.total_shots, 0) * 100), 2) as avg_accuracy
        FROM users u
        WHERE (u.profile_visibility = 'public' OR u.profile_visibility IS NULL)
        AND u.total_shots > 0
      `;
    }

    // Add ordering based on stat type
    const orderBy =
      stat === "accuracy"
        ? "accuracy"
        : stat === "goals"
        ? "total_goals"
        : stat === "shots"
        ? "total_shots"
        : stat === "sessions"
        ? "total_sessions"
        : "accuracy";

    query += ` ORDER BY ${orderBy} DESC LIMIT 50`;

    console.log(`[LEADERBOARD] Executing query with ${params.length} params`);
    const leaderboard = await dbAsync.all(query, params);
    console.log(`[LEADERBOARD] Found ${leaderboard.length} entries`);
    
    res.json(leaderboard);
  } catch (error) {
    console.error("[LEADERBOARD ERROR]", error.message);
    console.error("[LEADERBOARD ERROR STACK]", error.stack);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

// Get aggregated heatmap data (combines all sessions)
router.get("/heatmap", authenticateToken, async (req, res) => {
  try {
    const sessions = await dbAsync.all(
      `
      SELECT shot_heatmap, goal_heatmap 
      FROM sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `,
      [req.user.userId]
    );

    if (!sessions || sessions.length === 0) {
      return res.json({
        shots: Array(10)
          .fill(null)
          .map(() => Array(10).fill(0)),
        goals: Array(10)
          .fill(null)
          .map(() => Array(10).fill(0)),
      });
    }

    // Initialize aggregated heatmaps (10x10 grid)
    const aggregatedShots = Array(10)
      .fill(null)
      .map(() => Array(10).fill(0));
    const aggregatedGoals = Array(10)
      .fill(null)
      .map(() => Array(10).fill(0));

    // Aggregate all sessions
    sessions.forEach((session) => {
      try {
        const shotHeatmap = JSON.parse(session.shot_heatmap || "[]");
        const goalHeatmap = JSON.parse(session.goal_heatmap || "[]");

        // Add to aggregated data
        shotHeatmap.forEach((row, y) => {
          row.forEach((value, x) => {
            if (y < 10 && x < 10) {
              aggregatedShots[y][x] += value || 0;
            }
          });
        });

        goalHeatmap.forEach((row, y) => {
          row.forEach((value, x) => {
            if (y < 10 && x < 10) {
              aggregatedGoals[y][x] += value || 0;
            }
          });
        });
      } catch (parseError) {
        console.error("Error parsing heatmap data:", parseError);
      }
    });

    res.json({
      shots: aggregatedShots,
      goals: aggregatedGoals,
    });
  } catch (error) {
    console.error("Get heatmap error:", error);
    res.status(500).json({ error: "Failed to get heatmap" });
  }
});

module.exports = router;
