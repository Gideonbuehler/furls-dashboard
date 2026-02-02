const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const { dbAsync } = require("../database");
const { generateToken, authenticateToken } = require("../auth");

const router = express.Router();

// Register new user
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("displayName").optional().trim().isLength({ max: 50 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, displayName } = req.body;

    try {
      // Check if user already exists
      const existingUser = await dbAsync.get(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
      );

      if (existingUser) {
        return res
          .status(409)
          .json({ error: "Username or email already exists" });
      } // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate API key for plugin uploads
      const apiKey = crypto.randomBytes(32).toString("hex"); // Create user
      const result = await dbAsync.run(
        "INSERT INTO users (username, email, password, display_name, api_key) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, displayName || username, apiKey]
      );

      // Create default settings for user
      await dbAsync.run("INSERT INTO user_settings (user_id) VALUES (?)", [
        result.id,
      ]);

      // Generate token
      const token = generateToken(result.id, username);

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: result.id,
          username,
          email,
          displayName: displayName || username,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      res.status(500).json({
        error: "Failed to register user",
        details:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  }
);

// Login
router.post(
  "/login",
  [body("username").trim().notEmpty(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Find user (allow login with email or username)
      const user = await dbAsync.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, username]
      );

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user.id, user.username);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  }
);

// Get current user profile
router.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const jwt = require("jsonwebtoken");
    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dbAsync.get(
      "SELECT id, username, email, display_name, avatar_url, created_at FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// Get API key (for plugin configuration)
router.get("/api-key", authenticateToken, async (req, res) => {
  try {
    const user = await dbAsync.get("SELECT api_key FROM users WHERE id = ?", [
      req.user.userId,
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user doesn't have an API key, generate one automatically
    if (!user.api_key) {
      console.log(`[API KEY] User ${req.user.username} has no API key. Generating one...`);
      const newApiKey = crypto.randomBytes(32).toString("hex");
      
      await dbAsync.run("UPDATE users SET api_key = ? WHERE id = ?", [
        newApiKey,
        req.user.userId,
      ]);

      console.log(`[API KEY] Generated new API key for user ${req.user.username}`);
      return res.json({ 
        api_key: newApiKey,
        message: "API key generated"
      });
    }

    res.json({ api_key: user.api_key });
  } catch (error) {
    console.error("Get API key error:", error);
    res.status(500).json({ error: "Failed to get API key" });
  }
});

// Regenerate API key
router.post("/regenerate-api-key", authenticateToken, async (req, res) => {
  try {
    const newApiKey = crypto.randomBytes(32).toString("hex");

    await dbAsync.run("UPDATE users SET api_key = ? WHERE id = ?", [
      newApiKey,
      req.user.userId,
    ]);

    res.json({
      api_key: newApiKey,
      message: "API key regenerated successfully",
    });
  } catch (error) {
    console.error("Regenerate API key error:", error);
    res.status(500).json({ error: "Failed to regenerate API key" });
  }
});

// Update profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("displayName").optional().trim().isLength({ max: 50 }),
    body("bio").optional().trim().isLength({ max: 500 }),
    body("avatarUrl").optional().trim().isURL().isLength({ max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, bio, avatarUrl } = req.body;

    try {
      // Build dynamic update query
      const updates = [];
      const values = [];

      if (displayName !== undefined) {
        updates.push("display_name = ?");
        values.push(displayName);
      }
      if (bio !== undefined) {
        updates.push("bio = ?");
        values.push(bio);
      }
      if (avatarUrl !== undefined) {
        updates.push("avatar_url = ?");
        values.push(avatarUrl);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(req.user.userId);

      await dbAsync.run(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      // Get updated user
      const user = await dbAsync.get(
        "SELECT id, username, email, display_name, bio, avatar_url, profile_visibility FROM users WHERE id = ?",
        [req.user.userId]
      );

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          bio: user.bio,
          avatarUrl: user.avatar_url,
          profileVisibility: user.profile_visibility,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// Update privacy settings
router.put("/privacy", authenticateToken, async (req, res) => {
  const { profileVisibility } = req.body;

  if (!["public", "friends", "private"].includes(profileVisibility)) {
    return res.status(400).json({
      error:
        "Invalid visibility setting. Must be 'public', 'friends', or 'private'",
    });
  }

  try {
    await dbAsync.run(
      "UPDATE users SET profile_visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [profileVisibility, req.user.userId]
    );

    res.json({
      message: "Privacy settings updated successfully",
      profileVisibility,
    });
  } catch (error) {
    console.error("Update privacy error:", error);
    res.status(500).json({ error: "Failed to update privacy settings" });
  }
});

// Upload avatar (using base64 instead of file upload for simplicity)
router.post("/upload-avatar", authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // Validate base64 image data
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    // Store base64 image directly (for simplicity - in production you'd use cloud storage)
    // For now, we'll just store the data URL
    const avatarUrl = avatar;

    await dbAsync.run(
      "UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [avatarUrl, req.user.userId]
    );

    const user = await dbAsync.get(
      "SELECT id, username, email, display_name, avatar_url FROM users WHERE id = ?",
      [req.user.userId]
    );

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: user.avatar_url,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

module.exports = router;
