import axios from "axios";

// Base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://192.168.18.97:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor — attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("chat_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and reload
      localStorage.removeItem("chat_token");
      localStorage.removeItem("chat_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;