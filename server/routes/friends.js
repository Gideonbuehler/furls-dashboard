const express = require("express");
const { dbAsync } = require("../database");
const { authenticateToken } = require("../auth");

const router = express.Router();

// Get user's friends list
router.get("/", authenticateToken, async (req, res) => {
  try {
    const friends = await dbAsync.all(
      `
      SELECT 
        u.id, u.username, u.display_name, u.avatar_url,
        f.status, f.created_at as friend_since
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = ? THEN u.id = f.friend_id
          WHEN f.friend_id = ? THEN u.id = f.user_id
        END
      )
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
      ORDER BY f.created_at DESC
    `,
      [req.user.userId, req.user.userId, req.user.userId, req.user.userId]
    );

    res.json(friends);
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ error: "Failed to get friends" });
  }
});

// Get pending friend requests (received)
router.get("/requests", authenticateToken, async (req, res) => {
  try {
    const requests = await dbAsync.all(
      `
      SELECT 
        f.id as request_id,
        u.id, u.username, u.display_name, u.avatar_url,
        f.created_at
      FROM friendships f
      JOIN users u ON u.id = f.user_id
      WHERE f.friend_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `,
      [req.user.userId]
    );

    res.json(requests);
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({ error: "Failed to get friend requests" });
  }
});

// Get sent friend requests
router.get("/requests/sent", authenticateToken, async (req, res) => {
  try {
    const requests = await dbAsync.all(
      `
      SELECT 
        f.id as request_id,
        u.id, u.username, u.display_name, u.avatar_url,
        f.created_at, f.status
      FROM friendships f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `,
      [req.user.userId]
    );

    res.json(requests);
  } catch (error) {
    console.error("Get sent requests error:", error);
    res.status(500).json({ error: "Failed to get sent requests" });
  }
});

// Send friend request
router.post("/request", authenticateToken, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Find user by username
    const friend = await dbAsync.get(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    if (friend.id === req.user.userId) {
      return res.status(400).json({ error: "Cannot add yourself as friend" });
    }

    // Check if friendship already exists
    const existing = await dbAsync.get(
      `
      SELECT id, status FROM friendships 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `,
      [req.user.userId, friend.id, friend.id, req.user.userId]
    );

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ error: "Already friends" });
      } else if (existing.status === "pending") {
        return res.status(400).json({ error: "Friend request already sent" });
      }
    }

    // Create friend request
    await dbAsync.run(
      "INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)",
      [req.user.userId, friend.id, "pending"]
    );

    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Accept friend request
router.post("/accept/:requestId", authenticateToken, async (req, res) => {
  const { requestId } = req.params;

  try {
    // Verify this is a valid pending request to current user
    const request = await dbAsync.get(
      "SELECT * FROM friendships WHERE id = ? AND friend_id = ? AND status = ?",
      [requestId, req.user.userId, "pending"]
    );

    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Accept the request
    await dbAsync.run(
      "UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["accepted", requestId]
    );

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// Reject/Remove friend request
router.delete("/:requestId", authenticateToken, async (req, res) => {
  const { requestId } = req.params;

  try {
    // Verify this is a valid request involving current user
    const request = await dbAsync.get(
      "SELECT * FROM friendships WHERE id = ? AND (user_id = ? OR friend_id = ?)",
      [requestId, req.user.userId, req.user.userId]
    );

    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Delete the friendship
    await dbAsync.run("DELETE FROM friendships WHERE id = ?", [requestId]);

    res.json({ message: "Friend request removed" });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

// Search users
router.get("/search", authenticateToken, async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: "Search query too short" });
  }

  try {
    const users = await dbAsync.all(
      `
      SELECT id, username, display_name, avatar_url
      FROM users
      WHERE (username LIKE ? OR display_name LIKE ?) AND id != ?
      LIMIT 20
    `,
      [`%${q}%`, `%${q}%`, req.user.userId]
    );

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

module.exports = router;
