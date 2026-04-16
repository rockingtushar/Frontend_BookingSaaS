import axios from 'axios';

// Use environment variable for API URL, fallback to local for development
const API_BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 error occurs, clear local storage and redirect to login
    // but avoid redirecting if we are already on the login or register page
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
     if (error.response?.status === 429) {
      alert("Too many requests. Please wait a moment and try again.");
    }

    return Promise.reject(error);
  }
);

export default api;