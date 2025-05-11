<template>
  <div>
    <div v-if="isReady" class="spotify-player">
      Player Ready
    </div>
    <div v-else-if="playerError" class="text-red-500 p-4">
      {{ playerError }}
      <button 
        v-if="playerError.includes('Premium')" 
        @click="openSpotifyPremium" 
        class="ml-2 underline hover:text-green-500"
      >
        Get Spotify Premium
      </button>
    </div>
    <div v-else class="text-gray-500 p-4">
      Initializing player...
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAudioStore } from '@/stores/audio';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const audioStore = useAudioStore();
const isReady = ref(false);
const player = ref(null);
const playerError = ref(null);
const initializationAttempts = ref(0);
const MAX_INITIALIZATION_ATTEMPTS = 3;
const INITIALIZATION_TIMEOUT = 15000;
const INITIALIZATION_RETRY_DELAY = 2000;

const openSpotifyPremium = () => {
  window.open('https://www.spotify.com/premium', '_blank');
};

// Load the Spotify Web Playback SDK Script
const loadSpotifyScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('spotify-player-script')) {
      resolve();
      return;
    }
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Spotify SDK load timeout'));
    }, INITIALIZATION_TIMEOUT);
    
    // Define the callback before loading the script
    window.onSpotifyWebPlaybackSDKReady = () => {
      clearTimeout(timeoutId);
      console.log('Spotify SDK is ready');
      resolve();
    };
    
    const script = document.createElement('script');
    script.id = 'spotify-player-script';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      reject(error);
    };
    
    document.body.appendChild(script);
  });
};

const validateAuth = async () => {
  console.log('=== Validating Authentication ===');
  console.log('Current auth state:', {
    hasToken: !!authStore.token,
    hasRefreshToken: !!authStore.refresh_token,
    lastRefresh: authStore.token_last_refresh,
    isAuthenticated: authStore.isAuthenticated
  });

  if (!authStore.isAuthenticated) {
    console.error('Not authenticated, redirecting to login');
    router.push('/login');
    return false;
  }

  // Try to refresh token
  console.log('Attempting to refresh token...');
  const refreshResult = await authStore.refreshTokenIfNeeded(true);
  console.log('Token refresh result:', refreshResult);

  if (!refreshResult || !authStore.token) {
    console.error('Failed to obtain valid token');
    router.push('/login');
    return false;
  }

  return true;
};

const resetPlayer = async () => {
  console.log('Resetting player state');
  if (player.value) {
    try {
      await player.value.disconnect();
    } catch (error) {
      console.error('Error disconnecting player:', error);
    }
  }
  player.value = null;
  isReady.value = false;
  playerError.value = null;
  audioStore.$reset();
  initializationAttempts.value = 0;
};

const initializePlayer = async () => {
  try {
    console.log('=== Starting Player Initialization ===');
    
    // Reset any existing player state
    await resetPlayer();
    
    // Validate auth first
    const isValid = await validateAuth();
    if (!isValid) {
      throw new Error('Authentication validation failed');
    }

    // Load SDK if needed
    if (!window.Spotify) {
      console.log('Loading Spotify SDK...');
      await loadSpotifyScript();
      console.log('SDK loaded successfully');
    }

    console.log('Creating player instance...');
    player.value = new Spotify.Player({
      name: 'Spotify Clone Web Player',
      getOAuthToken: async (cb) => {
        const isValid = await validateAuth();
        if (isValid) {
          console.log('Providing token to player');
          cb(authStore.token);
        }
      },
      volume: 1.0
    });

    if (!player.value) {
      throw new Error('Failed to create player instance');
    }

    // Set up error handlers
    player.value.addListener('initialization_error', async ({ message }) => {
      console.error('Player initialization error:', message);
      playerError.value = `Initialization error: ${message}`;
      await resetPlayer();
      
      if (initializationAttempts.value < MAX_INITIALIZATION_ATTEMPTS) {
        initializationAttempts.value++;
        console.log(`Retrying initialization (${initializationAttempts.value}/${MAX_INITIALIZATION_ATTEMPTS})`);
        setTimeout(initializePlayer, INITIALIZATION_RETRY_DELAY);
      }
    });

    player.value.addListener('authentication_error', async ({ message }) => {
      console.error('Player authentication error:', message);
      playerError.value = `Authentication error: ${message}`;
      await resetPlayer();
      router.push('/login');
    });

    player.value.addListener('account_error', async ({ message }) => {
      console.error('Player account error:', message);
      playerError.value = `Premium required: ${message}`;
      await resetPlayer();
    });

    player.value.addListener('playback_error', ({ message }) => {
      console.error('Playback error:', message);
      playerError.value = `Playback error: ${message}`;
    });

    // Set up ready handler
    player.value.addListener('ready', async ({ device_id }) => {
      console.log('Player ready with device ID:', device_id);
      try {
        audioStore.setPlayer(player.value);
        audioStore.setDeviceId(device_id);
        isReady.value = true;
        playerError.value = null;
        initializationAttempts.value = 0;
        await player.value.setVolume(1.0);
        
        const state = await player.value.getCurrentState();
        if (state) {
          audioStore.updateFromPlayerState({
            isPlaying: !state.paused,
            currentTrack: state.track_window.current_track,
            currentTime: state.position / 1000,
            duration: state.duration / 1000
          });
        }
      } catch (error) {
        console.error('Error in ready handler:', error);
        playerError.value = 'Error initializing player';
        await resetPlayer();
      }
    });

    player.value.addListener('not_ready', async ({ device_id }) => {
      console.error('Player became not ready:', device_id);
      isReady.value = false;
      audioStore.setDeviceId(null);
    });

    // Connect to player
    console.log('Connecting to player...');
    const connected = await player.value.connect();
    if (!connected) {
      throw new Error('Failed to connect to player');
    }
    console.log('Successfully connected to player');

  } catch (error) {
    console.error('Player initialization failed:', error);
    playerError.value = error.message;
    await resetPlayer();
    
    if (initializationAttempts.value < MAX_INITIALIZATION_ATTEMPTS) {
      initializationAttempts.value++;
      console.log(`Retrying initialization (${initializationAttempts.value}/${MAX_INITIALIZATION_ATTEMPTS})`);
      setTimeout(initializePlayer, INITIALIZATION_RETRY_DELAY);
    }
  }
};

// Watch for auth changes
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  console.log('Auth state changed:', isAuthenticated);
  if (isAuthenticated && !isReady.value) {
    console.log('Auth restored, reinitializing player');
    await initializePlayer();
  } else if (!isAuthenticated) {
    console.log('Auth lost, resetting player');
    await resetPlayer();
  }
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    console.log('Not authenticated on mount, redirecting to login');
    router.push('/login');
    return;
  }
  await initializePlayer();
});

onUnmounted(async () => {
  await resetPlayer();
});
</script>

<style scoped>
.spotify-player {
  min-height: 50px;
  background: #282828;
  color: white;
  padding: 1rem;
}
</style> 