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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate username format
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
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-card">
      <h2>
        <span style={{ fontSize: '2rem' }}>🚗</span>
        Create Your Account
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="username123"
            required
            minLength={3}
            maxLength={30}
            disabled={loading}
          />
          <label>Username *</label>
          <small>Letters, numbers, and underscores only</small>
        </div>
        <div className="form-group">
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="you@example.com"
            required
            disabled={loading}
          />
          <label>Email *</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.target.value })
            }
            placeholder="Your Name (optional)"
            maxLength={50}
            disabled={loading}
          />
          <label>Display Name</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="At least 6 characters"
            required
            minLength={6}
            disabled={loading}
          />
          <label>Password *</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
          <label>Confirm Password *</label>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default Register;
