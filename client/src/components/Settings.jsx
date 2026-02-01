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

  useEffect(() => {
    loadApiKey();
  }, []);

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
          </p>
          <div className="privacy-controls">
            <label className="privacy-option">
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked
              />
              <span className="option-label">
                <strong>Public</strong>
                <span className="option-description">
                  Anyone can view your profile and stats
                </span>
              </span>
            </label>
            <label className="privacy-option">
              <input type="radio" name="visibility" value="friends" />
              <span className="option-label">
                <strong>Friends Only</strong>
                <span className="option-description">
                  Only your friends can view your profile
                </span>
              </span>
            </label>
            <label className="privacy-option">
              <input type="radio" name="visibility" value="private" />
              <span className="option-label">
                <strong>Private</strong>
                <span className="option-description">
                  Only you can view your stats
                </span>
              </span>
            </label>
          </div>
          <button className="btn-save">Save Privacy Settings</button>
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
