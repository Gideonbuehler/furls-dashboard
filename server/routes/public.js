const express = require('express');
const router = express.Router();
const db = require('../database');

// Public profile page
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  
  db.get(
    `SELECT username, avatar_url, total_shots, total_goals, 
            total_sessions, created_at, profile_visibility
     FROM users 
     WHERE username = ?`,
    [username],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      if (user.profile_visibility === 'private') {
        return res.status(403).json({ error: 'Profile is private' });
      }
      
      // Get recent sessions (if public)
      db.all(
        `SELECT timestamp, shots, goals, average_speed 
         FROM sessions 
         WHERE user_id = (SELECT id FROM users WHERE username = ?)
         ORDER BY timestamp DESC 
         LIMIT 20`,
        [username],
        (err, sessions) => {
          if (err) sessions = [];
          res.json({ user, sessions });
        }
      );
    }
  );
});

// Search players
router.get('/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  db.all(
    `SELECT username, avatar_url, total_shots, total_goals
     FROM users
     WHERE username LIKE ? 
     AND (profile_visibility = 'public' OR profile_visibility IS NULL)
     LIMIT 20`,
    [`%${q}%`],
    (err, players) => {
      if (err) {
        return res.status(500).json({ error: 'Search failed' });
      }
      res.json(players || []);
    }
  );
});

// Global leaderboard
router.get('/leaderboard/:stat', async (req, res) => {
  const { stat } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  let orderBy = 'total_shots DESC';
  if (stat === 'goals') orderBy = 'total_goals DESC';
  if (stat === 'accuracy') orderBy = '(CAST(total_goals AS FLOAT) / NULLIF(total_shots, 0)) DESC';
  if (stat === 'sessions') orderBy = 'total_sessions DESC';
  
  const query = `
    SELECT username, avatar_url, total_shots, total_goals, total_sessions,
           ROUND((CAST(total_goals AS FLOAT) / NULLIF(total_shots, 0) * 100), 2) as accuracy
    FROM users
    WHERE (profile_visibility = 'public' OR profile_visibility IS NULL)
    AND total_shots > 0
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  
  db.all(query, [parseInt(limit), parseInt(offset)], (err, players) => {
    if (err) {
      console.error('Leaderboard error:', err);
      return res.status(500).json({ error: 'Failed to load leaderboard' });
    }
    res.json(players || []);
  });
});

module.exports = router;
