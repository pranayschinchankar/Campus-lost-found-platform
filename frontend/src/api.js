import axios from 'axios';

// base API client - all requests go through here
const api = axios.create({
  baseURL: 'https://campus-lost-found-platform.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

// automatically attach the auth token to every request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if we get a 401, the token is gone or expired - send to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;