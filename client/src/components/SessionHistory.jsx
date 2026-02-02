import { useState } from "react";
import "./SessionHistory.css";

function SessionHistory({ sessionHistory }) {
  const [selectedSession, setSelectedSession] = useState(null);
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
      </div>    );
  }

  // If a session is selected, show detailed view
  if (selectedSession) {
    return (
      <div className="session-history">
        <button 
          className="back-button" 
          onClick={() => setSelectedSession(null)}
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '2px solid #bb86fc',
            borderRadius: '12px',
            color: '#bb86fc',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          ← Back to History
        </button>

        <div className="session-detail-container">
          <div className="session-detail-header">
            <h2>📊 Session Details</h2>
            <p className="session-date">{formatDate(selectedSession.timestamp)}</p>
          </div>

          <div className="detail-stats-grid">
            <div className="detail-stat-card">
              <div className="detail-stat-icon">🚀</div>
              <div className="detail-stat-value">{selectedSession.shots || 0}</div>
              <div className="detail-stat-label">Total Shots</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">⚽</div>
              <div className="detail-stat-value">{selectedSession.goals || 0}</div>
              <div className="detail-stat-label">Goals Scored</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">🎯</div>
              <div className="detail-stat-value">{getAccuracy(selectedSession)}%</div>
              <div className="detail-stat-label">Accuracy</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">⚡</div>
              <div className="detail-stat-value">
                {(selectedSession.averageSpeed || selectedSession.average_speed || 0).toFixed(0)}
              </div>
              <div className="detail-stat-label">Avg Speed</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">💨</div>
              <div className="detail-stat-value">
                {(selectedSession.boostUsed || selectedSession.boost_used || 0).toFixed(0)}
              </div>
              <div className="detail-stat-label">Boost Used</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">⏱️</div>
              <div className="detail-stat-value">
                {formatTime(selectedSession.gameTime || selectedSession.game_time || 0)}
              </div>
              <div className="detail-stat-label">Game Time</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">🎮</div>
              <div className="detail-stat-value">
                {(selectedSession.possessionTime || selectedSession.possession_time || 0).toFixed(1)}s
              </div>
              <div className="detail-stat-label">Possession</div>
            </div>

            <div className="detail-stat-card">
              <div className="detail-stat-icon">🏃</div>
              <div className="detail-stat-value">
                {(selectedSession.averageSpeed || selectedSession.average_speed || 0).toFixed(1)}
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
                <span className="performance-value">{selectedSession.id || 'N/A'}</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Timestamp:</span>
                <span className="performance-value">{formatDate(selectedSession.timestamp)}</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Goals per Minute:</span>
                <span className="performance-value">
                  {((selectedSession.goals || 0) / ((selectedSession.gameTime || selectedSession.game_time || 1) / 60)).toFixed(2)}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Shots per Minute:</span>
                <span className="performance-value">
                  {((selectedSession.shots || 0) / ((selectedSession.gameTime || selectedSession.game_time || 1) / 60)).toFixed(2)}
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
          <tbody>            {sessionHistory
              .slice()
              .reverse()
              .map((session, index) => (
                <tr 
                  key={sessionHistory.length - index} 
                  className="session-row clickable"
                  onClick={() => setSelectedSession(session)}
                  style={{ cursor: 'pointer' }}
                >
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
