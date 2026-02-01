import "./StatsOverview.css";

function StatsOverview({ currentStats, allTimeStats }) {
  // Safe number formatter - ensures value is a number before calling toFixed
  const safeToFixed = (value, decimals = 1) => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toFixed(decimals);
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
      <section className="stats-section">
        <h2>📊 Current Session Stats</h2>
        {currentStats ? (
          <div className="stats-details">
            <div className="stat-group">
              <h3>⚽ Shooting</h3>
              <div className="stat-item">
                <span>Total Shots:</span>
                <strong>{currentStats.shots || 0}</strong>
              </div>
              <div className="stat-item">
                <span>Goals Scored:</span>
                <strong>{currentStats.goals || 0}</strong>
              </div>{" "}
              <div className="stat-item">
                <span>Accuracy:</span>
                <strong className="highlight">{getCurrentAccuracy()}%</strong>
              </div>
            </div>
            <div className="stat-group">
              <h3>⚡ Speed & Movement</h3>
              <div className="stat-item">
                <span>Average Speed:</span>
                <strong>{safeToFixed(currentStats?.averageSpeed, 2)}</strong>
              </div>
              <div className="stat-item">
                <span>Speed Samples:</span>
                <strong>{currentStats?.speedSamples || 0}</strong>
              </div>
            </div>
            <div className="stat-group">
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
                        (currentStats.boostUsed / currentStats.boostCollected) *
                          100
                      )
                    : 0}
                  %
                </strong>
              </div>
            </div>
            <div className="stat-group">
              <h3>⏱️ Time Stats</h3>
              <div className="stat-item">
                <span>Total Game Time:</span>
                <strong>{formatTime(currentStats?.gameTime || 0)}</strong>
              </div>
              <div className="stat-item">
                <span>Your Possession:</span>
                <strong>{safeToFixed(currentStats?.possessionTime)}s</strong>
              </div>
              <div className="stat-item">
                <span>Team Possession:</span>
                <strong>
                  {safeToFixed(currentStats?.teamPossessionTime)}s
                </strong>
              </div>
              <div className="stat-item">
                <span>Opponent Possession:</span>
                <strong>
                  {safeToFixed(currentStats?.opponentPossessionTime)}s
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            {" "}
            <p>No current session data available</p>
          </div>
        )}
      </section>{" "}
      {allTimeStats && (
        <section className="stats-section">
          <h2>🏆 All-Time Statistics</h2>
          <div className="all-time-grid">
            <div className="summary-card">
              <div className="summary-label">Total Sessions</div>
              <div className="summary-value">
                {allTimeStats.totalSessions || allTimeStats.total_sessions || 0}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Shots</div>
              <div className="summary-value">
                {allTimeStats.totalShots || allTimeStats.total_shots || 0}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Goals</div>
              <div className="summary-value">
                {allTimeStats.totalGoals || allTimeStats.total_goals || 0}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average Accuracy</div>
              <div className="summary-value">
                {safeToFixed(
                  allTimeStats?.avgAccuracy || allTimeStats?.avg_accuracy || 0
                )}
                %
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average Speed</div>
              <div className="summary-value">
                {safeToFixed(
                  allTimeStats?.avgSpeed || allTimeStats?.avg_speed || 0,
                  2
                )}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Play Time</div>
              <div className="summary-value">
                {formatTime(
                  allTimeStats.totalPlayTime ||
                    allTimeStats.total_play_time ||
                    0
                )}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg Shots/Session</div>
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
              <div className="summary-label">Avg Goals/Session</div>
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
        </section>
      )}
    </div>
  );
}

export default StatsOverview;
