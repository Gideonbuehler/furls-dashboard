# FURLS Backend API

Node.js backend for the FURLS training stats platform.

## Features
- User authentication with JWT
- Stats upload from BakkesMod plugin
- Public player profiles
- Global leaderboards
- Friends system

## Environment Variables
- `PORT` - Server port (default: 3002)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (production/development)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/api-key` - Get API key for plugin
- `POST /api/auth/regenerate-api-key` - Generate new API key

### Stats Upload (Plugin)
- `POST /api/stats/upload` - Upload session stats (requires API key)

### Public
- `GET /api/public/profile/:username` - View player profile
- `GET /api/public/search?q=username` - Search players
- `GET /api/public/leaderboard/:stat` - Get leaderboard (shots/goals/accuracy/sessions)

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept friend request
- `DELETE /api/friends/:id` - Remove friend

## Deployment
Designed for deployment on Render.com with SQLite database.
