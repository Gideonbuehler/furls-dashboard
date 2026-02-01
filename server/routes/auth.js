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
    const { JWT_SECRET } = require("./auth");
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

    if (!user || !user.api_key) {
      return res.status(404).json({ error: "API key not found" });
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

module.exports = router;
