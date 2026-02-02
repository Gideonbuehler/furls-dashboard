import axios from "axios";

// In production, use relative URLs (served from same origin)
// In development, Vite proxy will forward /api to localhost:3002
const API_URL = "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect - let the app handle it
    // Just pass the error through
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  getApiKey: () => api.get("/auth/api-key"),
  regenerateApiKey: () => api.post("/auth/regenerate-api-key"),

  // Helper to store auth data
  setAuthData: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  // Helper to get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Helper to check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  // Update profile
  updateProfile: (profileData) => api.put("/auth/profile", profileData),

  // Update privacy settings
  updatePrivacy: (privacyData) => api.put("/auth/privacy", privacyData),
  // Upload avatar image
  uploadAvatar: (imageData) => {
    return api.post("/auth/upload-avatar", imageData);
  },
};

// Friends API
export const friendsAPI = {
  getFriends: () => api.get("/friends"),
  getFriendRequests: () => api.get("/friends/requests"),
  getSentRequests: () => api.get("/friends/requests/sent"),
  sendFriendRequest: (username) => api.post("/friends/request", { username }),
  acceptFriendRequest: (requestId) => api.post(`/friends/accept/${requestId}`),
  removeFriend: (requestId) => api.delete(`/friends/${requestId}`),
  searchUsers: (query) => api.get(`/friends/search?q=${query}`),
};

// Stats API
export const statsAPI = {
  saveSession: (statsData) => api.post("/user/stats/save", statsData),
  getHistory: (limit = 50, offset = 0) =>
    api.get(`/user/stats/history?limit=${limit}&offset=${offset}`),
  getAllTimeStats: () => api.get("/user/stats/alltime"),
  getSession: (sessionId) => api.get(`/user/stats/session/${sessionId}`),
  getFriendStats: (friendId) => api.get(`/user/stats/friend/${friendId}`),  getLeaderboard: (type = "friends", stat = "accuracy") =>
    api.get(`/user/stats/leaderboard?type=${type}&stat=${stat}`),
  getPluginStatus: () => api.get("/user/stats/plugin-status"), // Check if plugin is connected
  getHeatmap: () => api.get("/user/stats/heatmap"), // Get aggregated heatmap data
};

// Public API (no authentication required)
export const publicAPI = {
  getPublicProfile: (username) => api.get(`/public/profile/${username}`),
  getPublicStats: (username) => api.get(`/public/stats/${username}`),
  searchPlayers: (query) => api.get(`/public/search?q=${query}`),
  getLeaderboard: (stat = "accuracy") => api.get(`/public/leaderboard/${stat}`),
};

// Legacy local stats API (for backward compatibility)
export const localStatsAPI = {
  getCurrent: () => axios.get(`${API_URL}/stats/current`),
  getHistory: () => axios.get(`${API_URL}/stats/history`),
  getAllTime: () => axios.get(`${API_URL}/stats/alltime`),
  getHeatmap: () => axios.get(`${API_URL}/heatmap`),
  getHealth: () => axios.get(`${API_URL}/health`),
};

export default api;
