import { useState } from "react";
import "./PlayerSearch.css";
import { publicAPI } from "../services/api";
import PublicProfile from "./PublicProfile";

function PlayerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSelectedUsername(null); // Clear selected player
      const response = await publicAPI.searchPlayers(searchQuery);
      // API returns array directly, not wrapped in {players: []}
      const players = Array.isArray(response.data) ? response.data : [];
      setSearchResults(players);
      if (players.length === 0) {
        setError("No players found");
      }
    } catch (err) {
      setError("Failed to search players");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = (username) => {
    setSelectedUsername(username);
    setSearchResults([]); // Clear search results
  };

  const backToSearch = () => {
    setSelectedUsername(null);
    setSearchQuery("");
  };

  const formatAccuracy = (player) => {
    if (!player.total_shots || player.total_shots === 0) return "N/A";
    return `${((player.total_goals / player.total_shots) * 100).toFixed(1)}%`;
  };

  // If viewing a profile, show the PublicProfile component
  if (selectedUsername) {
    return (
      <div className="player-search-with-profile">
        <PublicProfile username={selectedUsername} onBack={backToSearch} />
      </div>
    );
  }

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
            {loading ? "🔄 Searching..." : "🔍 Search"}
          </button>
        </form>
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}{" "}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results ({searchResults.length})</h3>
            <div className="results-list">
              {searchResults.map((player, index) => (
                <div key={player.username || index} className="player-card">
                  <div className="player-avatar-small">
                    {player.avatar_url ? (
                      <img src={player.avatar_url} alt={player.username} />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {(player.display_name || player.username)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="player-info">
                    <h4>{player.display_name || player.username}</h4>
                    <p className="username">@{player.username}</p>
                    <div className="player-stats-preview">
                      <span>🎯 {formatAccuracy(player)}</span>
                      <span>🎮 {player.total_sessions || 0} sessions</span>
                      <span>⚽ {player.total_goals || 0} goals</span>
                    </div>
                  </div>
                  <button
                    className="btn-view-profile"
                    onClick={() => viewProfile(player.username)}
                  >
                    View Profile →
                  </button>
                </div>
              ))}{" "}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerSearch;
