import axios from 'axios';
import { getToken, setToken, clearAllTokens, isTokenExpired, getRefreshToken, setRefreshToken } from '@/storage/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add the JWT token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    let token = getToken();
    
    // Check if token exists and is expired
    if (token && isTokenExpired(token)) {
      // If we're already refreshing, wait for the process to complete
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          config.headers['Authorization'] = `Bearer ${getToken()}`;
          return config;
        });
      }
      
      // Try to refresh the token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          isRefreshing = true;
          const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
            refreshToken
          });
          const newToken = refreshResponse.data.token;
          const newRefreshToken = refreshResponse.data.refreshToken;
          
          setToken(newToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          token = newToken;
          processQueue(null, newToken);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAllTokens();
          // Don't redirect here, let the AuthContext handle it
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available
        clearAllTokens();
        throw new Error('No refresh token available');
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If this is not a refresh request or profile request, try to refresh
      if (!originalRequest.url?.includes('/auth/refresh') && 
          !originalRequest.url?.includes('/users/profile')) {
        
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            originalRequest.headers['Authorization'] = `Bearer ${getToken()}`;
            return api(originalRequest);
          });
        }
        
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            isRefreshing = true;
            const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
              refreshToken
            });
            const newToken = refreshResponse.data.token;
            const newRefreshToken = refreshResponse.data.refreshToken;
            
            setToken(newToken);
            if (newRefreshToken) {
              setRefreshToken(newRefreshToken);
            }
            processQueue(null, newToken);
            
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            clearAllTokens();
            // Let AuthContext handle the redirect
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
