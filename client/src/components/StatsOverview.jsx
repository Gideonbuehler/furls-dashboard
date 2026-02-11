import "./StatsOverview.css";

function StatsOverview({ currentStats, allTimeStats }) {
  // Safe number formatter - ensures value is a number before calling toFixed
  const safeToFixed = (value, decimals = 1) => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toFixed(decimals);
  };

  // Convert Unreal Units/second to MPH
  // Rocket League: 1 UU/s ≈ 0.02237 MPH
  const convertToMPH = (unrealSpeed) => {
    const mph = unrealSpeed * 0.02237;
    return Math.round(mph);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentAccuracy = () => {
    if (!currentStats || !currentStats.shots) return 0;
    return currentStats.shots > 0
      ? ((currentStats.goals / currentStats.shots) * 100).toFixed(1)
      : 0;
  };
  return (
    <div className="stats-overview">
      {/* Current Session Stats - Reorganized Grid Layout */}
      <section className="stats-section">
        <h2>📊 Current Session Stats</h2>
        {currentStats ? (
          <div className="stats-grid-layout">
            {/* Key Metrics - Top Row */}
            <div className="key-metrics-row">
              <div className="stat-card highlight-card">
                <div className="stat-icon-large">⚽</div>
                <div className="stat-content">
                  <div className="stat-label">Goals</div>
                  <div className="stat-value-large">{currentStats.goals || 0}</div>
                </div>
              </div>
              <div className="stat-card highlight-card">
                <div className="stat-icon-large">📍</div>
                <div className="stat-content">
                  <div className="stat-label">Shots</div>
                  <div className="stat-value-large">{currentStats.shots || 0}</div>
                </div>
              </div>
              <div className="stat-card highlight-card">
                <div className="stat-icon-large">🎯</div>
                <div className="stat-content">
                  <div className="stat-label">Accuracy</div>
                  <div className="stat-value-large">{getCurrentAccuracy()}%</div>
                </div>
              </div>
              <div className="stat-card highlight-card">
                <div className="stat-icon-large">⏱️</div>
                <div className="stat-content">
                  <div className="stat-label">Game Time</div>
                  <div className="stat-value-large">{formatTime(currentStats?.gameTime || 0)}</div>
                </div>
              </div>
            </div>

            {/* Detailed Stats - Grid */}
            <div className="detailed-stats-grid">
              {/* Speed Stats */}
              <div className="stat-group-card">
                <h3>⚡ Speed & Movement</h3>
                <div className="stat-item">
                  <span>Average Speed:</span>
                  <strong>{convertToMPH(currentStats?.averageSpeed || 0)} mph</strong>
                </div>
                <div className="stat-item">
                  <span>Speed Samples:</span>
                  <strong>{currentStats?.speedSamples || 0}</strong>
                </div>
              </div>

              {/* Boost Stats */}
              <div className="stat-group-card">
                <h3>💨 Boost Management</h3>
                <div className="stat-item">
                  <span>Boost Collected:</span>
                  <strong>{safeToFixed(currentStats?.boostCollected)}</strong>
                </div>
                <div className="stat-item">
                  <span>Boost Used:</span>
                  <strong>{safeToFixed(currentStats?.boostUsed)}</strong>
                </div>
                <div className="stat-item">
                  <span>Efficiency:</span>
                  <strong>
                    {currentStats?.boostCollected > 0
                      ? safeToFixed(
                          (currentStats.boostUsed / currentStats.boostCollected) * 100
                        )
                      : 0}%
                  </strong>
                </div>
              </div>

              {/* Possession Stats */}
              <div className="stat-group-card">
                <h3>🏐 Possession Time</h3>
                <div className="stat-item">
                  <span>Your Possession:</span>
                  <strong>{safeToFixed(currentStats?.possessionTime)}s</strong>
                </div>
                <div className="stat-item">
                  <span>Team Possession:</span>
                  <strong>{safeToFixed(currentStats?.teamPossessionTime)}s</strong>
                </div>
                <div className="stat-item">
                  <span>Opponent Possession:</span>
                  <strong>{safeToFixed(currentStats?.opponentPossessionTime)}s</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No current session data available</p>
          </div>
        )}
      </section>{" "}      {allTimeStats && (
        <section className="stats-section all-time-section">
          <h2>🏆 All-Time Statistics</h2>
          <div className="all-time-grid-reorganized">
            {/* Primary Stats */}
            <div className="primary-stats">
              <div className="summary-card-large">
                <div className="summary-icon">🎮</div>
                <div className="summary-content">
                  <div className="summary-label">Total Sessions</div>
                  <div className="summary-value-xl">
                    {allTimeStats.totalSessions || allTimeStats.total_sessions || 0}
                  </div>
                </div>
              </div>
              <div className="summary-card-large">
                <div className="summary-icon">⚽</div>
                <div className="summary-content">
                  <div className="summary-label">Total Goals</div>
                  <div className="summary-value-xl">
                    {allTimeStats.totalGoals || allTimeStats.total_goals || 0}
                  </div>
                </div>
              </div>
              <div className="summary-card-large">
                <div className="summary-icon">📍</div>
                <div className="summary-content">
                  <div className="summary-label">Total Shots</div>
                  <div className="summary-value-xl">
                    {allTimeStats.totalShots || allTimeStats.total_shots || 0}
                  </div>
                </div>
              </div>
              <div className="summary-card-large">
                <div className="summary-icon">⏱️</div>
                <div className="summary-content">
                  <div className="summary-label">Total Play Time</div>
                  <div className="summary-value-xl">
                    {formatTime(
                      allTimeStats.totalPlayTime ||
                        allTimeStats.total_play_time ||
                        0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="secondary-stats">
              <div className="summary-card">
                <div className="summary-label">Average Accuracy</div>
                <div className="summary-value">
                  {safeToFixed(
                    allTimeStats?.avgAccuracy || allTimeStats?.avg_accuracy || 0
                  )}%
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Average Speed</div>
                <div className="summary-value">
                  {convertToMPH(allTimeStats?.avgSpeed || allTimeStats?.avg_speed || 0)} mph
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Shots per Session</div>
                <div className="summary-value">
                  {(allTimeStats?.totalSessions ||
                    allTimeStats?.total_sessions ||
                    0) > 0
                    ? safeToFixed(
                        (allTimeStats?.totalShots ||
                          allTimeStats?.total_shots ||
                          0) /
                          (allTimeStats?.totalSessions ||
                            allTimeStats?.total_sessions)
                      )
                    : 0}
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Goals per Session</div>
                <div className="summary-value">
                  {(allTimeStats?.totalSessions ||
                    allTimeStats?.total_sessions ||
                    0) > 0
                    ? safeToFixed(
                        (allTimeStats?.totalGoals ||
                          allTimeStats?.total_goals ||
                          0) /
                          (allTimeStats?.totalSessions ||
                            allTimeStats?.total_sessions)
                      )
                    : 0}
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Avg Session Duration</div>
                <div className="summary-value">
                  {(allTimeStats.totalSessions ||
                    allTimeStats.total_sessions ||
                    0) > 0
                    ? formatTime(
                        (allTimeStats.totalPlayTime ||
                          allTimeStats.total_play_time ||
                          0) /
                          (allTimeStats.totalSessions ||
                            allTimeStats.total_sessions)
                      )
                    : "0:00"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default StatsOverview;
