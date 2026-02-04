import { useState } from "react";
import "./SessionHistory.css";

function SessionHistory({ sessionHistory }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });

  // Convert Unreal Units/second to MPH
  // Rocket League: 1 UU/s ≈ 0.02237 MPH
  const convertToMPH = (unrealSpeed) => {
    const mph = unrealSpeed * 0.02237;
    return Math.round(mph);
  };

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedSessions = () => {
    if (!sortConfig.key) {
      return [...sessionHistory].reverse();
    }

    return [...sessionHistory].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "date":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "duration":
          aValue = a.gameTime || a.game_time || 0;
          bValue = b.gameTime || b.game_time || 0;
          break;
        case "shots":
          aValue = a.shots || 0;
          bValue = b.shots || 0;
          break;
        case "goals":
          aValue = a.goals || 0;
          bValue = b.goals || 0;
          break;
        case "accuracy":
          aValue = a.shots > 0 ? (a.goals / a.shots) * 100 : 0;
          bValue = b.shots > 0 ? (b.goals / b.shots) * 100 : 0;
          break;
        case "avgSpeed":
          aValue = a.averageSpeed || a.average_speed || 0;
          bValue = b.averageSpeed || b.average_speed || 0;
          break;
        case "boost":
          aValue = a.boostUsed || a.boost_used || 0;
          bValue = b.boostUsed || b.boost_used || 0;
          break;
        case "possession":
          aValue = a.possessionTime || a.possession_time || 0;
          bValue = b.possessionTime || b.possession_time || 0;
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

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

  // If a session is selected, show detailed view
  if (selectedSession) {
    return (
      <div className="session-history">
        <button
          className="back-button"
          onClick={() => setSelectedSession(null)}
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1.5rem",
            background: "rgba(139, 92, 246, 0.2)",
            border: "2px solid #bb86fc",
            borderRadius: "12px",
            color: "#bb86fc",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
          }}
        >
          ← Back to History
        </button>{" "}
        <div className="session-detail-container">
          <div className="session-detail-header">
            <h2>📊 Session Details</h2>
            <p className="session-date">
              {formatDate(selectedSession.timestamp)}
            </p>
          </div>

          {/* Match Metadata Section */}
          {(selectedSession.playlist ||
            selectedSession.is_ranked ||
            selectedSession.mmr) && (
            <div className="session-metadata-section">
              {selectedSession.playlist && (
                <div className="session-metadata-badge">
                  <span className="badge-icon">🎮</span>
                  <span className="badge-label">Playlist:</span>
                  <span className="badge-value">
                    {selectedSession.playlist}
                  </span>
                </div>
              )}
              {selectedSession.is_ranked === 1 && (
                <div className="session-metadata-badge ranked">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-value">Ranked Match</span>
                </div>
              )}
              {selectedSession.mmr !== null &&
                selectedSession.mmr !== undefined && (
                  <div className="session-metadata-badge">
                    <span className="badge-icon">📊</span>
                    <span className="badge-label">MMR:</span>
                    <span className="badge-value">
                      {Math.round(selectedSession.mmr)}
                    </span>
                  </div>
                )}
              {selectedSession.mmr_change !== null &&
                selectedSession.mmr_change !== undefined && (
                  <div
                    className={`session-metadata-badge mmr-change ${
                      selectedSession.mmr_change >= 0 ? "positive" : "negative"
                    }`}
                  >
                    <span className="badge-icon">
                      {selectedSession.mmr_change >= 0 ? "📈" : "📉"}
                    </span>
                    <span className="badge-value">
                      {selectedSession.mmr_change >= 0 ? "+" : ""}
                      {Math.round(selectedSession.mmr_change)} MMR
                    </span>
                  </div>
                )}
            </div>
          )}

          <div className="detail-stats-grid">
            <div className="detail-stat-card">
              <div className="detail-stat-icon">🚀</div>
              <div className="detail-stat-value">
                {selectedSession.shots || 0}
              </div>
              <div className="detail-stat-label">Total Shots</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">⚽</div>
              <div className="detail-stat-value">
                {selectedSession.goals || 0}
              </div>
              <div className="detail-stat-label">Goals Scored</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">🎯</div>
              <div className="detail-stat-value">
                {getAccuracy(selectedSession)}%
              </div>
              <div className="detail-stat-label">Accuracy</div>
            </div>            <div className="detail-stat-card">
              <div className="detail-stat-icon">⚡</div>
              <div className="detail-stat-value">
                {convertToMPH(
                  selectedSession.averageSpeed ||
                  selectedSession.average_speed ||
                  0
                )}
              </div>
              <div className="detail-stat-label">Avg Speed (mph)</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">💨</div>
              <div className="detail-stat-value">
                {(
                  selectedSession.boostUsed ||
                  selectedSession.boost_used ||
                  0
                ).toFixed(0)}
              </div>
              <div className="detail-stat-label">Boost Used</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">⏱️</div>
              <div className="detail-stat-value">
                {formatTime(
                  selectedSession.gameTime || selectedSession.game_time || 0
                )}
              </div>
              <div className="detail-stat-label">Game Time</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">🎮</div>
              <div className="detail-stat-value">
                {(
                  selectedSession.possessionTime ||
                  selectedSession.possession_time ||
                  0
                ).toFixed(1)}
                s
              </div>
              <div className="detail-stat-label">Possession</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">🏃</div>
              <div className="detail-stat-value">
                {(
                  selectedSession.averageSpeed ||
                  selectedSession.average_speed ||
                  0
                ).toFixed(1)}
              </div>
              <div className="detail-stat-label">Speed (km/h)</div>
            </div>
          </div>

          {/* Additional details if available */}
          <div className="session-additional-info">
            <h3>📈 Session Performance</h3>
            <div className="performance-details">
              <div className="performance-item">
                <span className="performance-label">Session ID:</span>
                <span className="performance-value">
                  {selectedSession.id || "N/A"}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Timestamp:</span>
                <span className="performance-value">
                  {formatDate(selectedSession.timestamp)}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Goals per Minute:</span>
                <span className="performance-value">
                  {(
                    (selectedSession.goals || 0) /
                    ((selectedSession.gameTime ||
                      selectedSession.game_time ||
                      1) /
                      60)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Shots per Minute:</span>
                <span className="performance-value">
                  {(
                    (selectedSession.shots || 0) /
                    ((selectedSession.gameTime ||
                      selectedSession.game_time ||
                      1) /
                      60)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-history">
      <h2>📈 Session History</h2>
      <p className="history-info">
        Showing {sessionHistory.length} most recent sessions
      </p>{" "}
      <div className="sessions-table-container">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => handleSort("date")} className="sortable">
                Date{" "}
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("duration")} className="sortable">
                Duration{" "}
                {sortConfig.key === "duration" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("shots")} className="sortable">
                Shots{" "}
                {sortConfig.key === "shots" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("goals")} className="sortable">
                Goals{" "}
                {sortConfig.key === "goals" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("accuracy")} className="sortable">
                Accuracy{" "}
                {sortConfig.key === "accuracy" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>              <th onClick={() => handleSort("avgSpeed")} className="sortable">
                Avg Speed (mph){" "}
                {sortConfig.key === "avgSpeed" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("boost")} className="sortable">
                Boost Used{" "}
                {sortConfig.key === "boost" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>{" "}
              <th onClick={() => handleSort("possession")} className="sortable">
                Possession{" "}
                {sortConfig.key === "possession" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th>Playlist</th>
              <th>MMR Δ</th>
            </tr>
          </thead>{" "}
          <tbody>
            {" "}
            {getSortedSessions().map((session, index) => (
              <tr
                key={session.id || index}
                className="session-row clickable"
                onClick={() => setSelectedSession(session)}
                style={{ cursor: "pointer" }}
              >
                <td>{index + 1}</td>
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
                  </span>                </td>
                <td>
                  {convertToMPH(session.averageSpeed || session.average_speed || 0)}
                </td>
                <td>
                  {(session.boostUsed || session.boost_used || 0).toFixed(0)}
                </td>{" "}
                <td>
                  {(
                    session.possessionTime ||
                    session.possession_time ||
                    0
                  ).toFixed(1)}
                  s
                </td>
                <td>
                  {session.playlist ? (
                    <span className="playlist-badge">
                      {session.is_ranked === 1 && "🏆 "}
                      {session.playlist}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {session.mmr_change !== null &&
                  session.mmr_change !== undefined ? (
                    <span
                      className={`mmr-delta ${
                        session.mmr_change >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {session.mmr_change >= 0 ? "+" : ""}
                      {Math.round(session.mmr_change)}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
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
          </div>          <div className="summary-item">
            <span className="summary-label">Highest Avg Speed:</span>
            <span className="summary-value">
              {convertToMPH(Math.max(
                ...sessionHistory.map(
                  (s) => s.averageSpeed || s.average_speed || 0
                )
              ))} mph
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionHistory;
