// stores/auth.js
import { useRuntimeConfig } from '#app'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refresh_token: null,
    user: null,
    token_last_refresh: null
  }),

  persist: true,

  actions: {
    setToken(newToken) {
      console.log('Setting new access token:', newToken?.substring(0, 10) + '...');
      this.token = newToken;
      this.token_last_refresh = Date.now();
    },

    setRefreshToken(newRefreshToken) {
      console.log('Setting new refresh token:', newRefreshToken?.substring(0, 10) + '...');
      this.refresh_token = newRefreshToken;
    },

    setUser(newUser) {
      this.user = newUser;
    },

    clearAuth() {
      console.log('Clearing auth state');
      this.token = null;
      this.refresh_token = null;
      this.user = null;
      this.token_last_refresh = null;
    },

    async refreshTokenIfNeeded(force = false) {
      const config = useRuntimeConfig();

      // Check if token needs refresh (older than 50 minutes)
      const tokenAge = Date.now() - (this.token_last_refresh || 0);
      const needsRefresh = force || tokenAge > 50 * 60 * 1000;

      console.log('Token refresh check:', {
        tokenAge: Math.round(tokenAge / 1000) + 's',
        force,
        needsRefresh,
        hasRefreshToken: !!this.refresh_token,
        hasClientId: !!config.public.spotifyClientId,
        hasClientSecret: !!config.public.spotifyClientSecret
      });

      if (needsRefresh && this.refresh_token) {
        try {
          console.log('Attempting to refresh token...');

          if (!config.public.spotifyClientId || !config.public.spotifyClientSecret) {
            throw new Error('Missing Spotify credentials');
          }

          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(config.public.spotifyClientId + ':' + config.public.spotifyClientSecret)
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: this.refresh_token
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Token refresh failed:', response.status, errorData);
            throw new Error('Failed to refresh token: ' + response.status);
          }

          const data = await response.json();
          console.log('Token refresh successful');

          this.setToken(data.access_token);
          if (data.refresh_token) {
            this.setRefreshToken(data.refresh_token);
          }
          return true;
        } catch (error) {
          console.error('Error refreshing token:', error);
          this.clearAuth();
          return false;
        }
      }
      return true;
    }
  },

  getters: {
    isAuthenticated: (state) => {
      const isAuth = !!state.token;
      console.log('Checking authentication:', isAuth);
      return isAuth;
    },
    isTokenValid: (state) => {
      if (!state.token || !state.token_last_refresh) return false;
      const tokenAge = Date.now() - state.token_last_refresh;
      const isValid = tokenAge < 60 * 60 * 1000; // Token is valid for 1 hour
      console.log('Checking token validity:', {
        tokenAge: Math.round(tokenAge / 1000) + 's',
        isValid
      });
      return isValid;
    }
  }
});