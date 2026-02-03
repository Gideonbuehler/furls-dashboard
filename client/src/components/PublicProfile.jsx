import { useState, useEffect } from "react";
import "./PublicProfile.css";
import { publicAPI } from "../services/api";

function PublicProfile({ username, onBack }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, statsRes] = await Promise.all([
        publicAPI.getPublicProfile(username),
        publicAPI.getPublicStats(username),
      ]);

      setProfile(profileRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Player not found");
      } else if (err.response?.status === 403) {
        setError("This profile is private");
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="public-profile">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile">
        {" "}
        <div className="error-container">
          <div className="error-icon">😞</div>
          <h2>{error}</h2>
          <button className="btn-back" onClick={onBack}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile">
      {onBack && (
        <button className="btn-back-float" onClick={onBack}>
          ← Back to Search
        </button>
      )}

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          {profile.user.avatar_url ? (
            <img
              src={profile.user.avatar_url}
              alt={`${profile.user.username}'s avatar`}
              className="profile-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile.user.display_name || profile.user.username
                )}&size=200&background=bb86fc&color=fff`;
              }}
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {(profile.user.display_name || profile.user.username)
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          {profile.user.last_active && (
            <div className="online-badge" title="Recently active">
              🟢
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            {profile.user.display_name || profile.user.username}
          </h1>
          <p className="profile-username">@{profile.user.username}</p>
          {profile.user.bio && (
            <p className="profile-bio">{profile.user.bio}</p>
          )}
          <div className="profile-meta">
            <span className="meta-item">
              📅 Joined {formatDate(profile.user.created_at)}
            </span>
            {profile.user.last_active && (
              <span className="meta-item">
                ⚡ Active {formatDate(profile.user.last_active)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview-section">
        <h2 className="section-title">📊 All-Time Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{profile.user.accuracy}%</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">⚽</div>
            <div className="stat-content">
              <div className="stat-label">Total Goals</div>
              <div className="stat-value">{stats.total_goals || 0}</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <div className="stat-label">Total Shots</div>
              <div className="stat-value">{stats.total_shots || 0}</div>
            </div>
          </div>

          <div className="stat-card accent">
            <div className="stat-icon">🎮</div>
            <div className="stat-content">
              <div className="stat-label">Sessions</div>
              <div className="stat-value">{stats.total_sessions || 0}</div>
            </div>
          </div>

          <div className="stat-card primary">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-label">Avg Speed</div>
              <div className="stat-value">
                {stats.avg_speed?.toFixed(0) || 0}
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-label">Play Time</div>
              <div className="stat-value">
                {formatTime(stats.total_play_time || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {profile.sessions && profile.sessions.length > 0 && (
        <div className="recent-sessions-section">
          <h2 className="section-title">📈 Recent Sessions</h2>
          <div className="sessions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shots</th>
                  <th>Goals</th>
                  <th>Accuracy</th>
                  <th>Avg Speed</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {profile.sessions.map((session, index) => (
                  <tr key={session.id || index}>
                    <td>{formatDate(session.timestamp)}</td>
                    <td>{session.shots}</td>
                    <td className="goals-cell">{session.goals}</td>
                    <td className="accuracy-cell">
                      {session.shots > 0
                        ? ((session.goals / session.shots) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td>{session.average_speed?.toFixed(0) || 0}</td>
                    <td>{formatTime(session.game_time || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicProfile;
