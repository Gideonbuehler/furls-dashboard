import { useState, useEffect } from "react";
import "./styles/theme.css";
import "./styles/App.css";
import "./styles/components.css";
import "./styles/buttons-inputs.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Heatmap from "./components/Heatmap";
import SessionHistory from "./components/SessionHistory";
import StatsOverview from "./components/StatsOverview";
import Friends from "./components/Friends";
import Leaderboard from "./components/Leaderboard";
import Settings from "./components/Settings";
import PlayerSearch from "./components/PlayerSearch";
import ProfileModal from "./components/ProfileModal";
import { authAPI, statsAPI } from "./services/api";

function App() {
  const [user, setUser] = useState(authAPI.getCurrentUser());
  const [showAuth, setShowAuth] = useState(!authAPI.isAuthenticated());
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [currentStats, setCurrentStats] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [pluginConnected, setPluginConnected] = useState(false);

  useEffect(() => {
    if (!showAuth) {
      // Verify token is valid before loading data
      verifyAuthAndLoadData();

      // Poll for updates every 2 seconds
      const interval = setInterval(() => {
        loadAllData();
        checkPluginConnection();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [showAuth]);

  const verifyAuthAndLoadData = async () => {
    try {
      // First verify the token is valid
      await authAPI.getProfile();
      // If successful, load all data
      await loadAllData();
      checkPluginConnection();
    } catch (error) {
      // If token verification fails, logout and show login
      console.error("Token verification failed:", error);
      handleLogout();
    }
  };

  const checkPluginConnection = async () => {
    try {
      if (!authAPI.isAuthenticated()) {
        setPluginConnected(false);
        return;
      }

      const response = await statsAPI.getPluginStatus();
      setPluginConnected(response.data.connected);
    } catch (error) {
      // If user has no API key yet, this will fail - that's okay
      setPluginConnected(false);
    }
  };

  const loadAllData = async () => {
    try {
      // Only load data if authenticated
      if (!authAPI.isAuthenticated()) {
        setLoading(false);
        return;
      }

      // Load user's database stats
      const userHistoryRes = await statsAPI.getHistory(50, 0);
      const userAllTimeRes = await statsAPI.getAllTimeStats();
      const userHeatmapRes = await statsAPI.getHeatmap();

      // Use database stats for history and all-time
      if (userHistoryRes?.data) {
        setSessionHistory(userHistoryRes.data);

        // Set the most recent session as "current stats"
        if (userHistoryRes.data.length > 0) {
          const latestSession = userHistoryRes.data[0];
          setCurrentStats({
            shots: latestSession.shots || 0,
            goals: latestSession.goals || 0,
            averageSpeed: latestSession.average_speed || 0,
            speedSamples: latestSession.speed_samples || 0,
            boostCollected: latestSession.boost_collected || 0,
            boostUsed: latestSession.boost_used || 0,
            gameTime: latestSession.game_time || 0,
            possessionTime: latestSession.possession_time || 0,
            teamPossessionTime: latestSession.team_possession_time || 0,
            opponentPossessionTime: latestSession.opponent_possession_time || 0,
          });
        }
      }

      if (userAllTimeRes?.data) {
        setAllTimeStats(userAllTimeRes.data);
      }

      // Load aggregated heatmap data
      if (userHeatmapRes?.data) {
        setHeatmapData(userHeatmapRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
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
    setAuthMode("login");
  };

  if (showAuth) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          {authMode === "login" ? (
            <>
              <Login onLogin={handleLogin} />
              <div className="auth-switch">
                Don't have an account?{" "}
                <button onClick={() => setAuthMode("register")}>
                  Register
                </button>
              </div>
            </>
          ) : (
            <>
              <Register onRegister={handleRegister} />
              <div className="auth-switch">
                Already have an account?{" "}
                <button onClick={() => setAuthMode("login")}>Login</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "heatmap", name: "Heatmap", icon: "🔥" },
    { id: "history", name: "History", icon: "📈" },
    { id: "stats", name: "Stats", icon: "📋" },
    { id: "friends", name: "Friends", icon: "👥" },
    { id: "leaderboard", name: "Leaderboard", icon: "🏆" },
    { id: "search", name: "Search", icon: "🔍" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <svg className="logo-svg" viewBox="0 0 210 40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#bb86fc', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#7b1fa2', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              {/* FURLS Text */}
              <text x="5" y="28" 
                    fontFamily="Arial, sans-serif" 
                    fontSize="28" 
                    fontWeight="bold" 
                    fill="url(#logoGradient)"
                    letterSpacing="2">
                FURLS
              </text>
              {/* Speed lines after S */}
              <line x1="145" y1="12" x2="200" y2="12" stroke="#bb86fc" strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
              <line x1="145" y1="20" x2="190" y2="20" stroke="#bb86fc" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
              <line x1="145" y1="28" x2="195" y2="28" stroke="#bb86fc" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </h1>

          <div className="user-info">
            <div className="connection-status">
              <span
                className={`status-indicator ${
                  pluginConnected ? "connected" : "disconnected"
                }`}
              ></span>
              <span>
                {pluginConnected ? "Plugin Connected" : "Plugin Offline"}
              </span>
            </div>

            <div
              className="user-avatar clickable"
              onClick={() => setShowProfileModal(true)}
              title="Edit Profile"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="avatar-image"
                />
              ) : (
                (user?.displayName || user?.username || "U")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <nav className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
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
            <p className="loading-text">Loading training data...</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <Dashboard
                currentStats={currentStats}
                allTimeStats={allTimeStats}
                sessionHistory={sessionHistory}
              />
            )}
            {activeTab === "heatmap" && (
              <Heatmap heatmapData={heatmapData} currentStats={currentStats} />
            )}
            {activeTab === "history" && (
              <SessionHistory sessionHistory={sessionHistory} />
            )}{" "}
            {activeTab === "stats" && (
              <StatsOverview
                currentStats={currentStats}
                allTimeStats={allTimeStats}
              />
            )}
            {activeTab === "friends" && <Friends />}
            {activeTab === "leaderboard" && <Leaderboard />}
            {activeTab === "search" && <PlayerSearch />}
            {activeTab === "settings" && <Settings />}
          </>
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </div>
  );
}

export default App;
