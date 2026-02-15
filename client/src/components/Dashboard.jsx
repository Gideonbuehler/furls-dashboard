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

  // Convert Unreal Units/second to MPH
  const convertToMPH = (unrealSpeed) => {
    const mph = unrealSpeed * 0.02237;
    return Math.round(mph);
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

  // Prepare chart data from session history
  const chartData = sessionHistory.slice(-20).map((session, index) => ({
    session: index + 1,
    accuracy: session.shots > 0 ? (session.goals / session.shots) * 100 : 0,
    shots: session.shots || 0,
    goals: session.goals || 0,
    speed: convertToMPH(session.averageSpeed || session.average_speed || 0),
  }));

  // Get most recent session with metadata
  const latestSession = sessionHistory.length > 0 ? sessionHistory[0] : null;
  const hasMatchMetadata =
    latestSession &&
    (latestSession.playlist || latestSession.is_ranked || latestSession.mmr);

  // Recharts tooltip style
  const tooltipStyle = {
    backgroundColor: "rgba(10, 13, 18, 0.96)",
    border: "1px solid rgba(74, 158, 255, 0.35)",
    borderRadius: "0",
    padding: "10px 14px",
    boxShadow: "0 0 20px rgba(74, 158, 255, 0.1)",
  };
  const tooltipLabelStyle = {
    color: "#fff",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginBottom: "6px",
  };

  return (
    <div className="dashboard-terminal">
      {/* Corner decorations */}
      <div className="corner-decor top-left" />
      <div className="corner-decor bottom-right" />

      {/* Header */}
      <div className="terminal-header">
        <h1>DASHBOARD</h1>
        <div className="terminal-subtitle">// LIVE SESSION DATA //</div>
      </div>

      {/* Match Metadata Banner */}
      {hasMatchMetadata && (
        <div className="match-details-header">
          {latestSession.playlist && (
            <div className="meta-badge">
              <span className="meta-icon">PLAYLIST</span>
              <span className="meta-val">{latestSession.playlist}</span>
            </div>
          )}
          {latestSession.is_ranked === 1 && (
            <div className="meta-badge ranked-badge">
              <span className="meta-icon">MODE</span>
              <span className="meta-val">RANKED</span>
            </div>
          )}
          {latestSession.mmr !== null && latestSession.mmr !== undefined && (
            <div className="meta-badge">
              <span className="meta-icon">MMR</span>
              <span className="meta-val">{Math.round(latestSession.mmr)}</span>
            </div>
          )}
          {latestSession.mmr_change !== null &&
            latestSession.mmr_change !== undefined && (
              <div
                className={`meta-badge ${
                  latestSession.mmr_change >= 0
                    ? "mmr-positive"
                    : "mmr-negative"
                }`}
              >
                <span className="meta-icon">DELTA</span>
                <span className="meta-val">
                  {latestSession.mmr_change >= 0 ? "+" : ""}
                  {Math.round(latestSession.mmr_change)}
                </span>
              </div>
            )}
        </div>
      )}

      {/* Hero Stats — 4 match-stat-cards */}
      <h2 className="section-title">Current Session</h2>
      <div className="match-stats-grid">
        <div className="match-stat-card">
          <span className="card-icon">SYS.01</span>
          <div className="card-title">Shot Accuracy</div>
          <div className="card-value">{getCurrentAccuracy()}%</div>
          <div className="card-subtext">
            {currentStats?.goals || 0} goals from {currentStats?.shots || 0}{" "}
            shots
          </div>
        </div>

        <div className="match-stat-card">
          <span className="card-icon">SYS.02</span>
          <div className="card-title">Average Speed</div>
          <div className="card-value">
            {convertToMPH(currentStats?.averageSpeed || 0)}
          </div>
          <div className="card-subtext">mph</div>
        </div>

        <div className="match-stat-card">
          <span className="card-icon">SYS.03</span>
          <div className="card-title">Boost Usage</div>
          <div className="card-value">
            {currentStats?.boostUsed?.toFixed(0) || 0}
          </div>
          <div className="card-subtext">
            {currentStats?.boostCollected?.toFixed(0) || 0} collected
          </div>
        </div>

        <div className="match-stat-card">
          <span className="card-icon">SYS.04</span>
          <div className="card-title">Session Time</div>
          <div className="card-value">
            {formatTime(currentStats?.gameTime || 0)}
          </div>
          <div className="card-subtext">
            {currentStats?.possessionTime?.toFixed(1) || 0}s possession
          </div>
        </div>
      </div>

      {/* All-Time Summary Stats */}
      {allTimeStats && (
        <>
          <h2 className="section-title">All-Time Summary</h2>
          <div className="match-summary-stats">
            <div className="summary-stat-item">
              <div className="sum-label">Sessions</div>
              <div className="sum-value">
                {allTimeStats.totalSessions || allTimeStats.total_sessions || 0}
              </div>
            </div>
            <div className="summary-stat-item">
              <div className="sum-label">Shots</div>
              <div className="sum-value">
                {allTimeStats.totalShots || allTimeStats.total_shots || 0}
              </div>
            </div>
            <div className="summary-stat-item">
              <div className="sum-label">Goals</div>
              <div className="sum-value">
                {allTimeStats.totalGoals || allTimeStats.total_goals || 0}
              </div>
            </div>
            <div className="summary-stat-item">
              <div className="sum-label">Accuracy</div>
              <div className="sum-value">
                {safeToFixed(
                  allTimeStats?.avgAccuracy || allTimeStats?.avg_accuracy || 0
                )}
                %
              </div>
            </div>
            <div className="summary-stat-item">
              <div className="sum-label">Playtime</div>
              <div className="sum-value">
                {formatPlayTime(
                  allTimeStats.totalPlayTime ||
                    allTimeStats.total_play_time ||
                    0
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts Section */}
      {chartData.length > 0 ? (
        <>
          <h2 className="section-title">Performance Analysis</h2>
          <div className="charts-terminal-grid">
            {/* Accuracy Trend */}
            <div className="chart-terminal-card">
              <div className="chart-terminal-header">
                <h3 className="chart-terminal-title">Accuracy Trend</h3>
                <span className="chart-terminal-sub">Last 20 sessions</span>
              </div>
              <div className="chart-terminal-body">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="accuracyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4a9eff"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4a9eff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(74, 158, 255, 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="session"
                      stroke="rgba(255, 255, 255, 0.15)"
                      tick={{
                        fill: "rgba(255, 255, 255, 0.35)",
                        fontSize: 11,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(74, 158, 255, 0.15)" }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.15)"
                      tick={{
                        fill: "rgba(255, 255, 255, 0.35)",
                        fontSize: 11,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(74, 158, 255, 0.15)" }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={{
                        color: "#4a9eff",
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "0.85rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#4a9eff"
                      strokeWidth={2}
                      fill="url(#accuracyGradient)"
                      name="Accuracy %"
                      dot={{
                        fill: "#4a9eff",
                        strokeWidth: 0,
                        r: 3,
                      }}
                      activeDot={{ r: 5, strokeWidth: 0, fill: "#4a9eff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shots vs Goals */}
            <div className="chart-terminal-card">
              <div className="chart-terminal-header">
                <h3 className="chart-terminal-title">Performance Breakdown</h3>
                <span className="chart-terminal-sub">Shots vs Goals</span>
              </div>
              <div className="chart-terminal-body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255, 77, 125, 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="session"
                      stroke="rgba(255, 255, 255, 0.15)"
                      tick={{
                        fill: "rgba(255, 255, 255, 0.35)",
                        fontSize: 11,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(255, 77, 125, 0.15)" }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.15)"
                      tick={{
                        fill: "rgba(255, 255, 255, 0.35)",
                        fontSize: 11,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(255, 77, 125, 0.15)" }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      cursor={{ fill: "rgba(255, 77, 125, 0.06)" }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "16px",
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "0.8rem",
                        letterSpacing: "0.05em",
                      }}
                      iconType="square"
                    />
                    <Bar
                      dataKey="shots"
                      fill="rgba(74, 158, 255, 0.7)"
                      radius={[2, 2, 0, 0]}
                      name="Shots"
                    />
                    <Bar
                      dataKey="goals"
                      fill="rgba(255, 77, 125, 0.7)"
                      radius={[2, 2, 0, 0]}
                      name="Goals"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Speed Analysis — Full Width */}
            <div className="chart-terminal-card full-width">
              <div className="chart-terminal-header">
                <h3 className="chart-terminal-title">Speed Analysis</h3>
                <span className="chart-terminal-sub">
                  Avg speed per session
                </span>
              </div>
              <div className="chart-terminal-body">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="speedGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#9d5bd2" />
                        <stop offset="100%" stopColor="#4a9eff" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(157, 91, 210, 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="session"
                      stroke="rgba(255, 255, 255, 0.15)"
                      tick={{
                        fill: "rgba(255, 255, 255, 0.35)",
                        fontSize: 11,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(157, 91, 210, 0.15)" }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.15)"
                      tick={{
                        fill: "rgba(255, 255, 255, 0.35)",
                        fontSize: 11,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                      axisLine={{ stroke: "rgba(157, 91, 210, 0.15)" }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                    />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      stroke="url(#speedGradient)"
                      strokeWidth={2}
                      dot={{
                        fill: "#9d5bd2",
                        strokeWidth: 0,
                        r: 3,
                      }}
                      activeDot={{ r: 5, strokeWidth: 0, fill: "#9d5bd2" }}
                      name="Speed (mph)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data-terminal">
          <p>// NO SESSION DATA AVAILABLE //</p>
          <p className="dim">
            Start playing Rocket League to populate the terminal.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
