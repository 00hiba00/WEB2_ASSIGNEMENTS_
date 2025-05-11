import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    player: null,
    deviceId: null,
    currentTrack: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    currentPlaylist: null,
    currentPlaylistIndex: 0,
    currentImage: null,
    error: null,
    isReady: false,
    pendingPlayRequest: null,
    initializationTimeout: null,
    playbackRetryCount: 0
  }),

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['currentTrack', 'volume', 'currentTime', 'currentPlaylist', 'currentPlaylistIndex', 'currentImage', 'isPlaying', 'isReady']
  },

  actions: {
    setPlayer(player) {
      console.log('=== Audio Store: Setting Player ===');
      console.log('Previous player state:', this.player ? 'exists' : 'null');
      this.player = player;
      console.log('New player state:', this.player ? 'exists' : 'null');

      // Reset retry count when setting new player
      this.playbackRetryCount = 0;
    },

    async registerDevice() {
      console.log('=== Registering Device with Spotify ===');
      const authStore = useAuthStore();

      try {
        // First, get available devices to check if our device is already registered
        const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        if (!devicesResponse.ok) {
          throw new Error('Failed to fetch devices');
        }

        const devices = await devicesResponse.json();
        console.log('Available devices:', devices);

        // Check if our device is already registered
        const ourDevice = devices.devices.find(d => d.id === this.deviceId);
        if (!ourDevice) {
          console.log('Device not found in Spotify devices list, attempting to register...');

          // Try to register the device by transferring playback
          const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              device_ids: [this.deviceId],
              play: false
            })
          });

          if (!transferResponse.ok) {
            throw new Error('Failed to register device');
          }

          console.log('Device registered successfully');
        } else {
          console.log('Device already registered');
        }

        return true;
      } catch (error) {
        console.error('Error registering device:', error);
        return false;
      }
    },

    async ensureDeviceRegistered() {
      console.log('=== Ensuring Device Registration ===');
      if (!this.deviceId || !this.isReady) {
        console.log('Device not ready for registration check');
        return false;
      }

      try {
        const authStore = useAuthStore();
        // First, check if our device is in the active devices list
        const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        if (!devicesResponse.ok) {
          throw new Error('Failed to fetch devices');
        }

        const devices = await devicesResponse.json();
        const ourDevice = devices.devices.find(d => d.id === this.deviceId);

        if (!ourDevice) {
          console.log('Device not found in active devices, attempting registration...');
          return await this.registerDevice();
        }

        // Even if device is found, ensure it's the active device
        const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [this.deviceId],
            play: false
          })
        });

        if (!transferResponse.ok) {
          console.error('Failed to set active device');
          return false;
        }

        console.log('Device is registered and active');
        return true;
      } catch (error) {
        console.error('Error ensuring device registration:', error);
        return false;
      }
    },

    async playTrack(track) {
      console.log('=== Audio Store: Play Track Request ===');

      // First, validate that we received a track object
      if (!track) {
        console.error('No track provided to playTrack');
        this.error = 'No track provided';
        return;
      }

      // Check if player is ready
      if (!this.isReady || !this.player || !this.deviceId) {
        console.log('Player not ready, queueing track for later');
        this.pendingPlayRequest = { type: 'track', data: track };
        this.error = 'Player initializing... Please wait.';
        return;
      }

      // Check authentication
      const authStore = useAuthStore();
      if (!authStore.token) {
        console.error('No auth token available');
        this.error = 'Authentication error';
        return;
      }

      // Debug log the raw track input
      console.log('Raw track input:', {
        type: typeof track,
        isProxy: !!track.__v_raw,
        constructor: track?.constructor?.name,
        properties: Object.getOwnPropertyNames(track),
        value: track
      });

      try {
        // If track is a Proxy, get the raw value
        const rawTrack = track.__v_raw || track;

        // Normalize track data - handle both direct track objects and playlist track objects
        const normalizedTrack = rawTrack.track || rawTrack;

        // Log normalized track structure
        console.log('Normalized track structure:', {
          hasUri: !!normalizedTrack.uri,
          hasId: !!normalizedTrack.id,
          hasSpotifyUrl: !!normalizedTrack.external_urls?.spotify,
          hasHref: !!normalizedTrack.href,
          properties: Object.keys(normalizedTrack),
          prototype: Object.getPrototypeOf(normalizedTrack),
          value: JSON.parse(JSON.stringify(normalizedTrack))
        });

        // Get the full Spotify URI for the track
        let uri;
        let uriSource = 'unknown';

        // Try different paths to find the URI or ID
        if (normalizedTrack.external_urls?.spotify) {
          // Extract ID from Spotify URL
          const spotifyUrl = normalizedTrack.external_urls.spotify;
          const idMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
          if (idMatch) {
            uri = `spotify:track:${idMatch[1]}`;
            uriSource = 'external_url';
          }
        }

        if (!uri && normalizedTrack.uri) {
          uri = normalizedTrack.uri;
          uriSource = 'direct_uri';
        }

        if (!uri && normalizedTrack.id) {
          uri = `spotify:track:${normalizedTrack.id}`;
          uriSource = 'id';
        }

        if (!uri && normalizedTrack.href) {
          // Extract ID from API href
          const idMatch = normalizedTrack.href.match(/tracks\/([a-zA-Z0-9]+)/);
          if (idMatch) {
            uri = `spotify:track:${idMatch[1]}`;
            uriSource = 'href';
          }
        }

        // Try nested track object if it exists
        if (!uri && normalizedTrack.track) {
          const nestedTrack = normalizedTrack.track;
          if (nestedTrack.uri) {
            uri = nestedTrack.uri;
            uriSource = 'nested_uri';
          } else if (nestedTrack.id) {
            uri = `spotify:track:${nestedTrack.id}`;
            uriSource = 'nested_id';
          } else if (nestedTrack.external_urls?.spotify) {
            const spotifyUrl = nestedTrack.external_urls.spotify;
            const idMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
            if (idMatch) {
              uri = `spotify:track:${idMatch[1]}`;
              uriSource = 'nested_external_url';
            }
          }
        }

        if (!uri) {
          // Enhanced error logging
          console.error('Could not determine track URI. Debug info:', {
            rawInput: typeof track === 'object' ? JSON.parse(JSON.stringify(track)) : track,
            normalizedTrack: typeof normalizedTrack === 'object' ? JSON.parse(JSON.stringify(normalizedTrack)) : normalizedTrack,
            attemptedSources: ['external_urls', 'uri', 'id', 'href', 'nested_track'],
            availableProperties: Object.keys(normalizedTrack),
            propertyDescriptors: Object.getOwnPropertyDescriptors(normalizedTrack)
          });
          this.error = 'Could not determine track URI';
          return;
        }

        console.log(`Successfully extracted URI from ${uriSource}:`, uri);

        // Always ensure device is registered and active before playing
        const isDeviceReady = await this.ensureDeviceRegistered();
        if (!isDeviceReady) {
          console.error('Failed to ensure device registration');
          if (this.playbackRetryCount < 3) {
            this.playbackRetryCount++;
            console.log(`Retrying playback after device registration (attempt ${this.playbackRetryCount}/3)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await this.playTrack(track);
          }
          this.error = 'Failed to register device. Please refresh the page.';
          this.isReady = false;
          return;
        }

        // Play the track using Spotify Connect API
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            uris: [uri]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Spotify API error:', {
            status: response.status,
            error: errorData
          });

          if (response.status === 404) {
            console.log('Device not found, attempting recovery...');
            this.isReady = false;

            if (this.playbackRetryCount < 3) {
              this.playbackRetryCount++;
              console.log(`Retrying playback (attempt ${this.playbackRetryCount}/3)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return await this.playTrack(track);
            }

            console.error('Device registration failed after retries');
            this.error = 'Failed to register device. Please refresh the page.';
          } else if (response.status === 403) {
            this.error = 'Premium account required for playback';
          } else {
            this.error = `Playback error: ${response.status}`;
          }
          return;
        }

        // Reset retry count on successful playback
        this.playbackRetryCount = 0;

        // Update the store with normalized track data
        this.currentTrack = {
          id: normalizedTrack.id || normalizedTrack.track?.id,
          name: normalizedTrack.name || normalizedTrack.track?.name,
          uri: uri,
          artists: normalizedTrack.artists || normalizedTrack.track?.artists || [],
          album: normalizedTrack.album || normalizedTrack.track?.album || { images: [] }
        };

        console.log('Setting current track:', this.currentTrack);

        this.isPlaying = true;
        this.currentPlaylist = null;
        this.currentPlaylistIndex = 0;
        this.currentImage = normalizedTrack.album?.images?.[0]?.url || normalizedTrack.track?.album?.images?.[0]?.url;
        this.error = null;
      } catch (error) {
        console.error('Error playing track:', error);
        this.error = 'Error playing track';
      }
    },

    setDeviceId(deviceId) {
      console.log('=== Audio Store: Setting Device ID ===');
      console.log('State before device ID update:', {
        previousDeviceId: this.deviceId,
        isReady: this.isReady,
        hasPendingRequest: !!this.pendingPlayRequest
      });

      this.deviceId = deviceId;
      this.isReady = true;
      this.error = null;

      if (this.pendingPlayRequest) {
        console.log('Processing pending request:', {
          type: this.pendingPlayRequest.type,
          data: this.pendingPlayRequest.data ? 'exists' : 'null'
        });

        const { type, data } = this.pendingPlayRequest;
        this.pendingPlayRequest = null;

        if (type === 'track') {
          console.log('Executing pending track request');
          this.playTrack(data);
        } else if (type === 'playlist') {
          console.log('Executing pending playlist request');
          this.playPlaylist(data.playlist, data.startIndex);
        }
      }

      console.log('Device ID setup completed:', {
        deviceId: this.deviceId,
        isReady: this.isReady,
        error: this.error
      });
    },

    updateFromPlayerState(state) {
      console.log('=== Audio Store: Updating Player State ===');
      console.log('New state:', {
        isPlaying: state.isPlaying,
        hasTrack: !!state.currentTrack,
        time: state.currentTime,
        duration: state.duration
      });

      this.isPlaying = state.isPlaying;

      // Only update track data if we have a new track
      if (state.currentTrack) {
        this.currentTrack = {
          id: state.currentTrack.id,
          name: state.currentTrack.name,
          uri: state.currentTrack.uri,
          artists: state.currentTrack.artists || [],
          album: state.currentTrack.album || { images: [] }
        };
        this.currentImage = state.currentTrack.album?.images?.[0]?.url;
      }

      this.currentTime = state.currentTime;
      this.duration = state.duration;

      console.log('Current track state:', {
        name: this.currentTrack?.name,
        artists: this.currentTrack?.artists?.map(a => a.name),
        image: this.currentImage
      });
    },

    async playPlaylist(playlist, startIndex = 0) {
      console.log('Attempting to play playlist:', playlist?.id);
      console.log('Player state:', {
        player: !!this.player,
        deviceId: this.deviceId,
        isReady: this.isReady
      });

      if (!this.isReady || !this.player || !this.deviceId) {
        console.log('Player not ready, queueing playlist for later');
        this.pendingPlayRequest = {
          type: 'playlist',
          data: { playlist, startIndex }
        };
        this.error = 'Player initializing...';
        return;
      }

      try {
        const authStore = useAuthStore();

        // Always ensure device is registered and active before playing
        const isDeviceReady = await this.ensureDeviceRegistered();
        if (!isDeviceReady) {
          console.error('Failed to ensure device registration');
          if (this.playbackRetryCount < 3) {
            this.playbackRetryCount++;
            console.log(`Retrying playlist playback after device registration (attempt ${this.playbackRetryCount}/3)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await this.playPlaylist(playlist, startIndex);
          }
          this.error = 'Failed to register device. Please refresh the page.';
          this.isReady = false;
          return;
        }

        // Play the playlist using Spotify Connect API
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            context_uri: `spotify:playlist:${playlist.id}`,
            offset: { position: startIndex }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Spotify API error:', response.status, errorData);

          if (response.status === 404) {
            console.log('Device not found, attempting recovery...');
            // Reset device registration state
            this.isReady = false;

            if (this.playbackRetryCount < 3) {
              this.playbackRetryCount++;
              console.log(`Retrying playlist playback (attempt ${this.playbackRetryCount}/3)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return await this.playPlaylist(playlist, startIndex);
            }

            console.error('Device registration failed after retries');
            this.error = 'Failed to register device. Please refresh the page.';
          } else {
            this.error = `Playback error: ${response.status}`;
          }
          return;
        }

        // Reset retry count on successful playback
        this.playbackRetryCount = 0;

        this.currentPlaylist = playlist;
        this.currentPlaylistIndex = startIndex;
        this.isPlaying = true;
        this.error = null;
      } catch (error) {
        console.error('Error playing playlist:', error);
        this.error = 'Error playing playlist';
      }
    },

    async pauseTrack() {
      if (!this.isReady || !this.player) {
        console.error('Player not ready for pause');
        return;
      }
      try {
        await this.player.pause();
        this.isPlaying = false;
      } catch (error) {
        console.error('Error pausing track:', error);
      }
    },

    async resumeTrack() {
      if (!this.isReady || !this.player) {
        console.error('Player not ready for resume');
        return;
      }
      try {
        await this.player.resume();
        this.isPlaying = true;
      } catch (error) {
        console.error('Error resuming track:', error);
      }
    },

    async togglePlay() {
      if (this.isPlaying) {
        await this.pauseTrack();
      } else {
        await this.resumeTrack();
      }
    },

    async seek(time) {
      if (!this.isReady || !this.player) {
        console.error('Player not ready for seek');
        return;
      }
      try {
        await this.player.seek(time * 1000); // Convert to milliseconds
      } catch (error) {
        console.error('Error seeking:', error);
      }
    },

    async setVolume(value) {
      if (!this.isReady || !this.player) {
        console.error('Player not ready for volume change');
        return;
      }
      try {
        await this.player.setVolume(value);
        this.volume = value;
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    },

    async playNextTrack() {
      if (!this.isReady || !this.player) {
        console.error('Player not ready for next track');
        return;
      }
      try {
        await this.player.nextTrack();
      } catch (error) {
        console.error('Error playing next track:', error);
      }
    },

    async playPreviousTrack() {
      if (!this.isReady || !this.player) {
        console.error('Player not ready for previous track');
        return;
      }
      try {
        await this.player.previousTrack();
      } catch (error) {
        console.error('Error playing previous track:', error);
      }
    },

    $reset() {
      this.player = null;
      this.deviceId = null;
      this.currentTrack = null;
      this.isPlaying = false;
      this.volume = 1;
      this.currentTime = 0;
      this.duration = 0;
      this.currentPlaylist = null;
      this.currentPlaylistIndex = 0;
      this.currentImage = null;
      this.error = null;
      this.isReady = false;
      this.pendingPlayRequest = null;

      // Clear any existing initialization timeout
      if (this.initializationTimeout) {
        clearTimeout(this.initializationTimeout);
        this.initializationTimeout = null;
      }
    }
  }
});