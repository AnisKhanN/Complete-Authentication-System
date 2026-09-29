import axios from "axios";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending and receiving httpOnly cookies
});

// Flag and queue to handle concurrent 401 errors gracefully without multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Listeners for auth events (e.g. session expired)
const authListeners = new Set();
export const onSessionExpired = (callback) => {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
};

const notifySessionExpired = () => {
  authListeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error("Error in auth listener:", err);
    }
  });
};

// Response Interceptor for handling 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there is no response (network down/timeout) or error doesn't have status, reject
    if (!error.response) {
      return Promise.reject(error);
    }

    // Endpoints that should NOT trigger a refresh-token loop
    const isAuthBypassEndpoint =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/refresh-token") ||
      originalRequest.url?.includes("/send-otp") ||
      originalRequest.url?.includes("/verify-otp") ||
      originalRequest.url?.includes("/reset-password");

    // Handle 401 Unauthorized
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthBypassEndpoint
    ) {
      if (isRefreshing) {
        // Another refresh request is already underway, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt session recovery using the refresh token cookie
        await axios.post(
          `${API_BASE_URL}/refresh-token`,
          {},
          { withCredentials: true },
        );

        // Notify queued requests that session was restored
        processQueue(null);
        isRefreshing = false;

        // Retry original request with newly issued session cookie
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Only notify expired session if a token was actually present and expired/invalid
        if (error.response?.data?.message !== "Token not found") {
          notifySessionExpired();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
