import "./StatsOverview.css";

function StatsOverview({ currentStats, allTimeStats }) {
  const safeToFixed = (value, decimals = 1) => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toFixed(decimals);
  };

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

  const getBoostEfficiency = () => {
    if (!currentStats?.boostCollected || currentStats.boostCollected === 0)
      return 0;
    return safeToFixed(
      (currentStats.boostUsed / currentStats.boostCollected) * 100
    );
  };

  // All-time derived stats
  const totalSessions =
    allTimeStats?.totalSessions || allTimeStats?.total_sessions || 0;
  const totalGoals =
    allTimeStats?.totalGoals || allTimeStats?.total_goals || 0;
  const totalShots =
    allTimeStats?.totalShots || allTimeStats?.total_shots || 0;
  const totalPlayTime =
    allTimeStats?.totalPlayTime || allTimeStats?.total_play_time || 0;
  const avgAccuracy =
    allTimeStats?.avgAccuracy || allTimeStats?.avg_accuracy || 0;
  const avgSpeed = allTimeStats?.avgSpeed || allTimeStats?.avg_speed || 0;

  return (
    <div className="stats-terminal">
      {/* Corner decorations */}
      <div className="corner-decor top-left" />
      <div className="corner-decor bottom-right" />

      {/* Header */}
      <div className="terminal-header">
        <h1>STATS TERMINAL</h1>
        <div className="terminal-subtitle">// FURLS DATA ACCESS //</div>
      </div>

      {/* Featured Stat — Shot Accuracy */}
      <div className="featured-stat">
        <div className="featured-main">
          <div className="t-stat-label">SHOT ACCURACY RATE</div>
          <div className="featured-value">{getCurrentAccuracy()}%</div>
          <div className="featured-subtext">
            {currentStats
              ? `${currentStats.goals || 0} goals from ${
                  currentStats.shots || 0
                } shots`
              : "No session data"}
          </div>
        </div>
        <div className="featured-side">
          {currentStats && (
            <div className="rank-badge">
              {getCurrentAccuracy() >= 60
                ? "ELITE"
                : getCurrentAccuracy() >= 40
                ? "SOLID"
                : getCurrentAccuracy() >= 20
                ? "WARMING UP"
                : "ROOKIE"}
            </div>
          )}
        </div>
      </div>

      {/* Current Session Stats Grid */}
      <h2 className="section-title">Current Session</h2>
      {currentStats ? (
        <div className="stats-container">
          {/* Goals — large */}
          <div className="stat-block large">
            <span className="stat-float">SESSION</span>
            <div className="t-stat-label">Total Goals</div>
            <div className="t-stat-value">{currentStats.goals || 0}</div>
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      ((currentStats.goals || 0) /
                        Math.max(currentStats.shots || 1, 1)) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Shots — large */}
          <div className="stat-block large">
            <span className="stat-float">SESSION</span>
            <div className="t-stat-label">Total Shots</div>
            <div className="t-stat-value">{currentStats.shots || 0}</div>
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min((currentStats.shots || 0) * 2, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Accuracy — medium */}
          <div className="stat-block medium">
            <div className="t-stat-label">Accuracy</div>
            <div className="t-stat-value">{getCurrentAccuracy()}%</div>
          </div>

          {/* Game Time — medium */}
          <div className="stat-block medium">
            <div className="t-stat-label">Game Time</div>
            <div className="t-stat-value">
              {formatTime(currentStats?.gameTime || 0)}
            </div>
          </div>

          {/* Avg Speed — medium */}
          <div className="stat-block medium">
            <span className="stat-float">AVG</span>
            <div className="t-stat-label">Average Speed</div>
            <div className="t-stat-value">
              {convertToMPH(currentStats?.averageSpeed || 0)}
              <span className="stat-unit">mph</span>
            </div>
          </div>

          {/* Boost Used — small */}
          <div className="stat-block small">
            <div className="t-stat-label">Boost Used</div>
            <div className="t-stat-value">
              {safeToFixed(currentStats?.boostUsed, 0)}
            </div>
          </div>

          {/* Boost Collected — small */}
          <div className="stat-block small">
            <div className="t-stat-label">Boost Collected</div>
            <div className="t-stat-value">
              {safeToFixed(currentStats?.boostCollected, 0)}
            </div>
          </div>

          {/* Boost Efficiency — small */}
          <div className="stat-block small">
            <div className="t-stat-label">Boost Efficiency</div>
            <div className="t-stat-value">{getBoostEfficiency()}%</div>
          </div>

          {/* Speed Samples — small */}
          <div className="stat-block small">
            <div className="t-stat-label">Speed Samples</div>
            <div className="t-stat-value">
              {currentStats?.speedSamples || 0}
            </div>
          </div>

          {/* Possession — medium */}
          <div className="stat-block medium">
            <div className="t-stat-label">Your Possession</div>
            <div className="t-stat-value">
              {safeToFixed(currentStats?.possessionTime)}
              <span className="stat-unit">s</span>
            </div>
          </div>

          {/* Team Possession — small */}
          <div className="stat-block small">
            <div className="t-stat-label">Team Possession</div>
            <div className="t-stat-value">
              {safeToFixed(currentStats?.teamPossessionTime)}
              <span className="stat-unit">s</span>
            </div>
          </div>

          {/* Opponent Possession — small */}
          <div className="stat-block small">
            <div className="t-stat-label">Opponent Possession</div>
            <div className="t-stat-value">
              {safeToFixed(currentStats?.opponentPossessionTime)}
              <span className="stat-unit">s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data-terminal">
          <p>// NO ACTIVE SESSION DATA //</p>
          <p className="dim">Play a match to populate the terminal.</p>
        </div>
      )}

      {/* All-Time Stats */}
      {allTimeStats && (
        <>
          <h2 className="section-title">All-Time Statistics</h2>
          <div className="stats-container">
            {/* Total Sessions — large */}
            <div className="stat-block large">
              <span className="stat-float">LIFETIME</span>
              <div className="t-stat-label">Total Sessions Played</div>
              <div className="t-stat-value">{totalSessions}</div>
            </div>

            {/* Total Goals — large */}
            <div className="stat-block large">
              <span className="stat-float">LIFETIME</span>
              <div className="t-stat-label">Total Goals Scored</div>
              <div className="t-stat-value">{totalGoals}</div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (totalGoals / Math.max(totalShots, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Total Shots — medium */}
            <div className="stat-block medium">
              <div className="t-stat-label">Total Shots</div>
              <div className="t-stat-value">{totalShots}</div>
            </div>

            {/* Total Play Time — medium */}
            <div className="stat-block medium">
              <div className="t-stat-label">Total Play Time</div>
              <div className="t-stat-value">{formatTime(totalPlayTime)}</div>
            </div>

            {/* Avg Accuracy — medium */}
            <div className="stat-block medium">
              <span className="stat-float">AVG</span>
              <div className="t-stat-label">Average Accuracy</div>
              <div className="t-stat-value">{safeToFixed(avgAccuracy)}%</div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${avgAccuracy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Avg Speed — small */}
            <div className="stat-block small">
              <div className="t-stat-label">Average Speed</div>
              <div className="t-stat-value">
                {convertToMPH(avgSpeed)}
                <span className="stat-unit">mph</span>
              </div>
            </div>

            {/* Shots per Session — small */}
            <div className="stat-block small">
              <div className="t-stat-label">Shots / Session</div>
              <div className="t-stat-value">
                {totalSessions > 0
                  ? safeToFixed(totalShots / totalSessions)
                  : 0}
              </div>
            </div>

            {/* Goals per Session — small */}
            <div className="stat-block small">
              <div className="t-stat-label">Goals / Session</div>
              <div className="t-stat-value">
                {totalSessions > 0
                  ? safeToFixed(totalGoals / totalSessions)
                  : 0}
              </div>
            </div>

            {/* Avg Session Duration — small */}
            <div className="stat-block small">
              <div className="t-stat-label">Avg Session Length</div>
              <div className="t-stat-value">
                {totalSessions > 0
                  ? formatTime(totalPlayTime / totalSessions)
                  : "0:00"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatsOverview;
