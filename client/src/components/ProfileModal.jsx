import { useState, useEffect } from "react";
import "./ProfileModal.css";
import { authAPI } from "../services/api";

function ProfileModal({ isOpen, onClose, user }) {
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    profileVisibility: "public",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

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

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setSuccess(null);
        window.location.reload(); // Refresh to show updated avatar
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authAPI.updatePrivacy({
        profileVisibility: profile.profileVisibility,
      });

      setSuccess("Privacy settings updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update privacy settings"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
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

            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "💾 Saving..." : "💾 Save Profile"}
            </button>
          </form>

          <div className="privacy-section">
            <h3>👁️ Privacy Settings</h3>
            <div className="privacy-controls">
              <label className="privacy-option">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={profile.profileVisibility === "public"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profileVisibility: e.target.value,
                    })
                  }
                />
                <span className="option-label">
                  <strong>Public</strong> - Anyone can view your profile
                </span>
              </label>
              <label className="privacy-option">
                <input
                  type="radio"
                  name="visibility"
                  value="friends"
                  checked={profile.profileVisibility === "friends"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profileVisibility: e.target.value,
                    })
                  }
                />
                <span className="option-label">
                  <strong>Friends Only</strong> - Only friends can view your
                  profile
                </span>
              </label>
              <label className="privacy-option">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={profile.profileVisibility === "private"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profileVisibility: e.target.value,
                    })
                  }
                />
                <span className="option-label">
                  <strong>Private</strong> - Only you can view your stats
                </span>
              </label>
            </div>
            <button
              className="btn-save"
              onClick={handlePrivacyUpdate}
              disabled={loading}
            >
              {loading ? "💾 Saving..." : "💾 Save Privacy Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
