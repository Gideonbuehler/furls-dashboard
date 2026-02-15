import { useState } from "react";
import "./SessionHistory.css";

function SessionHistory({ sessionHistory }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });

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

  const getAccuracyClass = (acc) => {
    const val = parseFloat(acc);
    if (val >= 50) return "excellent";
    if (val >= 35) return "good";
    if (val >= 20) return "average";
    return "poor";
  };

  if (!sessionHistory || sessionHistory.length === 0) {
    return (
      <div className="history-terminal">
        <div className="terminal-header">
          <h1>SESSION LOG</h1>
          <div className="terminal-subtitle">// NO DATA FOUND //</div>
        </div>
        <div className="no-data-terminal">
          <p>// NO SESSION HISTORY AVAILABLE //</p>
          <p className="dim">Complete a match to populate the log.</p>
        </div>
      </div>
    );
  }

  // Session detail view
  if (selectedSession) {
    return (
      <div className="history-terminal">
        <button
          className="back-btn"
          onClick={() => setSelectedSession(null)}
        >
          ◀ BACK TO LOG
        </button>

        <div className="detail-header">
          <h2 className="section-title">Session Details</h2>
          <div className="detail-date">{formatDate(selectedSession.timestamp)}</div>
        </div>

        {/* Match Metadata */}
        {(selectedSession.playlist ||
          selectedSession.is_ranked ||
          selectedSession.mmr) && (
          <div className="detail-metadata">
            {selectedSession.playlist && (
              <div className="meta-badge">
                <span className="meta-label">Playlist</span>
                <span className="meta-value">{selectedSession.playlist}</span>
              </div>
            )}
            {selectedSession.is_ranked === 1 && (
              <div className="meta-badge ranked">
                <span className="meta-value">RANKED</span>
              </div>
            )}
            {selectedSession.mmr !== null &&
              selectedSession.mmr !== undefined && (
              <div className="meta-badge">
                <span className="meta-label">MMR</span>
                <span className="meta-value">{Math.round(selectedSession.mmr)}</span>
              </div>
            )}
            {selectedSession.mmr_change !== null &&
              selectedSession.mmr_change !== undefined && (
              <div className={`meta-badge ${selectedSession.mmr_change >= 0 ? "positive" : "negative"}`}>
                <span className="meta-value">
                  {selectedSession.mmr_change >= 0 ? "+" : ""}
                  {Math.round(selectedSession.mmr_change)} MMR
                </span>
              </div>
            )}
          </div>
        )}

        <div className="detail-grid">
          <div className="stat-block medium">
            <div className="t-stat-label">Total Shots</div>
            <div className="t-stat-value">{selectedSession.shots || 0}</div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Goals Scored</div>
            <div className="t-stat-value">{selectedSession.goals || 0}</div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Accuracy</div>
            <div className="t-stat-value">{getAccuracy(selectedSession)}%</div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Avg Speed</div>
            <div className="t-stat-value">
              {convertToMPH(selectedSession.averageSpeed || selectedSession.average_speed || 0)}
              <span className="stat-unit">mph</span>
            </div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Boost Used</div>
            <div className="t-stat-value">
              {(selectedSession.boostUsed || selectedSession.boost_used || 0).toFixed(0)}
            </div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Game Time</div>
            <div className="t-stat-value">
              {formatTime(selectedSession.gameTime || selectedSession.game_time || 0)}
            </div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Possession</div>
            <div className="t-stat-value">
              {(selectedSession.possessionTime || selectedSession.possession_time || 0).toFixed(1)}
              <span className="stat-unit">s</span>
            </div>
          </div>
          <div className="stat-block medium">
            <div className="t-stat-label">Goals / Min</div>
            <div className="t-stat-value">
              {((selectedSession.goals || 0) /
                ((selectedSession.gameTime || selectedSession.game_time || 1) / 60)
              ).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main table view
  return (
    <div className="history-terminal">
      <div className="terminal-header">
        <h1>SESSION LOG</h1>
        <div className="terminal-subtitle">
          // {sessionHistory.length} SESSIONS RECORDED //
        </div>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => handleSort("date")} className="sortable">
                Date
                {sortConfig.key === "date" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("duration")} className="sortable">
                Duration
                {sortConfig.key === "duration" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("shots")} className="sortable">
                Shots
                {sortConfig.key === "shots" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("goals")} className="sortable">
                Goals
                {sortConfig.key === "goals" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("accuracy")} className="sortable">
                Accuracy
                {sortConfig.key === "accuracy" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("avgSpeed")} className="sortable">
                Avg Speed (mph)
                {sortConfig.key === "avgSpeed" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("boost")} className="sortable">
                Boost Used
                {sortConfig.key === "boost" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("possession")} className="sortable">
                Possession
                {sortConfig.key === "possession" && (
                  <span className="sort-arrow">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th>Playlist</th>
              <th>MMR Δ</th>
            </tr>
          </thead>
          <tbody>
            {getSortedSessions().map((session, index) => {
              const acc = getAccuracy(session);
              return (
                <tr
                  key={session.id || index}
                  className="history-row"
                  onClick={() => setSelectedSession(session)}
                >
                  <td><span className="row-number">{index + 1}</span></td>
                  <td><span className="date-cell">{formatDate(session.timestamp)}</span></td>
                  <td>{formatTime(session.gameTime || session.game_time || 0)}</td>
                  <td>{session.shots || 0}</td>
                  <td>{session.goals || 0}</td>
                  <td>
                    <span className={`accuracy-badge ${getAccuracyClass(acc)}`}>
                      {acc}%
                    </span>
                  </td>
                  <td>{convertToMPH(session.averageSpeed || session.average_speed || 0)}</td>
                  <td>{(session.boostUsed || session.boost_used || 0).toFixed(0)}</td>
                  <td>
                    {(session.possessionTime || session.possession_time || 0).toFixed(1)}s
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
                        className={`mmr-change ${
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <h2 className="section-title">Summary Statistics</h2>
      <div className="summary-stats-container">
        <div className="stat-block small">
          <div className="t-stat-label">Best Accuracy</div>
          <div className="t-stat-value">
            {Math.max(
              ...sessionHistory.map((s) => parseFloat(getAccuracy(s)))
            ).toFixed(1)}%
          </div>
        </div>
        <div className="stat-block small">
          <div className="t-stat-label">Most Goals</div>
          <div className="t-stat-value">
            {Math.max(...sessionHistory.map((s) => s.goals || 0))}
          </div>
        </div>
        <div className="stat-block small">
          <div className="t-stat-label">Most Shots</div>
          <div className="t-stat-value">
            {Math.max(...sessionHistory.map((s) => s.shots || 0))}
          </div>
        </div>
        <div className="stat-block small">
          <div className="t-stat-label">Top Speed</div>
          <div className="t-stat-value">
            {convertToMPH(
              Math.max(
                ...sessionHistory.map(
                  (s) => s.averageSpeed || s.average_speed || 0
                )
              )
            )}
            <span className="stat-unit">mph</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionHistory;
