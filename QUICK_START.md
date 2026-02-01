# FURLS Dashboard - Quick Start Guide

## 🚀 Starting the Dashboard

### Method 1: Double-click the Batch File (Easiest)
1. Navigate to: `c:\Users\gideo\source\repos\FURLS\Dashboard\`
2. Double-click: **`start-dashboard.bat`**
3. Wait for browser to open automatically
4. Two terminal windows will stay open (don't close them!)

### Method 2: PowerShell Script
```powershell
cd c:\Users\gideo\source\repos\FURLS\Dashboard
.\start-dashboard.ps1
```

### Method 3: Manual Start
```powershell
# Terminal 1 - Backend
cd c:\Users\gideo\source\repos\FURLS\Dashboard
npm start

# Terminal 2 - Frontend (use correct Node.js)
cd c:\Users\gideo\source\repos\FURLS\Dashboard\client
& "C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js
```

---

## 🌐 Accessing the Dashboard

Once started, open your browser to:
- **Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3002

---

## 🛑 Stopping the Dashboard

### If using Batch File:
- Close both terminal windows that opened

### If using PowerShell Script:
- Press `Ctrl+C` in the PowerShell window

### If using Manual Method:
- Press `Ctrl+C` in each terminal window

---

## ❗ Troubleshooting

### Issue: "Cannot access the dashboard"

**Solution 1: Check if servers are running**
```powershell
netstat -ano | findstr "3002 5173"
```
You should see both ports listed.

**Solution 2: Restart the servers**
1. Stop any existing servers (Ctrl+C)
2. Run the batch file: `start-dashboard.bat`

**Solution 3: Check Node.js version**
```powershell
node --version
```
Should show v20+ or v22+ (you have v24.13.0 ✓)

---

### Issue: "Vite requires Node.js version 20.19+"

This happens because npm is using an old Node version in its path.

**Solution**: Use the batch file or run Vite directly:
```powershell
cd c:\Users\gideo\source\repos\FURLS\Dashboard\client
& "C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js
```

---

### Issue: "Port already in use"

**Solution**: Kill the processes using the ports
```powershell
# Find process using port 3002
netstat -ano | findstr :3002
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual process ID)
taskkill /PID <process_id> /F
```

---

### Issue: "Cannot find module" errors

**Solution**: Reinstall dependencies
```powershell
# Backend
cd c:\Users\gideo\source\repos\FURLS\Dashboard
npm install

# Frontend
cd c:\Users\gideo\source\repos\FURLS\Dashboard\client
npm install
```

---

## 📋 First-Time Setup Checklist

- [x] Node.js v24.13.0 installed ✓
- [x] Backend dependencies installed ✓
- [x] Frontend dependencies installed ✓
- [x] Database initialized ✓
- [x] Plugin data file accessible ✓
- [ ] Create user account (do this in the dashboard)
- [ ] Test with Rocket League freeplay

---

## 🎮 Using the Dashboard

### 1. First Login
1. Open http://localhost:5173
2. Click "Register" 
3. Create username and password
4. You'll be auto-logged in

### 2. Play Rocket League
1. Start Rocket League
2. Load the FURLS plugin (should auto-load)
3. Go to Freeplay
4. Play normally
5. Score goals or finish the session

### 3. View Your Stats
1. Dashboard auto-updates every 2 seconds
2. Stats auto-save to your account
3. View different tabs:
   - **Dashboard**: Overview
   - **Heatmap**: Shot locations
   - **History**: Past sessions
   - **Stats**: Detailed breakdown
   - **Friends**: Add friends
   - **Leaderboard**: Rankings

---

## 📊 Data Flow Reminder

```
Rocket League (FURLS Plugin)
    ↓ Exports on match end
furls_stats.json (BakkesMod data folder)
    ↓ Watched every 2 seconds
Backend Server (port 3002)
    ↓ Serves via API
Frontend Dashboard (port 5173)
    ↓ Auto-saves when logged in
Database (furls.db)
```

---

## 🔧 Advanced Configuration

### Change Ports
Edit `server/index.js` for backend:
```javascript
const PORT = 3002; // Change this
```

Edit `vite.config.js` for frontend:
```javascript
server: {
  port: 5173, // Change this
}
```

### Change Data Folder Path
Edit `server/index.js`:
```javascript
const DATA_FOLDER = path.join(process.env.APPDATA, 'bakkesmod/bakkesmod/data');
```

---

## 📞 Quick Commands

```powershell
# Check if running
netstat -ano | findstr "3002 5173"

# View plugin data file
Get-Content "$env:APPDATA\bakkesmod\bakkesmod\data\furls_stats.json"

# Test backend API
curl http://localhost:3002/api/stats/current

# View database
cd c:\Users\gideo\source\repos\FURLS\Dashboard
node -e "const db=require('./server/database.js');db.all('SELECT * FROM users',console.log)"
```

---

## ✅ System Status

- **Backend**: Running on port 3002 ✓
- **Frontend**: Running on port 5173 ✓
- **Database**: Initialized ✓
- **Plugin File**: Accessible ✓

**Dashboard URL**: http://localhost:5173

---

*For detailed information, see `DATA_FLOW_GUIDE.md` and `VERIFICATION_COMPLETE.md`*
