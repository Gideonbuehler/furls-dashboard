# 🚀 Deployment Checklist

## ✅ Pre-Deployment

- [x] Migrated from SQLite to PostgreSQL
- [x] Updated `package.json` (removed sqlite3, added pg)
- [x] Rewrote `server/database.js` for PostgreSQL
- [x] Updated `server/routes/upload.js` to async/await
- [x] Updated `render.yaml` with PostgreSQL configuration
- [x] Updated `.env.example` for PostgreSQL
- [x] Installed dependencies (`npm install` completed)
- [x] No syntax errors detected

---

## 📋 Deployment Steps

### Step 1: Commit Changes
```powershell
git add .
git commit -m "Migrate to PostgreSQL for persistent data storage

- Replace SQLite with PostgreSQL for production use
- Fix friends list not persisting on Render
- Fix player search not finding existing users
- Add automatic query parameter conversion
- Update all routes to use async/await pattern"

git push origin main
```

### Step 2: Monitor Render Deployment
1. Go to https://dashboard.render.com
2. Watch your service deploy automatically
3. Check build logs for:
   - ✅ Build successful
   - ✅ PostgreSQL database created
   - ✅ Database URL configured

### Step 3: Verify Database Connection
In the server logs, look for:
```
✅ Connected to PostgreSQL database at: 2026-02-01...
Initializing database tables...
✓ Users table ready
✓ Sessions table ready
✓ Friendships table ready
✓ User settings table ready
✓ Indexes created
✅ Database initialization complete!
```

### Step 4: Test Your Application
1. **Register a new user**
   - Go to your app URL
   - Create an account
   - ✅ Should succeed

2. **Search for players**
   - Register a second user (or use existing)
   - Search for the first user by username
   - ✅ Should find the user

3. **Add friend**
   - Send friend request
   - Accept friend request
   - ✅ Friend should appear in friends list

4. **Test persistence**
   - Go to Render Dashboard
   - Manual Deploy → Clear build cache & deploy
   - Wait for restart
   - ✅ Friends list should still be there!
   - ✅ All users should still be searchable!

---

## 🔍 What to Check in Render Dashboard

### Database (furls-db)
- Status: ✅ Available
- Type: PostgreSQL
- Plan: Free
- Storage: <1GB used
- Connection String: Should be auto-linked to web service

### Web Service (furls-api)
- Status: ✅ Live
- Environment Variables:
  - `DATABASE_URL` → ✅ Connected to furls-db
  - `JWT_SECRET` → ✅ Auto-generated
  - `NODE_ENV` → production
  - `PORT` → 10000

---

## 🎯 Expected Behavior After Deployment

### ✅ Friends List Persistence
- Add friends → ✅ Persist after restart
- Accept requests → ✅ Persist after restart
- Friend data → ✅ Never lost

### ✅ Player Search
- All registered users → ✅ Always searchable
- Search by username → ✅ Returns results
- Database → ✅ Never reset

### ✅ Stats Tracking
- Upload from plugin → ✅ Persists
- Session history → ✅ Survives restarts
- Leaderboard → ✅ Always accurate

---

## 🐛 If Something Goes Wrong

### Database not connecting
1. Check Render Dashboard → Database → Status
2. Ensure database is in same region as web service (Oregon)
3. Check environment variable `DATABASE_URL` is linked

### Tables not created
1. Check server logs for database initialization errors
2. Try manual redeploy
3. Check PostgreSQL version compatibility (should be 14+)

### Old data not migrated
**Note**: This is a fresh database. Old SQLite data won't transfer automatically.
- Users will need to re-register
- This is expected and correct behavior
- Old data was being lost on every restart anyway

### Still seeing SQLite errors
1. Make sure you pushed the latest changes
2. Check Render is pulling from correct branch (main)
3. Clear build cache and redeploy

---

## 📊 Monitoring

### Health Check
Your app has a health endpoint: `https://your-app.onrender.com/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Database Size
Monitor in Render Dashboard → Database → Metrics
- Free tier: 1GB limit
- Current usage should be <10MB for small user base

---

## 🎉 Success Criteria

- [ ] Deployment completes without errors
- [ ] Database connection established
- [ ] All tables created successfully
- [ ] Can register new users
- [ ] Can search for existing players
- [ ] Can add friends
- [ ] Friends list persists after server restart
- [ ] Stats upload from plugin works

---

## 📞 Need Help?

1. **Check Logs**: Render Dashboard → Your Service → Logs
2. **Database Access**: Use connection string with pgAdmin or TablePlus
3. **Review Docs**: See `POSTGRESQL_MIGRATION.md` for detailed guide

---

**Ready to deploy? Run the commit command above!** 🚀
