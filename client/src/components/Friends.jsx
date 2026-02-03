import { useState, useEffect } from "react";
import { friendsAPI } from "../services/api";
import PublicProfile from "./PublicProfile";
import "./Friends.css";

function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends"); // friends, requests, search
  const [viewingProfile, setViewingProfile] = useState(null); // username to view

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await friendsAPI.getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await friendsAPI.getFriendRequests();
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    try {
      const response = await friendsAPI.searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const sendRequest = async (username) => {
    try {
      await friendsAPI.sendFriendRequest(username);
      alert("Friend request sent!");
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to send request");
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptFriendRequest(requestId);
      loadFriends();
      loadRequests();
    } catch (error) {
      alert("Failed to accept request");
    }
  };

  const removeFriend = async (requestId) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      await friendsAPI.removeFriend(requestId);
      loadFriends();
    } catch (error) {
      alert("Failed to remove friend");
    }
  };
  return (
    <div className="friends-container">
      {viewingProfile ? (
        <div>
          <button
            className="back-button"
            onClick={() => setViewingProfile(null)}
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1.5rem",
              background: "rgba(139, 92, 246, 0.2)",
              border: "2px solid #bb86fc",
              borderRadius: "12px",
              color: "#bb86fc",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ← Back to Friends
          </button>
          <PublicProfile username={viewingProfile} />
        </div>
      ) : (
        <>
          <div className="friends-header">
            <h2>👥 Friends</h2>
            <div className="friends-tabs">
              <button
                className={activeTab === "friends" ? "active" : ""}
                onClick={() => setActiveTab("friends")}
              >
                Friends ({friends.length})
              </button>
              <button
                className={activeTab === "requests" ? "active" : ""}
                onClick={() => setActiveTab("requests")}
              >
                Requests {requests.length > 0 && `(${requests.length})`}
              </button>
              <button
                className={activeTab === "search" ? "active" : ""}
                onClick={() => setActiveTab("search")}
              >
                Add Friends
              </button>
            </div>
          </div>

          <div className="friends-content">
            {activeTab === "friends" && (
              <div className="friends-list">
                {loading ? (
                  <div className="loading">Loading friends...</div>
                ) : friends.length === 0 ? (
                  <div className="empty-state">
                    <p>No friends yet. Search for users to add them!</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.id} className="friend-card">
                      <div className="friend-avatar">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {friend.display_name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="friend-info">
                        <h3>{friend.display_name}</h3>
                        <p>@{friend.username}</p>
                        <small>
                          Friends since{" "}
                          {new Date(friend.friend_since).toLocaleDateString()}
                        </small>
                      </div>{" "}
                      <div className="friend-actions">
                        <button
                          className="btn-view"
                          onClick={() => setViewingProfile(friend.username)}
                        >
                          View Stats
                        </button>
                        <button
                          className="btn-remove"
                          onClick={() => removeFriend(friend.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="requests-list">
                {requests.length === 0 ? (
                  <div className="empty-state">
                    <p>No pending friend requests</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.request_id} className="request-card">
                      <div className="friend-avatar">
                        {request.avatar_url ? (
                          <img
                            src={request.avatar_url}
                            alt={request.username}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {request.display_name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="friend-info">
                        <h3>{request.display_name}</h3>
                        <p>@{request.username}</p>
                        <small>
                          {new Date(request.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="friend-actions">
                        <button
                          className="btn-accept"
                          onClick={() => acceptRequest(request.request_id)}
                        >
                          ✓ Accept
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => removeFriend(request.request_id)}
                        >
                          ✗ Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "search" && (
              <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">🔍 Search</button>
                </form>

                <div className="search-results">
                  {searchResults.length === 0
                    ? searchQuery.length > 0 && (
                        <div className="empty-state">
                          <p>No users found</p>
                        </div>
                      )
                    : searchResults.map((user) => (
                        <div key={user.id} className="user-card">
                          <div className="friend-avatar">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.username} />
                            ) : (
                              <div className="avatar-placeholder">
                                {user.display_name[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="friend-info">
                            <h3>{user.display_name}</h3>
                            <p>@{user.username}</p>
                          </div>
                          <div className="friend-actions">
                            <button
                              className="btn-add"
                              onClick={() => sendRequest(user.username)}
                            >
                              ➕ Add Friend
                            </button>{" "}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Friends;
