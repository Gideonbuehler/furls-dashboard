import "./SessionHistory.css";

function SessionHistory({ sessionHistory }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getAccuracy = (session) => {
    return session.shots > 0
      ? ((session.goals / session.shots) * 100).toFixed(1)
      : 0;
  };

  if (!sessionHistory || sessionHistory.length === 0) {
    return (
      <div className="session-history">
        <h2>📈 Session History</h2>
        <div className="no-data">
          <p>No session history available yet.</p>
          <p>Complete a training session to see your history!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-history">
      <h2>📈 Session History</h2>
      <p className="history-info">
        Showing {sessionHistory.length} most recent sessions
      </p>

      <div className="sessions-table-container">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Shots</th>
              <th>Goals</th>
              <th>Accuracy</th>
              <th>Avg Speed</th> <th>Boost Used</th>
              <th>Possession</th>
            </tr>
          </thead>
          <tbody>
            {sessionHistory
              .slice()
              .reverse()
              .map((session, index) => (
                <tr key={sessionHistory.length - index} className="session-row">
                  <td>{sessionHistory.length - index}</td>
                  <td>{formatDate(session.timestamp)}</td>
                  <td>
                    {formatTime(session.gameTime || session.game_time || 0)}
                  </td>
                  <td>{session.shots || 0}</td>
                  <td>{session.goals || 0}</td>
                  <td>
                    <span
                      className={`accuracy ${
                        getAccuracy(session) >= 50
                          ? "good"
                          : getAccuracy(session) >= 30
                          ? "medium"
                          : "low"
                      }`}
                    >
                      {getAccuracy(session)}%
                    </span>
                  </td>
                  <td>
                    {(
                      session.averageSpeed ||
                      session.average_speed ||
                      0
                    ).toFixed(0)}
                  </td>
                  <td>
                    {(session.boostUsed || session.boost_used || 0).toFixed(0)}
                  </td>
                  <td>
                    {(
                      session.possessionTime ||
                      session.possession_time ||
                      0
                    ).toFixed(1)}
                    s
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="history-summary">
        <h3>Summary Statistics</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Best Accuracy:</span>
            <span className="summary-value">
              {Math.max(
                ...sessionHistory.map((s) => parseFloat(getAccuracy(s)))
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Most Goals in Session:</span>
            <span className="summary-value">
              {Math.max(...sessionHistory.map((s) => s.goals || 0))}
            </span>
          </div>{" "}
          <div className="summary-item">
            <span className="summary-label">Most Shots in Session:</span>
            <span className="summary-value">
              {Math.max(...sessionHistory.map((s) => s.shots || 0))}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Highest Avg Speed:</span>
            <span className="summary-value">
              {Math.max(
                ...sessionHistory.map(
                  (s) => s.averageSpeed || s.average_speed || 0
                )
              ).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionHistory;
