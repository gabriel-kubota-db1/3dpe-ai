const TOKEN_KEY = '3dpe_auth_token';
const REFRESH_TOKEN_KEY = '3dpe_refresh_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token from localStorage:', error);
    return null;
  }
};

export const setRefreshToken = (refreshToken: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error setting refresh token in localStorage:', error);
  }
};

export const removeRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token from localStorage:', error);
  }
};

export const clearAllTokens = (): void => {
  removeToken();
  removeRefreshToken();
};

// Helper function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse it, consider it expired
  }
};