# 🚗⚽ FURLS Dashboard with User Accounts & Friends

Complete training statistics dashboard for Rocket League with user authentication, friends system, and leaderboards!

## ✨ Features

### 🔐 User System

- **User Registration & Login** - Secure authentication with JWT tokens
- **Personal Stats Tracking** - All your training sessions saved to your account
- **Privacy Controls** - Control who can see your stats (public/friends/private)

### 👥 Friends & Social

- **Add Friends** - Search for users and send friend requests
- **Friends List** - See all your friends and their stats
- **Friend Stats** - View your friends' training progress
- **Friend Requests** - Accept or decline incoming friend requests

### 🏆 Leaderboards

- **Friends Leaderboard** - Compete with your friends
- **Global Leaderboard** - See how you rank against everyone
- **Multiple Stats** - Sort by accuracy, total goals, or total shots

### 📊 Real-Time Dashboard

- **Live Stats** - Auto-updates from BakkesMod every 2 seconds
- **Session History** - Track your training progress over time
- **Heatmaps** - Visual shot and goal location data
- **Charts** - Accuracy and performance trends

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- BakkesMod with FURLS plugin installed
- Rocket League

### Installation

1. **Navigate to Dashboard folder**

   ```powershell
   cd c:\Users\gideo\source\repos\FURLS\Dashboard
   ```

2. **Install dependencies** (if not already done)

   ```powershell
   npm install
   cd client
   npm install
   cd ..
   ```

3. **Create environment file** (optional)

   ```powershell
   copy .env.example .env
   ```

   Edit `.env` and change `JWT_SECRET` to a random string

4. **Start the dashboard**

   ```powershell
   # Option 1: Use the start script (recommended)
   .\start-simple.bat

   # Option 2: Manual start
   # Terminal 1 - Backend
   node server/index.js

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Open in browser**
   - Frontend: http://localhost:5173/
   - Backend API: http://localhost:3002/

## 📖 How to Use

### First Time Setup

1. **Register an Account**

   - Open http://localhost:5173/
   - Click "Register"
   - Create your username, email, and password
   - You'll be automatically logged in

2. **Play Rocket League**

   - Start Rocket League with BakkesMod loaded
   - Play training or freeplay
   - Your stats will automatically export to the dashboard

3. **View Your Stats**
   - Dashboard auto-refreshes every 2 seconds
   - All sessions are automatically saved to your account
   - View your progress over time in the History tab

### Adding Friends

1. Go to the **Friends** tab (👥)
2. Click "Add Friends"
3. Search for username
4. Click "Add Friend"
5. They'll receive a friend request

### Viewing Friend Stats

1. Go to **Friends** tab
2. Click "View Stats" on any friend
3. See their training progress (if they allow it)

### Leaderboards

1. Go to **Leaderboard** tab (🏆)
2. Choose "Friends Only" or "Global"
3. Sort by Accuracy, Goals, or Shots
4. See where you rank!

## 🗄️ Database Structure

The system uses SQLite database with the following tables:

### Users

- User accounts with authentication
- Display names and avatars
- Privacy settings

### Sessions

- All training sessions linked to users
- Full statistics and heatmap data
- Timestamps for history tracking

### Friendships

- Friend relationships
- Request status (pending/accepted/rejected)

### User Settings

- Privacy controls
- Theme preferences
- Notification settings

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile

### Friends

- `GET /api/friends` - Get friends list
- `GET /api/friends/requests` - Get pending requests
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept request
- `DELETE /api/friends/:id` - Remove friend
- `GET /api/friends/search?q=username` - Search users

### Stats

- `POST /api/user/stats/save` - Save session to account
- `GET /api/user/stats/history` - Get user's sessions
- `GET /api/user/stats/alltime` - Get all-time stats
- `GET /api/user/stats/friend/:id` - Get friend's stats
- `GET /api/user/stats/leaderboard` - Get leaderboard

### Legacy (Local File Access)

- `GET /api/stats/current` - Current BakkesMod session
- `GET /api/stats/history` - Local session history
- `GET /api/heatmap` - Current heatmap data

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the Dashboard root:

```env
JWT_SECRET=your-random-secret-key-here
PORT=3002
DB_PATH=./server/furls.db
```

### Privacy Settings

Users can control who sees their stats:

- **Public** - Anyone can see
- **Friends** - Only friends can see
- **Private** - Nobody can see

## 📁 File Structure

```
Dashboard/
├── server/
│   ├── index.js              # Main server file
│   ├── database.js           # Database setup
│   ├── auth.js               # JWT authentication
│   ├── furls.db              # SQLite database (created automatically)
│   └── routes/
│       ├── auth.js           # Auth endpoints
│       ├── friends.js        # Friends endpoints
│       └── stats.js          # Stats endpoints
├── client/
│   └── src/
│       ├── App.jsx           # Main React app
│       ├── services/
│       │   └── api.js        # API client
│       └── components/
│           ├── Login.jsx     # Login form
│           ├── Register.jsx  # Registration form
│           ├── Friends.jsx   # Friends management
│           ├── Leaderboard.jsx # Leaderboard view
│           ├── Dashboard.jsx # Stats dashboard
│           ├── Heatmap.jsx   # Heatmap visualization
│           └── ...
├── package.json
└── .env.example
```

## 🛡️ Security

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens for secure authentication
- SQL injection protection with parameterized queries
- CORS enabled for local development
- Input validation on all endpoints

## 🐛 Troubleshooting

### Can't login/register

- Make sure backend server is running on port 3002
- Check browser console for errors
- Verify JWT_SECRET is set

### Friends not showing

- Ensure both users are registered
- Check that friend request was accepted
- Verify database exists in `server/furls.db`

### Stats not saving

- Make sure you're logged in
- Check that BakkesMod is exporting data
- Verify backend server can access the database

### Port already in use

- Close existing Node processes
- Or change PORT in `.env` file

## 📝 TODO / Future Features

- [ ] Avatar upload
- [ ] Profile customization
- [ ] Team/clan system
- [ ] Training challenges
- [ ] Achievements and badges
- [ ] Direct messaging
- [ ] Training pack sharing
- [ ] Mobile app
- [ ] Discord integration

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📄 License

MIT License - See main FURLS project for details

---

**Happy Training! 🚗💨⚽**
