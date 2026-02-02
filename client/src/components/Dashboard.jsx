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
} from "recharts";
import "./Dashboard.css";

function Dashboard({ currentStats, allTimeStats, sessionHistory }) {
  // Safe number formatter - ensures value is a number before calling toFixed
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
  // Prepare chart data from session history
  const chartData = sessionHistory.slice(-20).map((session, index) => ({
    session: index + 1,
    accuracy: session.shots > 0 ? (session.goals / session.shots) * 100 : 0,
    shots: session.shots || 0,
    goals: session.goals || 0,
    speed: session.averageSpeed || session.average_speed || 0,
  }));  return (
    <div className="dashboard">
      {/* Left Sidebar - Current Session Stats */}
      <div className="stats-sidebar">
        <h2 className="section-title">Current Session</h2>
        <div className="stats-list">
          <div className="stat-strip accent">
            <div className="stat-header">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Shot Accuracy</div>
            </div>
            <div className="stat-value">{getCurrentAccuracy()}%</div>
            <div className="stat-detail">
              {currentStats?.goals || 0} / {currentStats?.shots || 0} shots
            </div>
          </div>

          <div className="stat-strip primary">
            <div className="stat-header">
              <div className="stat-icon">⚡</div>
              <div className="stat-label">Average Speed</div>
            </div>
            <div className="stat-value">
              {currentStats?.averageSpeed?.toFixed(0) || 0}
            </div>
            <div className="stat-detail">units/s</div>
          </div>

          <div className="stat-strip success">
            <div className="stat-header">
              <div className="stat-icon">💨</div>
              <div className="stat-label">Boost Used</div>
            </div>
            <div className="stat-value">
              {currentStats?.boostUsed?.toFixed(0) || 0}
            </div>
            <div className="stat-detail">
              Collected: {currentStats?.boostCollected?.toFixed(0) || 0}
            </div>
          </div>

          <div className="stat-strip warning">
            <div className="stat-header">
              <div className="stat-icon">⏱️</div>
              <div className="stat-label">Session Time</div>
            </div>
            <div className="stat-value">
              {formatTime(currentStats?.gameTime || 0)}
            </div>
            <div className="stat-detail">
              Possession: {currentStats?.possessionTime?.toFixed(1) || 0}s
            </div>
          </div>
        </div>

        {allTimeStats && (
          <div className="all-time-section">
            <h2 className="section-title">All-Time Stats</h2>
            <div className="all-time-grid">
              <div className="summary-strip">
                <div className="summary-label">Total Sessions</div>
                <div className="summary-value">
                  {allTimeStats.totalSessions || allTimeStats.total_sessions || 0}
                </div>
              </div>
              <div className="summary-strip">
                <div className="summary-label">Total Shots</div>
                <div className="summary-value">
                  {allTimeStats.totalShots || allTimeStats.total_shots || 0}
                </div>
              </div>
              <div className="summary-strip">
                <div className="summary-label">Total Goals</div>
                <div className="summary-value">
                  {allTimeStats.totalGoals || allTimeStats.total_goals || 0}
                </div>
              </div>
              <div className="summary-strip">
                <div className="summary-label">Avg Accuracy</div>
                <div className="summary-value">
                  {safeToFixed(
                    allTimeStats?.avgAccuracy || allTimeStats?.avg_accuracy || 0
                  )}
                  %
                </div>
              </div>
              <div className="summary-strip">
                <div className="summary-label">Avg Speed</div>
                <div className="summary-value">
                  {safeToFixed(
                    allTimeStats?.avgSpeed || allTimeStats?.avg_speed || 0,
                    0
                  )}
                </div>
              </div>
              <div className="summary-strip">
                <div className="summary-label">Total Time</div>
                <div className="summary-value">
                  {formatTime(
                    allTimeStats.totalPlayTime ||
                      allTimeStats.total_play_time ||
                      0
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content - Charts */}
      <div className="main-content">
        {chartData.length > 0 ? (
          <div className="charts-section">
            <div className="chart-wrapper">
              <h3 className="chart-title">📈 Accuracy Progression</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(139, 92, 246, 0.1)"
                    />
                    <XAxis dataKey="session" stroke="rgba(255, 255, 255, 0.4)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.4)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 20, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="rgba(29, 233, 182, 0.8)"
                      fill="rgba(29, 233, 182, 0.15)"
                      name="Accuracy %"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-wrapper">
              <h3 className="chart-title">⚽ Shots & Goals</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(139, 92, 246, 0.1)"
                    />
                    <XAxis dataKey="session" stroke="rgba(255, 255, 255, 0.4)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.4)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 20, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="shots"
                      stroke="rgba(100, 181, 246, 0.8)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Shots"
                    />
                    <Line
                      type="monotone"
                      dataKey="goals"
                      stroke="rgba(255, 213, 79, 0.8)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Goals"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <h3>No session data yet</h3>
            <p>Start playing to see your stats!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
