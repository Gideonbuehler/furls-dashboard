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
        <h2>⚙️ Settings</h2>{" "}
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
        <div className="settings-note">
          <p>
            💡 <strong>Tip:</strong> Click your avatar in the top right to
            customize your profile!
          </p>
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
          </div>{" "}
          <div className="setup-instructions">
            <h4>📝 Plugin Setup Instructions</h4>
            <div className="instruction-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Open BakkesMod Console</h5>
                  <p>
                    Press <kbd>F6</kbd> while in Rocket League to open the
                    BakkesMod console
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Copy Your API Key</h5>
                  <p>Click the "📋 Copy" button above to copy your API key</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Configure the Plugin</h5>
                  <p>Open the FURLS control panel</p>
                  <div className="code-block">
                    <code>Find Dashboard Integration Section</code>
                    <code>Enable Automatic Uploads</code>
                    <code>Paste The API Key</code>
                  </div>
                  <p className="code-note">
                    💡 The plugin will use these URLs to upload your stats and
                    display the dashboard link
                  </p>
                </div>
              </div>{" "}
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Verify Connection</h5>
                  <p>
                    Queue a match. Your stats will
                    automatically upload when you exit the match!
                  </p>
                  <p className="success-note">
                    ✅ Check the "Plugin Status" indicator in the dashboard
                    header
                  </p>
                </div>
              </div>
            </div>

            <div className="help-box">
              <h5>❓ Need Help?</h5>
              <ul>
                <li>
                  <strong>Plugin not uploading?</strong> Make sure you've
                  enabled upload with <code>furls_enable_upload 1</code>
                </li>{" "}
                <li>
                  <strong>Wrong dashboard?</strong> Run{" "}
                  <code>furls_dashboard_url https://furls.net</code> to set the
                  correct URL
                </li>
                <li>
                  <strong>API key error?</strong> Regenerate your key above and
                  update it in the plugin
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <h3>ℹ️ About</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.3</span>
            </div>{" "}
            <div className="info-item">
              <span className="info-label">Server:</span>
              <span className="info-value">furls.net</span>
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
