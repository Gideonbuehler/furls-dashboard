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
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview and compress
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (base64) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Maximum dimensions
      const MAX_SIZE = 400;

      let width = img.width;
      let height = img.height;

      // Calculate new dimensions (keep aspect ratio)
      if (width > height) {
        if (width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with quality reduction (0.7 = 70% quality)
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      setPreviewUrl(compressed);
    };
    img.onerror = () => {
      setError("Failed to load image");
    };
    img.src = base64;
  };

  const handleImageUpload = async () => {
    if (!previewUrl) {
      setError("No image to upload");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await authAPI.uploadAvatar({ avatar: previewUrl });

      setProfile({ ...profile, avatarUrl: response.data.avatarUrl });
      setSuccess("Avatar uploaded successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);

      // Update local storage
      const currentUser = authAPI.getCurrentUser();
      authAPI.setAuthData(localStorage.getItem("token"), {
        ...currentUser,
        avatarUrl: response.data.avatarUrl,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
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
            </div>{" "}
            <div className="form-group">
              <label>Profile Picture</label>

              <div className="avatar-upload-section">
                <div className="avatar-preview-large">
                  {previewUrl || profile.avatarUrl ? (
                    <img
                      src={previewUrl || profile.avatarUrl}
                      alt="Avatar"
                      className="avatar-img-large"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          profile.displayName || user?.username || "U"
                        )}&size=200&background=bb86fc&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {(profile.displayName || user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>                <div className="upload-controls">
                  <label className="file-upload-btn">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                  </label>

                  {selectedFile && (
                    <button
                      type="button"
                      className="btn-upload"
                      onClick={handleImageUpload}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  )}
                </div>

                <span className="form-hint">
                  Max 5MB • JPG, PNG, GIF • Square images work best
                </span>
              </div>

              <div className="form-divider">
                <span>OR</span>
              </div>

              <label htmlFor="avatarUrl">Use Image URL</label>
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
                Paste a URL to your profile picture
              </span>
            </div>            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div className="privacy-section">
            <h3>Privacy Settings</h3>
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
                  <strong>Friends Only</strong> - Only friends can view
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
              {loading ? "Saving..." : "Update Privacy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
