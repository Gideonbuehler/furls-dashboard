# Quick Reference: SQLite vs PostgreSQL Changes

## Environment Variables

### Before (SQLite)

```env
DB_PATH=/opt/render/project/data/furls.db
```

### After (PostgreSQL)

```env
DATABASE_URL=postgres://user:password@host:5432/database
```

---

## Data Types

| SQLite                              | PostgreSQL             |
| ----------------------------------- | ---------------------- |
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY`   |
| `DATETIME`                          | `TIMESTAMP`            |
| `BOOLEAN` (stored as 0/1)           | `BOOLEAN` (true/false) |

---

## Query Parameters

### SQLite

```javascript
db.run("SELECT * FROM users WHERE id = ?", [userId]);
```

### PostgreSQL

```javascript
// Our dbAsync automatically converts! Still use ?
dbAsync.get("SELECT * FROM users WHERE id = ?", [userId]);

// Or use native PostgreSQL syntax
pool.query("SELECT * FROM users WHERE id = $1", [userId]);
```

---

## Key Changes in Code

### 1. Import Statement

```javascript
// Before
const sqlite3 = require("sqlite3").verbose();

// After
const { Pool } = require("pg");
```

### 2. Connection

```javascript
// Before
const db = new sqlite3.Database(DB_PATH);

// After
const pool = new Pool({ connectionString: DATABASE_URL });
```

### 3. Getting Last Insert ID

```javascript
// Before (SQLite)
db.run("INSERT INTO users ...", function (err) {
  console.log(this.lastID); // Auto-available
});

// After (PostgreSQL)
// Our dbAsync.run() automatically adds RETURNING id
const result = await dbAsync.run("INSERT INTO users ...");
console.log(result.id); // Returns the ID
```

---

## Compatibility Layer

Our updated `database.js` provides **100% backward compatibility**:

✅ All existing routes work without changes  
✅ `?` placeholders automatically converted to `$1, $2, $3`  
✅ `INSERT` statements automatically return IDs  
✅ Same async/await API as before

**No route changes needed!** 🎉

---

## Testing the Migration

### Check Connection

```javascript
// Should see in logs:
✅ Connected to PostgreSQL database at: ...
✅ Database initialization complete!
```

### Verify Tables

```sql
-- Connect to your database and run:
\dt  -- List all tables (PostgreSQL)

-- Should see:
users, sessions, friendships, user_settings
```

### Test Features

1. ✅ Register user
2. ✅ Login
3. ✅ Search for players
4. ✅ Add friends
5. ✅ Restart server → Data persists!

---

## Common PostgreSQL Commands

```sql
-- List databases
\l

-- Connect to database
\c furls

-- List tables
\dt

-- Describe table
\d users

-- View data
SELECT * FROM users LIMIT 10;

-- Count records
SELECT COUNT(*) FROM sessions;
```

---

## Render.com Free Tier

| Feature     | Limit                          |
| ----------- | ------------------------------ |
| Storage     | 1 GB                           |
| Connections | 97 concurrent                  |
| Backups     | Automatic                      |
| Expiration  | 90 days inactivity (renewable) |
| Cost        | **FREE** 🎉                    |

---

## Troubleshooting

### "relation does not exist"

→ Tables not created yet. Check server logs for initialization errors.

### "Connection refused"

→ Check `DATABASE_URL` is set correctly in Render environment variables.

### "Too many connections"

→ Increase connection timeout or use connection pooling (already configured!).

### Data not persisting locally

→ Make sure `.env` file exists with correct `DATABASE_URL`.

---

## Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- node-postgres (pg): https://node-postgres.com/
- Render PostgreSQL: https://render.com/docs/databases

---

**Migration Complete! 🎊**  
Your app is now production-ready with persistent PostgreSQL storage!
