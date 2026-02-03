import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./Dashboard.css";

function Dashboard({ currentStats, allTimeStats, sessionHistory }) {
  // Safe number formatter
  const safeToFixed = (value, decimals = 1) => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toFixed(decimals);
  };

  const getCurrentAccuracy = () => {
    if (!currentStats || !currentStats.shots) return 0;
    return currentStats.shots > 0
      ? ((currentStats.goals / currentStats.shots) * 100).toFixed(1)
      : 0;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Prepare chart data from session history  const chartData = sessionHistory.slice(-20).map((session, index) => ({
    session: index + 1,
    accuracy: session.shots > 0 ? (session.goals / session.shots) * 100 : 0,
    shots: session.shots || 0,
    goals: session.goals || 0,
    speed: session.averageSpeed || session.average_speed || 0,
  }));

  // Get most recent session with metadata
  const latestSession = sessionHistory.length > 0 ? sessionHistory[0] : null;
  const hasMatchMetadata = latestSession && (latestSession.playlist || latestSession.is_ranked || latestSession.mmr);
  
  return (
    <div className="dashboard-modern">
      {/* Match Metadata Banner - Shows if we have playlist/MMR info */}
      {hasMatchMetadata && (
        <div className="match-metadata-banner">
          {latestSession.playlist && (
            <div className="metadata-item">
              <span className="metadata-icon">🎮</span>
              <span className="metadata-label">Playlist:</span>
              <span className="metadata-value">{latestSession.playlist}</span>
            </div>
          )}
          {latestSession.is_ranked === 1 && (
            <div className="metadata-item ranked">
              <span className="metadata-icon">🏆</span>
              <span className="metadata-value">Ranked</span>
            </div>
          )}
          {latestSession.mmr !== null && latestSession.mmr !== undefined && (
            <div className="metadata-item">
              <span className="metadata-icon">📊</span>
              <span className="metadata-label">MMR:</span>
              <span className="metadata-value">{Math.round(latestSession.mmr)}</span>
            </div>
          )}
          {latestSession.mmr_change !== null && latestSession.mmr_change !== undefined && (
            <div className={`metadata-item mmr-change ${latestSession.mmr_change >= 0 ? 'positive' : 'negative'}`}>
              <span className="metadata-icon">{latestSession.mmr_change >= 0 ? '📈' : '📉'}</span>
              <span className="metadata-value">
                {latestSession.mmr_change >= 0 ? '+' : ''}{Math.round(latestSession.mmr_change)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hero Stats - Top Section */}
      <div className="hero-stats">
        <div className="hero-card accuracy">
          <div className="hero-icon">🎯</div>
          <div className="hero-content">
            <div className="hero-label">Shot Accuracy</div>
            <div className="hero-value">{getCurrentAccuracy()}%</div>
            <div className="hero-detail">
              {currentStats?.goals || 0} goals from {currentStats?.shots || 0} shots
            </div>
          </div>
        </div>

        <div className="hero-card speed">
          <div className="hero-icon">⚡</div>
          <div className="hero-content">
            <div className="hero-label">Average Speed</div>
            <div className="hero-value">
              {currentStats?.averageSpeed?.toFixed(0) || 0}
            </div>
            <div className="hero-detail">units per second</div>
          </div>
        </div>

        <div className="hero-card boost">
          <div className="hero-icon">🔋</div>
          <div className="hero-content">
            <div className="hero-label">Boost Usage</div>
            <div className="hero-value">
              {currentStats?.boostUsed?.toFixed(0) || 0}
            </div>
            <div className="hero-detail">
              {currentStats?.boostCollected?.toFixed(0) || 0} collected
            </div>
          </div>
        </div>

        <div className="hero-card time">
          <div className="hero-icon">⏱️</div>
          <div className="hero-content">
            <div className="hero-label">Session Time</div>
            <div className="hero-value">
              {formatTime(currentStats?.gameTime || 0)}
            </div>
            <div className="hero-detail">
              {currentStats?.possessionTime?.toFixed(1) || 0}s possession
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Quick Stats */}
      {allTimeStats && (
        <div className="quick-stats-bar">
          <div className="quick-stat">
            <span className="quick-label">Sessions</span>
            <span className="quick-value">
              {allTimeStats.totalSessions || allTimeStats.total_sessions || 0}
            </span>
          </div>
          <div className="quick-stat-divider"></div>
          <div className="quick-stat">
            <span className="quick-label">Shots</span>
            <span className="quick-value">
              {allTimeStats.totalShots || allTimeStats.total_shots || 0}
            </span>
          </div>
          <div className="quick-stat-divider"></div>
          <div className="quick-stat">
            <span className="quick-label">Goals</span>
            <span className="quick-value">
              {allTimeStats.totalGoals || allTimeStats.total_goals || 0}
            </span>
          </div>
          <div className="quick-stat-divider"></div>
          <div className="quick-stat">
            <span className="quick-label">All-Time Accuracy</span>
            <span className="quick-value">
              {safeToFixed(
                allTimeStats?.avgAccuracy || allTimeStats?.avg_accuracy || 0
              )}
              %
            </span>
          </div>
          <div className="quick-stat-divider"></div>
          <div className="quick-stat">
            <span className="quick-label">Total Playtime</span>
            <span className="quick-value">
              {formatPlayTime(
                allTimeStats.totalPlayTime ||
                  allTimeStats.total_play_time ||
                  0
              )}
            </span>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {chartData.length > 0 ? (
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">
                <span className="chart-icon">📊</span>
                Accuracy Trend
              </h3>
              <span className="chart-subtitle">Last 20 sessions</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1de9b6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1de9b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="session"
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 15, 0.98)",
                      border: "1px solid rgba(29, 233, 182, 0.3)",
                      borderRadius: "12px",
                      padding: "12px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: "8px" }}
                    itemStyle={{ color: "#1de9b6", fontSize: "14px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#1de9b6"
                    strokeWidth={3}
                    fill="url(#accuracyGradient)"
                    name="Accuracy %"
                    dot={{ fill: "#1de9b6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">
                <span className="chart-icon">⚽</span>
                Performance Breakdown
              </h3>
              <span className="chart-subtitle">Shots vs Goals</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="session"
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 15, 0.98)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "12px",
                      padding: "12px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: "8px" }}
                    cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="shots"
                    fill="rgba(100, 181, 246, 0.8)"
                    radius={[8, 8, 0, 0]}
                    name="Shots"
                  />
                  <Bar
                    dataKey="goals"
                    fill="rgba(255, 213, 79, 0.8)"
                    radius={[8, 8, 0, 0]}
                    name="Goals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card full-width">
            <div className="chart-header">
              <h3 className="chart-title">
                <span className="chart-icon">🚀</span>
                Speed Analysis
              </h3>
              <span className="chart-subtitle">Average speed per session</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#bb86fc" />
                      <stop offset="100%" stopColor="#64b5f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="session"
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 15, 0.98)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "12px",
                      padding: "12px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="url(#speedGradient)"
                    strokeWidth={3}
                    dot={{ fill: "#bb86fc", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Speed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state-modern">
          <div className="empty-icon">📊</div>
          <h3>No Session Data Yet</h3>
          <p>Start playing Rocket League to see your stats and progression here!</p>
          <p className="empty-hint">
            Make sure the FURLS plugin is installed and configured correctly.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
