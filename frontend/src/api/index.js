// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
});

// Request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo'); // Get token from localStorage
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;