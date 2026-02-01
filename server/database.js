const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "furls.db");

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to SQLite database");
    initializeTables();
    runMigrations();
  }
});

function runMigrations() {
  console.log("Running database migrations...");
  
  // Migration: Add api_key column if it doesn't exist
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error("Error checking users table:", err);
      return;
    }
    
    const hasApiKey = columns.some(col => col.name === "api_key");
    if (!hasApiKey) {
      console.log("Adding api_key column to users table...");
      db.run("ALTER TABLE users ADD COLUMN api_key TEXT UNIQUE", (err) => {
        if (err) {
          console.error("Error adding api_key column:", err);
        } else {
          console.log("✓ api_key column added successfully");
        }
      });
    }
    
    const hasProfileVisibility = columns.some(col => col.name === "profile_visibility");
    if (!hasProfileVisibility) {
      console.log("Adding profile_visibility column to users table...");
      db.run("ALTER TABLE users ADD COLUMN profile_visibility TEXT DEFAULT 'public'", (err) => {
        if (err) {
          console.error("Error adding profile_visibility column:", err);
        } else {
          console.log("✓ profile_visibility column added successfully");
        }
      });
    }
    
    const hasTotalSessions = columns.some(col => col.name === "total_sessions");
    if (!hasTotalSessions) {
      console.log("Adding statistics columns to users table...");
      db.run("ALTER TABLE users ADD COLUMN total_sessions INTEGER DEFAULT 0", (err) => {
        if (err) console.error("Error adding total_sessions:", err);
      });
      db.run("ALTER TABLE users ADD COLUMN total_shots INTEGER DEFAULT 0", (err) => {
        if (err) console.error("Error adding total_shots:", err);
      });
      db.run("ALTER TABLE users ADD COLUMN total_goals INTEGER DEFAULT 0", (err) => {
        if (err) console.error("Error adding total_goals:", err);
      });
      db.run("ALTER TABLE users ADD COLUMN last_active DATETIME", (err) => {
        if (err) console.error("Error adding last_active:", err);
        else console.log("✓ Statistics columns added successfully");
      });
    }
  });
  
  console.log("✓ Database migrations complete");
}

function initializeTables() {
  // Users table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      api_key TEXT UNIQUE,
      display_name TEXT,
      avatar_url TEXT,
      profile_visibility TEXT DEFAULT 'public',
      total_sessions INTEGER DEFAULT 0,
      total_shots INTEGER DEFAULT 0,
      total_goals INTEGER DEFAULT 0,
      last_active DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) console.error("Error creating users table:", err);
    }
  );

  // Sessions table (training sessions)
  db.run(
    `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      timestamp DATETIME NOT NULL,
      shots INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0,
      average_speed REAL DEFAULT 0,
      speed_samples INTEGER DEFAULT 0,
      boost_collected REAL DEFAULT 0,
      boost_used REAL DEFAULT 0,
      game_time REAL DEFAULT 0,
      possession_time REAL DEFAULT 0,
      team_possession_time REAL DEFAULT 0,
      opponent_possession_time REAL DEFAULT 0,
      shot_heatmap TEXT,
      goal_heatmap TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
    (err) => {
      if (err) console.error("Error creating sessions table:", err);
    }
  );

  // Friendships table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, friend_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating friendships table:", err);
    }
  );

  // User settings table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      theme TEXT DEFAULT 'dark',
      privacy_stats TEXT CHECK(privacy_stats IN ('public', 'friends', 'private')) DEFAULT 'friends',
      privacy_profile TEXT CHECK(privacy_profile IN ('public', 'friends', 'private')) DEFAULT 'public',
      notifications_enabled BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
    (err) => {
      if (err) console.error("Error creating user_settings table:", err);
    }
  );

  // Create indexes for better performance
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    (err) => {
      if (err) console.error("Error creating index:", err);
    }
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp)`,
    (err) => {
      if (err) console.error("Error creating index:", err);
    }
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id)`,
    (err) => {
      if (err) console.error("Error creating index:", err);
    }
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id)`,
    (err) => {
      if (err) console.error("Error creating index:", err);
    }
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status)`,
    (err) => {
      if (err) console.error("Error creating index:", err);
      else console.log("Database tables initialized successfully");
    }
  );
}

// Helper functions for database operations
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
};

module.exports = { db, dbAsync };
