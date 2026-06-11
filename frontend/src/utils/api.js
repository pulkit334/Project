import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://backend-ff8c.onrender.com/api',
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
