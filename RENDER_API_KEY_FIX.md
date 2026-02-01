# Render Deployment Fix - API Key 404 Error

## Problem

When deploying to Render from GitHub, the `/api/auth/api-key` endpoint returns 404 error.

## Root Cause

The JWT_SECRET environment variable is not set on Render, causing the `authenticateToken` middleware to fail silently or reject requests.

## Solution

### 1. Set Environment Variables on Render

Go to your Render dashboard → Your service → Environment → Add the following:

```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
NODE_ENV=production
DATABASE_URL=file:./furls.db
PORT=10000
```

**Important**: Generate a secure JWT_SECRET with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Verify Auth Routes Are Registered

In `server/index.js`, ensure this line exists:

```javascript
app.use("/api/auth", authRoutes);
```

### 3. Check Database Initialization

Make sure the database is created with the api_key column:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  api_key TEXT UNIQUE NOT NULL,  -- This is critical!
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Test the Endpoint Locally

```bash
# Start server
cd Dashboard/server
npm start

# Test endpoint (replace TOKEN with your JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3002/api/auth/api-key
```

### 5. Render Build & Start Commands

Ensure your `render.yaml` or dashboard settings have:

**Build Command:**

```bash
cd server && npm install && node database.js
```

**Start Command:**

```bash
cd server && node index.js
```

## Debugging on Render

### Check Logs

```bash
# In Render dashboard, go to Logs tab
# Look for:
- "Server is running on port 10000"
- "Database initialized successfully"
- Any JWT errors
```

### Test the Endpoint

```bash
# From Render shell or logs
curl http://localhost:10000/api/health
```

### Common Issues

1. **JWT_SECRET not set**

   - Symptom: 401 Unauthorized or 403 Forbidden
   - Fix: Add JWT_SECRET environment variable

2. **Database not initialized**

   - Symptom: api_key column missing
   - Fix: Run `node database.js` in build command

3. **Wrong base URL**

   - Symptom: 404 on deployed app but works locally
   - Fix: Check client's `api.js` baseURL

4. **CORS issues**
   - Symptom: Network error in browser console
   - Fix: Add your Render domain to CORS whitelist

## Quick Fix Checklist

- [ ] JWT_SECRET set in Render environment variables
- [ ] Database has api_key column
- [ ] Auth routes are registered in index.js
- [ ] Build command runs database.js
- [ ] Frontend axios baseURL points to correct domain
- [ ] CORS allows your frontend domain

## Environment Variables Template

```bash
# Required
JWT_SECRET=<generate-with-crypto.randomBytes>
NODE_ENV=production
PORT=10000

# Optional
DATABASE_URL=file:./furls.db
LOG_LEVEL=info
```

## Testing After Deploy

1. Login to your app
2. Open DevTools → Network tab
3. Navigate to Settings page (where API key is shown)
4. Check request to `/api/auth/api-key`
5. Should return `{ "api_key": "your-64-char-hex-key" }`

## Still Not Working?

Check these in Render logs:

```bash
# Should see:
[INFO] Server started on port 10000
[INFO] Database initialized
[INFO] Auth routes registered at /api/auth

# Should NOT see:
[ERROR] JWT_SECRET not defined
[ERROR] Database connection failed
[ERROR] Cannot read property 'api_key' of undefined
```

---

**Last Updated**: February 1, 2026  
**Status**: Deploy fix documented
