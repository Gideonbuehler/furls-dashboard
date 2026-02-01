# PostgreSQL Migration Guide

## 🎯 What Changed

Your FURLS Dashboard has been migrated from SQLite to PostgreSQL to fix the data persistence issues on Render.com.

### Problems Solved:

✅ **Friends list now persists** - No more data loss on server restart  
✅ **Player search works** - Database is persistent across deployments  
✅ **Production-ready** - PostgreSQL is designed for web applications  
✅ **Better performance** - Optimized for concurrent connections

---

## 🚀 Deployment Steps on Render.com

### Step 1: Push Your Changes to GitHub

```powershell
git add .
git commit -m "Migrate from SQLite to PostgreSQL"
git push origin main
```

### Step 2: Deploy to Render

Render will automatically detect the `render.yaml` file and:

1. **Create a PostgreSQL database** (furls-db)
2. **Create the web service** (furls-api)
3. **Link them together** via the `DATABASE_URL` environment variable

**Important:** When Render creates your services, make sure:

- The database is created FIRST
- The web service can access the database URL

### Step 3: Monitor the Deployment

1. Go to your Render Dashboard
2. Watch the build logs for "✅ Connected to PostgreSQL database"
3. Check for "✅ Database initialization complete!"

---

## 🔧 Local Development Setup

To run your app locally with PostgreSQL, you have two options:

### Option A: Use Render's Database (Easiest)

1. Get your database URL from Render Dashboard:

   - Go to your `furls-db` database
   - Copy the "External Connection String"

2. Create a `.env` file in your project root:

```env
DATABASE_URL=your-render-database-url-here
NODE_ENV=development
JWT_SECRET=your-secret-here
PORT=3000
```

3. Run your app:

```powershell
npm install
npm start
```

### Option B: Install PostgreSQL Locally

1. **Install PostgreSQL:**

   - Download from https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name furls-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create database:**

```powershell
# Using psql command line
psql -U postgres
CREATE DATABASE furls;
\q
```

3. **Set environment variable:**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/furls
NODE_ENV=development
JWT_SECRET=your-secret-here
PORT=3000
```

4. **Run your app:**

```powershell
npm install
npm start
```

---

## 📋 What Was Changed in the Code

### 1. `package.json`

- ❌ Removed: `sqlite3` package
- ✅ Added: `pg` (node-postgres) package

### 2. `server/database.js`

- Complete rewrite to use PostgreSQL
- Uses connection pooling for better performance
- Automatically converts SQLite queries to PostgreSQL syntax
- Handles `?` placeholders → `$1, $2, $3` conversion

### 3. `render.yaml`

- ❌ Removed: Persistent disk configuration
- ✅ Added: PostgreSQL database service
- ✅ Added: Automatic `DATABASE_URL` linking

### 4. Routes (No changes needed!)

All your existing routes work as-is thanks to the compatibility layer in `database.js`

---

## 🔍 Verifying the Migration

### Check Database Connection

Your server logs should show:

```
✅ Connected to PostgreSQL database at: 2026-02-01T...
Initializing database tables...
✓ Users table ready
✓ Sessions table ready
✓ Friendships table ready
✓ User settings table ready
✓ Indexes created
✅ Database initialization complete!
```

### Test the Application

1. **Register a new user** - Should work
2. **Search for players** - Should find users
3. **Add friends** - Should persist
4. **Restart the server** - Data should still be there! 🎉

---

## 🐛 Troubleshooting

### "Connection refused" error

- Make sure the PostgreSQL database is created on Render
- Check that `DATABASE_URL` environment variable is set
- Verify the database and web service are in the same region

### "relation does not exist" error

- The tables haven't been created yet
- Check server logs for database initialization errors
- The app creates tables automatically on first run

### Data not persisting locally

- Make sure you're using the same `DATABASE_URL` consistently
- Don't switch between different databases
- Check your `.env` file is being loaded

### Player search not working

- Make sure users are actually in the database
- Check the console for SQL errors
- Verify the database connection is established

---

## 📊 Database Management

### View your data on Render

1. Go to Render Dashboard → Your Database
2. Click "Connect" to get connection details
3. Use a PostgreSQL client like:
   - [pgAdmin](https://www.pgadmin.org/)
   - [DBeaver](https://dbeaver.io/)
   - [TablePlus](https://tableplus.com/)
   - VS Code extension: "PostgreSQL" by Chris Kolkman

### Useful PostgreSQL Commands

```sql
-- View all users
SELECT * FROM users;

-- View all friendships
SELECT * FROM friendships;

-- Count total sessions
SELECT COUNT(*) FROM sessions;

-- View recent sessions
SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10;
```

---

## 💰 Render Free Tier Limits

PostgreSQL Free Tier includes:

- ✅ 1GB storage
- ✅ Automatic backups
- ✅ High availability
- ⚠️ Database expires after 90 days of inactivity (easily renewed)
- ⚠️ Connection limit: 97 connections

This is more than enough for development and small-scale production use!

---

## 🔄 Rollback (If Needed)

If you need to go back to SQLite:

1. Restore the old `database.js` from git history
2. Change `package.json` back to use `sqlite3`
3. Remove the `databases:` section from `render.yaml`
4. Add back the `disk:` configuration

But trust me, PostgreSQL is better! 🚀

---

## 🎉 Next Steps

Your database issues are fixed! Now you can:

- ✅ Deploy to Render without losing data
- ✅ Search for players reliably
- ✅ Keep friends lists across restarts
- ✅ Scale to more users if needed

**Happy coding!** 🎮⚽
