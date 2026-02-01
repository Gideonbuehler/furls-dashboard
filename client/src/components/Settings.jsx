import { useState, useEffect } from "react";
import "./Settings.css";
import { authAPI } from "../services/api";

function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    profileVisibility: "public",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    loadApiKey();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile({
        displayName: response.data.displayName || "",
        bio: response.data.bio || "",
        avatarUrl: response.data.avatarUrl || "",
        profileVisibility: response.data.profileVisibility || "public",
      });
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadApiKey = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getApiKey();
      setApiKey(response.data.api_key);
    } catch (err) {
      setError("Failed to load API key");
      console.error("Error loading API key:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (
      !window.confirm(
        "Are you sure you want to regenerate your API key? Your old key will stop working immediately."
      )
    ) {
      return;
    }

    try {
      setRegenerating(true);
      setError(null);
      setSuccess(null);
      const response = await authAPI.regenerateApiKey();
      setApiKey(response.data.api_key);
      setSuccess(
        "API key regenerated successfully! Update your BakkesMod plugin configuration."
      );
    } catch (err) {
      setError("Failed to regenerate API key");
      console.error("Error regenerating API key:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const response = await authAPI.updateProfile({
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      });

      // Update local storage with new user data
      const currentUser = authAPI.getCurrentUser();
      authAPI.setAuthData(localStorage.getItem("token"), {
        ...currentUser,
        ...response.data.user,
      });

      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      setProfileError(
        err.response?.data?.error || "Failed to update profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await authAPI.updatePrivacy({
        profileVisibility: profile.profileVisibility,
      });

      setProfileSuccess("Privacy settings updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      setProfileError(
        err.response?.data?.error || "Failed to update privacy settings"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="settings">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="settings">
      <div className="settings-container">
        <h2>⚙️ Settings</h2>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        {/* Profile Customization Section */}
        <div className="settings-section">
          <h3>👤 Profile Customization</h3>
          <p className="section-description">
            Personalize your profile with a display name, bio, and avatar.
          </p>

          {profileError && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={profile.displayName}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                placeholder="Enter your display name"
                maxLength={50}
                className="form-input"
              />
              <span className="form-hint">How your name appears to others</span>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
                className="form-textarea"
              />
              <span className="form-hint">
                {profile.bio.length}/500 characters
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="avatarUrl">Avatar URL</label>
              <input
                id="avatarUrl"
                type="url"
                value={profile.avatarUrl}
                onChange={(e) =>
                  setProfile({ ...profile, avatarUrl: e.target.value })
                }
                placeholder="https://example.com/avatar.png"
                className="form-input"
              />
              <span className="form-hint">
                URL to your profile picture (must be a valid image URL)
              </span>
            </div>

            {profile.avatarUrl && (
              <div className="avatar-preview">
                <span className="avatar-label">Preview:</span>
                <img
                  src={profile.avatarUrl}
                  alt="Avatar preview"
                  className="avatar-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.target.style.display = "block";
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-save"
              disabled={profileLoading}
            >
              {profileLoading ? "💾 Saving..." : "💾 Save Profile"}
            </button>
          </form>
        </div>

        {/* API Key Section */}
        <div className="settings-section">
          <h3>🔑 API Key</h3>
          <p className="section-description">
            Use this API key to configure your BakkesMod plugin to upload stats
            automatically.
          </p>

          <div className="api-key-container">
            <div className="api-key-display">
              <code className="api-key">
                {apiKey || "No API key available"}
              </code>
              <button
                className="btn-copy"
                onClick={handleCopyKey}
                disabled={!apiKey}
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>

            <button
              className="btn-regenerate"
              onClick={handleRegenerateKey}
              disabled={regenerating}
            >
              {regenerating ? "🔄 Regenerating..." : "🔄 Regenerate Key"}
            </button>
          </div>

          <div className="setup-instructions">
            <h4>📝 Plugin Setup Instructions</h4>
            <ol>
              <li>Open BakkesMod console (F6 in Rocket League)</li>
              <li>Copy your API key above</li>
              <li>
                Run these commands:
                <div className="code-block">
                  <code>furls_enable_upload 1</code>
                  <br />
                  <code>furls_api_key YOUR_API_KEY_HERE</code>
                  <br />
                  <code>furls_server_url https://furls-api.onrender.com</code>
                </div>
              </li>
              <li>
                Your stats will now automatically upload after each match!
              </li>
            </ol>
          </div>
        </div>

        <div className="settings-section">
          <h3>👁️ Privacy Settings</h3>
          <p className="section-description">
            Control who can see your profile and stats.
          </p>          <div className="privacy-controls">
            <label className="privacy-option">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={profile.profileVisibility === "public"}
                onChange={(e) =>
                  setProfile({ ...profile, profileVisibility: e.target.value })
                }
              />
              <span className="option-label">
                <strong>Public</strong>
                <span className="option-description">
                  Anyone can view your profile and stats
                </span>
              </span>
            </label>
            <label className="privacy-option">
              <input
                type="radio"
                name="visibility"
                value="friends"
                checked={profile.profileVisibility === "friends"}
                onChange={(e) =>
                  setProfile({ ...profile, profileVisibility: e.target.value })
                }
              />
              <span className="option-label">
                <strong>Friends Only</strong>
                <span className="option-description">
                  Only your friends can view your profile
                </span>
              </span>
            </label>
            <label className="privacy-option">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={profile.profileVisibility === "private"}
                onChange={(e) =>
                  setProfile({ ...profile, profileVisibility: e.target.value })
                }
              />
              <span className="option-label">
                <strong>Private</strong>
                <span className="option-description">
                  Only you can view your stats
                </span>
              </span>
            </label>
          </div>
          <button
            className="btn-save"
            onClick={handlePrivacyUpdate}
            disabled={profileLoading}
          >
            {profileLoading ? "💾 Saving..." : "💾 Save Privacy Settings"}
          </button>
        </div>

        <div className="settings-section">
          <h3>ℹ️ About</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Server:</span>
              <span className="info-value">furls-api.onrender.com</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value status-badge online">🟢 Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
