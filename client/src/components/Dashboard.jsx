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
  }));
  return (
    <div className="dashboard">
      <h2 className="section-title">Current Session</h2>
      
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-card-header">
            <div className="stat-icon">🎯</div>
          </div>
          <div className="stat-label">Shot Accuracy</div>
          <div className="stat-value">{getCurrentAccuracy()}%</div>
          <div className="stat-detail">
            {currentStats?.goals || 0} / {currentStats?.shots || 0} shots
          </div>
        </div>        <div className="stat-card primary">
          <div className="stat-card-header">
            <div className="stat-icon">⚡</div>
          </div>
          <div className="stat-label">Average Speed</div>
          <div className="stat-value">
            {currentStats?.averageSpeed?.toFixed(0) || 0}
          </div>
          <div className="stat-detail">units/s</div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-card-header">
            <div className="stat-icon">💨</div>
          </div>
          <div className="stat-label">Boost Used</div>
          <div className="stat-value">
            {currentStats?.boostUsed?.toFixed(0) || 0}
          </div>
          <div className="stat-detail">
            Collected: {currentStats?.boostCollected?.toFixed(0) || 0}
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-card-header">
            <div className="stat-icon">⏱️</div>
          </div>
          <div className="stat-label">Session Time</div>
          <div className="stat-value">
            {formatTime(currentStats?.gameTime || 0)}
          </div>
          <div className="stat-detail">
            Possession: {currentStats?.possessionTime?.toFixed(1) || 0}s
          </div>
        </div>
      </div>      {allTimeStats && (
        <div className="all-time-stats">
          <h2 className="section-title">All-Time Statistics</h2>
          <div className="all-time-grid">
            <div className="summary-card">
              <div className="summary-label">Total Sessions</div>
              <div className="summary-value">{allTimeStats.totalSessions}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Shots</div>
              <div className="summary-value">{allTimeStats.totalShots}</div>            </div>
            <div className="summary-card">
              <div className="summary-label">Total Goals</div>
              <div className="summary-value">{allTimeStats.totalGoals}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average Accuracy</div>
              <div className="summary-value">
                {allTimeStats.avgAccuracy?.toFixed(1)}%
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average Speed</div>
              <div className="summary-value">
                {allTimeStats.avgSpeed?.toFixed(0)}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Play Time</div>
              <div className="summary-value">
                {formatTime(allTimeStats.totalPlayTime)}
              </div>
            </div>
          </div>
        </div>
      )}      {chartData.length > 0 && (
        <div className="charts-container">
          <div className="chart-card">
            <h3 className="chart-title">📈 Accuracy Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" />
                <XAxis dataKey="session" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--surface-3)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--accent-secondary)"
                  fill="rgba(29, 233, 182, 0.2)"
                  name="Accuracy %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">⚽ Shots & Goals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" />
                <XAxis dataKey="session" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--surface-3)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="shots"
                  stroke="var(--primary-500)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Shots"
                />
                <Line
                  type="monotone"
                  dataKey="goals"
                  stroke="var(--accent-warning)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Goals"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
