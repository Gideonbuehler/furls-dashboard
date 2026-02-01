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
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-card">
      <h2>
        <span style={{ fontSize: '2rem' }}>🚗</span>
        Welcome to FURLS
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Username or Email"
            required
            disabled={loading}
          />
          <label>Username or Email</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Password"
            required
            disabled={loading}
          />
          <label>Password</label>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
