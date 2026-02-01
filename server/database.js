const path = require("path");
const fs = require("fs");

// Determine which database to use
const useSqlite = process.env.USE_SQLITE === "true" || !process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";

console.log(`🗄️  Database Mode: ${useSqlite ? "SQLite (Local)" : "PostgreSQL (Production)"}`);

let pool, db;

if (useSqlite) {
  // SQLite for local development
  const sqlite3 = require("sqlite3").verbose();
  const DB_PATH = path.join(__dirname, "furls.db");
  
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("❌ SQLite connection error:", err);
    } else {
      console.log("✅ Connected to SQLite database at:", DB_PATH);
      initializeTables();
    }
  });
} else {
  // PostgreSQL for production
  const { Pool } = require("pg");
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
      ? {
          rejectUnauthorized: false, // Required for Render.com PostgreSQL
        }
      : false,
  });

  // Test database connection
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("❌ PostgreSQL connection error:", err);
    } else {
      console.log("✅ Connected to PostgreSQL database at:", res.rows[0].now);
      initializeTables();
    }
  });

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("Unexpected database error:", err);
  });
}

async function initializeTables() {
  if (useSqlite) {
    // SQLite table initialization (synchronous callbacks)
    console.log("Initializing SQLite tables...");
      // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        api_key TEXT UNIQUE,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        profile_visibility TEXT DEFAULT 'public',
        total_sessions INTEGER DEFAULT 0,
        total_shots INTEGER DEFAULT 0,
        total_goals INTEGER DEFAULT 0,
        last_active DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    db.run(`
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
    `);

    // Friendships table
    db.run(`
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
    `);

    // User settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        theme TEXT DEFAULT 'dark',
        privacy_stats TEXT CHECK(privacy_stats IN ('public', 'friends', 'private')) DEFAULT 'friends',
        privacy_profile TEXT CHECK(privacy_profile IN ('public', 'friends', 'private')) DEFAULT 'public',
        notifications_enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status)`, (err) => {
      if (!err) console.log("✅ SQLite database initialized successfully");
    });
    
  } else {
    // PostgreSQL table initialization (async)
    const client = await pool.connect();
    try {
      console.log("Initializing PostgreSQL tables...");      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          api_key TEXT UNIQUE,
          display_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          profile_visibility TEXT DEFAULT 'public',
          total_sessions INTEGER DEFAULT 0,
          total_shots INTEGER DEFAULT 0,
          total_goals INTEGER DEFAULT 0,
          last_active TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✓ Users table ready");

      // Sessions table (training sessions)
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          timestamp TIMESTAMP NOT NULL,
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("✓ Sessions table ready");

      // Friendships table
      await client.query(`
        CREATE TABLE IF NOT EXISTS friendships (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          friend_id INTEGER NOT NULL,
          status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, friend_id)
        )
      `);
      console.log("✓ Friendships table ready");

      // User settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL,
          theme TEXT DEFAULT 'dark',
          privacy_stats TEXT CHECK(privacy_stats IN ('public', 'friends', 'private')) DEFAULT 'friends',
          privacy_profile TEXT CHECK(privacy_profile IN ('public', 'friends', 'private')) DEFAULT 'public',
          notifications_enabled BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("✓ User settings table ready");

      // Create indexes for better performance
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key) WHERE api_key IS NOT NULL`
      );
      console.log("✓ Indexes created");

      console.log("✅ Database initialization complete!");
    } catch (err) {
      console.error("❌ Error initializing database:", err);
    } finally {
      client.release();
    }
  }
}

// Helper function to convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// Helper functions for database operations (compatible with both SQLite and PostgreSQL)
const dbAsync = {
  run: async (sql, params = []) => {
    if (useSqlite) {
      // SQLite version
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      });
    } else {
      // PostgreSQL version
      const client = await pool.connect();
      try {
        let pgSql = convertPlaceholders(sql);
        
        // If it's an INSERT, add RETURNING id to get the inserted ID
        if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
          if (!pgSql.toUpperCase().includes('RETURNING')) {
            pgSql += ' RETURNING id';
          }
        }
        
        const result = await client.query(pgSql, params);
        return {
          id: result.rows[0]?.id || null,
          changes: result.rowCount,
        };
      } finally {
        client.release();
      }
    }
  },

  get: async (sql, params = []) => {
    if (useSqlite) {
      // SQLite version
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    } else {
      // PostgreSQL version
      const client = await pool.connect();
      try {
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    }
  },

  all: async (sql, params = []) => {
    if (useSqlite) {
      // SQLite version
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } else {
      // PostgreSQL version
      const client = await pool.connect();
      try {
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);
        return result.rows;
      } finally {
        client.release();
      }
    }
  },
};

// Export appropriate database object and dbAsync for compatibility
module.exports = { 
  db: useSqlite ? db : pool, 
  dbAsync, 
  pool: useSqlite ? null : pool 
};
