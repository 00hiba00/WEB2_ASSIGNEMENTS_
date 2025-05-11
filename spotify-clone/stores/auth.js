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
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token
  }
});