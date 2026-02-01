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
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Current Accuracy</h3>
            <div className="stat-value">{getCurrentAccuracy()}%</div>
            <div className="stat-detail">
              {currentStats?.goals || 0} / {currentStats?.shots || 0} shots
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Avg Speed</h3>
            <div className="stat-value">
              {currentStats?.averageSpeed?.toFixed(0) || 0}
            </div>
            <div className="stat-detail">units/s</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💨</div>
          <div className="stat-content">
            <h3>Boost Used</h3>
            <div className="stat-value">
              {currentStats?.boostUsed?.toFixed(0) || 0}
            </div>
            <div className="stat-detail">
              Total collected: {currentStats?.boostCollected?.toFixed(0) || 0}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Session Time</h3>
            <div className="stat-value">
              {formatTime(currentStats?.gameTime || 0)}
            </div>
            <div className="stat-detail">
              Possession: {currentStats?.possessionTime?.toFixed(1) || 0}s
            </div>
          </div>
        </div>
      </div>

      {allTimeStats && (
        <div className="all-time-stats">
          <h2>📊 All-Time Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card secondary">
              <h4>Total Sessions</h4>
              <div className="stat-value">{allTimeStats.totalSessions}</div>
            </div>
            <div className="stat-card secondary">
              <h4>Total Shots</h4>
              <div className="stat-value">{allTimeStats.totalShots}</div>
            </div>
            <div className="stat-card secondary">
              <h4>Total Goals</h4>
              <div className="stat-value">{allTimeStats.totalGoals}</div>
            </div>
            <div className="stat-card secondary">
              <h4>Average Accuracy</h4>
              <div className="stat-value">
                {allTimeStats.avgAccuracy?.toFixed(1)}%
              </div>
            </div>
            <div className="stat-card secondary">
              <h4>Average Speed</h4>
              <div className="stat-value">
                {allTimeStats.avgSpeed?.toFixed(0)}
              </div>
            </div>
            <div className="stat-card secondary">
              <h4>Total Play Time</h4>
              <div className="stat-value">
                {formatTime(allTimeStats.totalPlayTime)}
              </div>
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>📈 Accuracy Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="session" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#4CAF50"
                  fill="#4CAF5033"
                  name="Accuracy %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>⚽ Shots & Goals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="session" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="shots"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Shots"
                />
                <Line
                  type="monotone"
                  dataKey="goals"
                  stroke="#FF9800"
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
