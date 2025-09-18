import axios from 'axios';
import { getToken, clearAllTokens } from '@/storage/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add the JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Use bracket notation for header for maximum compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Debug logging for prescription requests
    if (config.url?.includes('/prescriptions') && config.method !== 'get') {
      console.log('=== AXIOS REQUEST DEBUG ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Data being sent:', config.data);
      console.log('Palmilhogram in request data:', config.data?.palmilhogram);
      console.log('Stringified request data:', JSON.stringify(config.data, null, 2));
      console.log('=== END AXIOS REQUEST DEBUG ===');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global authentication errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Don't redirect if it's a logout request that failed
      if (error.config?.url?.includes('/auth/logout')) {
        return Promise.reject(error);
      }
      
      // If we get a 401, the token is invalid or expired.
      // Remove the token and redirect to the login page.
      clearAllTokens();
      // Use window.location to redirect outside of React Router's context
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
