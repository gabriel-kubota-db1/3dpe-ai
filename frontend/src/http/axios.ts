import axios from 'axios';
import { getToken } from '@/storage/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Make sure this matches your backend port
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
