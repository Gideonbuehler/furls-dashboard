import { useState } from "react";
import { authAPI } from "../services/api";
import "./Auth.css";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      authAPI.setAuthData(response.data.token, response.data.user);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      // Don't clear fields on error - user can try again
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <svg
              className="logo-svg"
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="authLogoGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#bb86fc", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#7b1fa2", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>
              <path
                d="M10 8 L28 8 L28 12 L15 12 L15 18 L25 18 L25 22 L15 22 L15 32 L10 32 Z"
                fill="url(#authLogoGradient)"
              />
              <line
                x1="32"
                y1="12"
                x2="38"
                y2="12"
                stroke="#bb86fc"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
              <line
                x1="30"
                y1="20"
                x2="38"
                y2="20"
                stroke="#bb86fc"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="32"
                y1="28"
                x2="38"
                y2="28"
                stroke="#bb86fc"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
            <h1 className="logo-text">FURLS</h1>
          </div>
          <p className="auth-subtitle">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter your username"
              required
              disabled={loading}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              required
              disabled={loading}
              className="auth-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
