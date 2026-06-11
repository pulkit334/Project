import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-ff8c.onrender.com/api',
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
