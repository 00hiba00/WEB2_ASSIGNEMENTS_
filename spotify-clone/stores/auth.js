// stores/auth.js
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
      this.token = newToken;
      this.token_last_refresh = Date.now();
    },

    setRefreshToken(newRefreshToken) {
      this.refresh_token = newRefreshToken;
    },

    setUser(newUser) {
      this.user = newUser;
    },

    clearAuth() {
      this.token = null;
      this.refresh_token = null;
      this.user = null;
      this.token_last_refresh = null;
    },

    async refreshTokenIfNeeded() {
      // Check if token needs refresh (older than 50 minutes)
      const tokenAge = Date.now() - (this.token_last_refresh || 0);
      if (tokenAge > 50 * 60 * 1000 && this.refresh_token) {
        try {
          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(process.env.NUXT_SPOTIFY_CLIENT_ID + ':' + process.env.NUXT_SPOTIFY_CLIENT_SECRET)
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: this.refresh_token
            })
          });

          if (!response.ok) {
            throw new Error('Failed to refresh token');
          }

          const data = await response.json();
          this.setToken(data.access_token);
          if (data.refresh_token) {
            this.setRefreshToken(data.refresh_token);
          }
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
    isAuthenticated: (state) => !!state.token,
    isTokenValid: (state) => {
      if (!state.token || !state.token_last_refresh) return false;
      const tokenAge = Date.now() - state.token_last_refresh;
      return tokenAge < 60 * 60 * 1000; // Token is valid for 1 hour
    }
  }
});