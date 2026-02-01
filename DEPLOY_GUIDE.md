# FURLS Public Platform - Quick Deploy Guide

## 🎯 Current Status
✅ **Backend Complete** - All API endpoints implemented
✅ **Frontend Complete** - Settings, Search, Leaderboards ready  
✅ **Plugin Updated** - HTTP upload code added
⏳ **Deployment** - Ready to deploy to Render.com

---

## 🚀 Quick Deploy (5 Steps)

### 1. Fix Node.js Version
```powershell
# Check current version
node --version  # Currently 17.3.0

# Install Node 20+ (Download from nodejs.org)
# Or use NVM:
nvm install 20
nvm use 20
```

### 2. Test Locally
```powershell
cd C:\Users\gideo\source\repos\FURLS\Dashboard
npm run dev
```
- Backend: http://localhost:3002
- Frontend: http://localhost:5173

### 3. Push to GitHub
```powershell
cd C:\Users\gideo\source\repos\FURLS
git add .
git commit -m "Complete public platform - ready for deployment"
git push origin main
```

### 4. Deploy on Render
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Use `render.yaml` config
4. Set environment variable: `JWT_SECRET=your-secret-here`
5. Deploy!

### 5. Configure Plugin
```
furls_enable_upload 1
furls_server_url https://your-app.onrender.com
furls_api_key <get-from-settings-page>
```

---

## 📋 What Was Built

### New Frontend Components
- **⚙️ Settings** - API key management, privacy controls
- **🔍 Search Players** - Find and view any player's profile
- **🏆 Global Leaderboards** - Compete across all users

### New Backend Routes
- `GET /api/auth/api-key` - Get your API key
- `POST /api/auth/regenerate-api-key` - Generate new key
- `POST /api/stats/upload` - Plugin uploads (API key auth)
- `GET /api/public/profile/:username` - View profiles
- `GET /api/public/search?q=query` - Search users
- `GET /api/public/leaderboard/:stat` - Rankings

### Plugin Features
- HTTP upload using WinHTTP
- JSON stats generation
- CVars for configuration
- Async non-blocking upload

---

## 🧪 Testing Commands

### Test Upload Endpoint
```powershell
curl -X POST http://localhost:3002/api/stats/upload `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_API_KEY" `
  -d '{"timestamp":"2026-01-31T12:00:00","total_shots":100,"total_goals":75}'
```

---

## 🎯 Next Actions

1. ⏳ Upgrade Node.js to 20+
2. ⏳ Test all features locally
3. ⏳ Push code to GitHub
4. ⏳ Deploy to Render.com
5. ⏳ Rebuild plugin
6. ⏳ Launch! 🚀

---

**Estimated Time to Launch:** 2-4 hours

Good luck! 🍀
