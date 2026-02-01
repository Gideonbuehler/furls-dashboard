import { useState } from 'react';
import './PlayerSearch.css';
import { publicAPI } from '../services/api';

function PlayerSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await publicAPI.searchPlayers(searchQuery);
      setSearchResults(response.data.players || []);
      if (response.data.players.length === 0) {
        setError('No players found');
      }
    } catch (err) {
      setError('Failed to search players');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = async (username) => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicAPI.getProfile(username);
      setSelectedPlayer(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAccuracy = (accuracy) => {
    return accuracy ? `${accuracy.toFixed(1)}%` : 'N/A';
  };

  return (
    <div className="player-search">
      <div className="search-container">
        <h2>🔍 Search Players</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter username..."
            className="search-input"
          />
          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? '🔄 Searching...' : '🔍 Search'}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {searchResults.length > 0 && !selectedPlayer && (
          <div className="search-results">
            <h3>Search Results ({searchResults.length})</h3>
            <div className="results-list">
              {searchResults.map((player) => (
                <div key={player.id} className="player-card">
                  <div className="player-info">
                    <h4>{player.display_name || player.username}</h4>
                    <p className="username">@{player.username}</p>
                    <div className="player-stats-preview">
                      <span>🎯 {formatAccuracy(player.accuracy)}</span>
                      <span>🎮 {player.total_sessions || 0} sessions</span>
                      <span>⚽ {player.total_goals || 0} goals</span>
                    </div>
                  </div>
                  <button 
                    className="btn-view-profile"
                    onClick={() => viewProfile(player.username)}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPlayer && (
          <div className="player-profile">
            <button 
              className="btn-back"
              onClick={() => setSelectedPlayer(null)}
            >
              ← Back to Results
            </button>

            <div className="profile-header">
              <div className="profile-avatar">
                {(selectedPlayer.display_name || selectedPlayer.username).charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <h2>{selectedPlayer.display_name || selectedPlayer.username}</h2>
                <p className="username">@{selectedPlayer.username}</p>
                <p className="last-active">
                  Last active: {formatDate(selectedPlayer.last_active)}
                </p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{formatAccuracy(selectedPlayer.accuracy)}</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-value">{selectedPlayer.total_sessions || 0}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚀</div>
                <div className="stat-value">{selectedPlayer.total_shots || 0}</div>
                <div className="stat-label">Total Shots</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚽</div>
                <div className="stat-value">{selectedPlayer.total_goals || 0}</div>
                <div className="stat-label">Total Goals</div>
              </div>
            </div>

            {selectedPlayer.recent_sessions && selectedPlayer.recent_sessions.length > 0 && (
              <div className="recent-sessions">
                <h3>📊 Recent Sessions</h3>
                <div className="sessions-list">
                  {selectedPlayer.recent_sessions.map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-date">
                        {formatDate(session.timestamp)}
                      </div>
                      <div className="session-stats">
                        <span>🚀 {session.total_shots} shots</span>
                        <span>⚽ {session.total_goals} goals</span>
                        <span>🎯 {formatAccuracy(session.accuracy)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerSearch;
