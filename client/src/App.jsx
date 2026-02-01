import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Heatmap from './components/Heatmap';
import SessionHistory from './components/SessionHistory';
import StatsOverview from './components/StatsOverview';
import Friends from './components/Friends';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import PlayerSearch from './components/PlayerSearch';
import { authAPI, localStatsAPI, statsAPI } from './services/api';

function App() {
  const [user, setUser] = useState(authAPI.getCurrentUser());
  const [showAuth, setShowAuth] = useState(!authAPI.isAuthenticated());
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  const [currentStats, setCurrentStats] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!showAuth) {
      // Initial load
      loadAllData();

      // Poll for updates every 2 seconds
      const interval = setInterval(() => {
        loadAllData();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [showAuth]);

  const loadAllData = async () => {
    try {
      // Load local stats file (current session from BakkesMod)
      const [currentRes, localHistoryRes, localAllTimeRes, heatmapRes, healthRes] = await Promise.all([
        localStatsAPI.getCurrent().catch(() => null),
        localStatsAPI.getHistory().catch(() => ({ data: [] })),
        localStatsAPI.getAllTime().catch(() => null),
        localStatsAPI.getHeatmap().catch(() => null),
        localStatsAPI.getHealth().catch(() => null)
      ]);

      // Set current session (from BakkesMod file)
      if (currentRes?.data) {
        setCurrentStats(currentRes.data);
        
        // Auto-save to user's account if authenticated and new session
        if (authAPI.isAuthenticated() && currentRes.data.timestamp) {
          statsAPI.saveSession(currentRes.data).catch(err => 
            console.log('Could not save session:', err)
          );
        }
      }

      // Load user's database stats if authenticated
      if (authAPI.isAuthenticated()) {
        try {
          // Get user's session history from database
          const userHistoryRes = await statsAPI.getHistory(50, 0);
          const userAllTimeRes = await statsAPI.getAllTimeStats();
          
          // Use database stats for history and all-time
          if (userHistoryRes?.data) {
            setSessionHistory(userHistoryRes.data);
          }
          if (userAllTimeRes?.data) {
            setAllTimeStats(userAllTimeRes.data);
          }
        } catch (err) {
          console.log('Could not load user stats, using local:', err);
          // Fallback to local stats if database fails
          if (localHistoryRes?.data) setSessionHistory(localHistoryRes.data);
          if (localAllTimeRes?.data) setAllTimeStats(localAllTimeRes.data);
        }
      } else {
        // Not authenticated - use local file stats
        if (localHistoryRes?.data) setSessionHistory(localHistoryRes.data);
        if (localAllTimeRes?.data) setAllTimeStats(localAllTimeRes.data);
      }

      // Heatmap always from local file
      if (heatmapRes?.data) setHeatmapData(heatmapRes.data);
      if (healthRes?.data) setConnected(healthRes.data.status === 'ok');
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setConnected(false);
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setShowAuth(true);
    setAuthMode('login');
  };

  if (showAuth) {
    return (
      <div className="app">
        {authMode === 'login' ? (
          <>
            <Login onLogin={handleLogin} />
            <div className="auth-switch">
              Don't have an account?{' '}
              <button onClick={() => setAuthMode('register')}>Register</button>
            </div>
          </>
        ) : (
          <>
            <Register onRegister={handleRegister} />
            <div className="auth-switch">
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')}>Login</button>
            </div>
          </>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: '📊 Dashboard', icon: '📊' },
    { id: 'heatmap', name: '🔥 Heatmap', icon: '🔥' },
    { id: 'history', name: '📈 History', icon: '📈' },
    { id: 'stats', name: '📋 Stats', icon: '📋' },
    { id: 'friends', name: '👥 Friends', icon: '👥' },
    { id: 'leaderboard', name: '🏆 Leaderboard', icon: '🏆' },
    { id: 'search', name: '🔍 Search Players', icon: '🔍' },
    { id: 'settings', name: '⚙️ Settings', icon: '⚙️' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🚗 FURLS Training Dashboard</h1>
          <div className="user-section">
            <span className="welcome-text">Welcome, {user?.displayName || user?.username}!</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="connection-status">
          <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></span>
          <span>{connected ? 'Connected to BakkesMod' : 'Disconnected'}</span>
        </div>
        <nav className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading training data...</p>
          </div>
        ) : !connected ? (
          <div className="error-message">
            <h2>⚠️ Not Connected</h2>
            <p>Make sure the FURLS plugin is running and exporting data.</p>
            <p>The server should be watching: <code>%APPDATA%\bakkesmod\bakkesmod\data</code></p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                currentStats={currentStats}
                allTimeStats={allTimeStats}
                sessionHistory={sessionHistory}
              />
            )}
            {activeTab === 'heatmap' && (
              <Heatmap 
                heatmapData={heatmapData}
                currentStats={currentStats}
              />
            )}
            {activeTab === 'history' && (
              <SessionHistory sessionHistory={sessionHistory} />
            )}            {activeTab === 'stats' && (
              <StatsOverview
                currentStats={currentStats}
                allTimeStats={allTimeStats}
              />
            )}
            {activeTab === 'friends' && <Friends />}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'search' && <PlayerSearch />}
            {activeTab === 'settings' && <Settings />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
