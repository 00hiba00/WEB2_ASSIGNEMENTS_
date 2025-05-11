// composables/useAuth.js
export const useAuth = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  // Helper function to generate random string
  const generateRandomString = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Spotify authentication scopes
  const spotifyScopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-top-read',
    'playlist-read-collaborative',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-library-read',
    'user-library-modify'
  ];

  const login = () => {
    const state = generateRandomString();
    localStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.public.spotifyClientId,
      scope: spotifyScopes.join(' '),
      redirect_uri: config.public.spotifyRedirectUri,
      state: state,
      show_dialog: false
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const handleCallback = async () => {
    try {
      // Verify state parameter
      const savedState = localStorage.getItem('spotify_auth_state');
      if (route.query.state.toString() !== savedState) {
        throw new Error('State parameter mismatch - possible CSRF attack');
      }
      localStorage.removeItem('spotify_auth_state');

      // Check for authorization code
      if (!route.query.code) {
        throw new Error('Authorization code missing from callback');
      }

      // Exchange code for token
      const tokenResponse = await $fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(
            `${config.public.spotifyClientId}:${config.public.spotifyClientSecret}`
          )}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: route.query.code.toString(),
          redirect_uri: config.public.spotifyRedirectUri
        })
      });

      if (!tokenResponse.access_token) {
        throw new Error('Failed to retrieve access token');
      }

      // Store tokens and fetch user data
      authStore.setToken(tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        authStore.setRefreshToken(tokenResponse.refresh_token);
      }
      await fetchUserProfile();

      // Redirect to home page after successful auth
      await router.push('/');

    } catch (error) {
      console.error('Authentication error:', error);
      authStore.clearAuth();
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userData = await $fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      authStore.setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };

  const logout = () => {
    authStore.clearAuth();
    router.push('/login');
  };

  return {
    token: computed(() => authStore.token),
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    login,
    handleCallback,
    logout
  };
};