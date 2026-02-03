import { useState, useEffect } from "react";
import { statsAPI, publicAPI } from "../services/api";
import "./Leaderboard.css";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [type, setType] = useState("global"); // friends or global
  const [stat, setStat] = useState("accuracy"); // accuracy, goals, shots, sessions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type, stat]);  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (type === "global") {
        const response = await publicAPI.getLeaderboard(stat);
        console.log("[Leaderboard] Global response:", response.data);
        // Response is an array directly, not wrapped in a players object
        setLeaderboard(Array.isArray(response.data) ? response.data : []);
      } else {
        const response = await statsAPI.getLeaderboard(type, stat);
        console.log("[Leaderboard] Friends response:", response.data);
        console.log("[Leaderboard] Friends count:", response.data?.length || 0);
        setLeaderboard(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("[Leaderboard] Failed to load leaderboard:", error);
      console.error("[Leaderboard] Error details:", error.response?.data);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };
  const getStatValue = (player) => {
    switch (stat) {
      case "accuracy":
        const accuracy = player.accuracy ?? player.avg_accuracy ?? 0;
        return `${Number(accuracy).toFixed(1)}%`;
      case "goals":
        return player.total_goals || 0;
      case "shots":
        return player.total_shots || 0;
      case "sessions":
        return player.total_sessions || 0;
      default:
        const defaultAccuracy = player.avg_accuracy ?? player.accuracy ?? 0;
        return `${Number(defaultAccuracy).toFixed(1)}%`;
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return null;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>

        <div className="leaderboard-filters">
          <div className="filter-group">
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="friends">Friends Only</option>
              <option value="global">Global</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Stat:</label>
            <select value={stat} onChange={(e) => setStat(e.target.value)}>
              <option value="accuracy">Accuracy</option>
              <option value="goals">Total Goals</option>
              <option value="shots">Total Shots</option>
              <option value="sessions">Total Sessions</option>
            </select>
          </div>
        </div>
      </div>      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          {type === "friends" ? (
            <>
              <p>No friends data available yet.</p>
              <p>
                Make sure you have added friends and that you or your friends
                have completed training sessions.
              </p>
              <p className="hint">
                Tip: Go to the Friends tab to add friends, then play some
                matches!
              </p>
            </>
          ) : (
            <p>No data available yet. Complete some training sessions!</p>
          )}
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((player, index) => (
            <div
              key={player.id || player.username || index}
              className={`leaderboard-item rank-${index + 1}`}
            >
              <div className="rank">
                {getMedalEmoji(index) || `#${index + 1}`}
              </div>
              <div className="player-avatar">
                {player.avatar_url ? (
                  <img src={player.avatar_url} alt={player.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {(player.display_name || player.username)[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="player-info">
                <h3>{player.display_name || player.username}</h3>
                <p>@{player.username}</p>
                <div className="player-stats-mini">
                  <span>{player.total_sessions || 0} sessions</span>
                  <span>•</span>
                  <span>
                    {player.total_goals || 0}/{player.total_shots || 0} goals
                  </span>
                </div>
              </div>

              <div className="stat-value">{getStatValue(player)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
