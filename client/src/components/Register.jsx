import { useState } from "react";
import { authAPI } from "../services/api";
import "./Auth.css";

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.username,
      });

      authAPI.setAuthData(response.data.token, response.data.user);
      onRegister(response.data.user);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        setError(errors.map((e) => e.msg).join(", "));
      } else {
        setError(err.response?.data?.error || "Registration failed");
      }
      // Don't clear fields on error
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
                  id="registerLogoGradient"
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
                fill="url(#registerLogoGradient)"
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
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Choose a username"
              required
              disabled={loading}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              required
              disabled={loading}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Display Name (optional)</label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              placeholder="How others will see you"
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
              placeholder="Create a password (min 6 characters)"
              required
              disabled={loading}
              minLength={6}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Re-enter your password"
              required
              disabled={loading}
              minLength={6}
              className="auth-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
