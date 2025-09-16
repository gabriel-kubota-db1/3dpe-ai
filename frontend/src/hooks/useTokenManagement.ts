import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getToken, isTokenExpired } from '@/storage/token';

const TOKEN_CHECK_INTERVAL = 60000; // Check every minute
const TOKEN_REFRESH_THRESHOLD = 300000; // Refresh if token expires in 5 minutes

export const useTokenManagement = () => {
  const { logout, refreshUser, isAuthenticated } = useAuth();

  const checkTokenExpiry = useCallback(async () => {
    if (!isAuthenticated) return;

    const token = getToken();
    if (!token) {
      logout();
      return;
    }

    try {
      // Parse token to get expiry time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (payload.exp - currentTime) * 1000;

      // If token is expired, logout
      if (isTokenExpired(token)) {
        console.log('Token expired, logging out');
        logout();
        return;
      }

      // If token expires soon, try to refresh user data (which will trigger refresh)
      if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
        console.log('Token expires soon, refreshing...');
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          logout();
        }
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      logout();
    }
  }, [isAuthenticated, logout, refreshUser]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial check
    checkTokenExpiry();

    // Set up periodic checks
    const interval = setInterval(checkTokenExpiry, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkTokenExpiry, isAuthenticated]);

  return { checkTokenExpiry };
};
