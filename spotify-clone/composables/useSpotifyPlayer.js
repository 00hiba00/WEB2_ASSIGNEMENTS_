import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useSpotifyPlayer() {
    const player = ref(null)
    const deviceId = ref(null)
    const isPlayerReady = ref(false)
    const isAuthenticated = ref(false)
    const error = ref(null)
    const authStore = useAuthStore()

    const initializePlayer = async () => {
        try {
            // Reset states
            isPlayerReady.value = false
            isAuthenticated.value = false
            error.value = null
            deviceId.value = null

            if (!window.Spotify) {
                await loadSpotifyScript()
            }

            // Ensure we have a valid token before creating the player
            if (!authStore.token) {
                throw new Error('No access token available')
            }

            // Verify token is valid before proceeding
            try {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    }
                })
                if (!response.ok) {
                    await authStore.refreshTokenIfNeeded(true)
                }
            } catch (err) {
                console.error('Error verifying token:', err)
                await authStore.refreshTokenIfNeeded(true)
            }

            player.value = new Spotify.Player({
                name: 'Spotify Clone Web Player',
                getOAuthToken: async cb => {
                    // Always provide a fresh token
                    await authStore.refreshTokenIfNeeded()
                    console.log('Providing token to player')
                    isAuthenticated.value = true
                    cb(authStore.token)
                },
            })

            // Set up event listeners
            player.value.addListener('ready', ({ device_id }) => {
                console.log('Player ready with device ID:', device_id)
                deviceId.value = device_id
                isPlayerReady.value = true
                isAuthenticated.value = true
                error.value = null
            })

            player.value.addListener('not_ready', ({ device_id }) => {
                console.log('Player not ready:', device_id)
                isPlayerReady.value = false
                deviceId.value = null
            })

            player.value.addListener('initialization_error', ({ message }) => {
                console.error('Player initialization error:', message)
                error.value = message
                isPlayerReady.value = false
                isAuthenticated.value = false
            })

            player.value.addListener('authentication_error', async ({ message }) => {
                console.error('Player authentication error:', message)
                error.value = message
                isAuthenticated.value = false
                isPlayerReady.value = false

                // Try to refresh the token and reconnect
                try {
                    await authStore.refreshTokenIfNeeded(true)
                    await reconnectPlayer()
                } catch (err) {
                    console.error('Failed to recover from authentication error:', err)
                }
            })

            player.value.addListener('account_error', ({ message }) => {
                console.error('Player account error:', message)
                error.value = message
                isPlayerReady.value = false
                isAuthenticated.value = false
            })

            // Connect to the player
            console.log('Connecting to Spotify player...')
            const connected = await player.value.connect()

            if (connected) {
                console.log('Successfully connected to Spotify player')
                isAuthenticated.value = true

                // Verify the connection by getting the state
                const state = await player.value.getCurrentState()
                console.log('Player state after connection:', state ? 'Active' : 'Inactive')

                // Additional check to ensure device is registered
                try {
                    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                        headers: {
                            'Authorization': `Bearer ${authStore.token}`
                        }
                    })
                    if (response.ok) {
                        const devices = await response.json()
                        console.log('Available devices:', devices)
                        const ourDevice = devices.devices.find(d => d.id === deviceId.value)
                        if (ourDevice) {
                            console.log('Device successfully registered')
                        } else {
                            console.warn('Device not found in list, may need to reconnect')
                        }
                    }
                } catch (err) {
                    console.error('Error checking device registration:', err)
                }
            } else {
                throw new Error('Failed to connect to Spotify player')
            }
        } catch (err) {
            console.error('Error initializing player:', err)
            error.value = err.message
            isPlayerReady.value = false
            isAuthenticated.value = false
            deviceId.value = null
        }
    }

    const reconnectPlayer = async () => {
        if (player.value) {
            try {
                await player.value.disconnect()
            } catch (err) {
                console.error('Error disconnecting player:', err)
            }
        }
        await initializePlayer()
    }

    const loadSpotifyScript = () => {
        return new Promise((resolve, reject) => {
            if (document.getElementById('spotify-player-script')) {
                resolve()
                return
            }

            const script = document.createElement('script')
            script.id = 'spotify-player-script'
            script.src = 'https://sdk.scdn.co/spotify-player.js'
            script.async = true

            script.onload = () => {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    resolve()
                }
            }

            script.onerror = (error) => reject(error)
            document.body.appendChild(script)
        })
    }

    const playTrack = async (uri) => {
        if (!isPlayerReady.value || !deviceId.value || !isAuthenticated.value) {
            console.warn('Player not ready or not authenticated', {
                isReady: isPlayerReady.value,
                hasDevice: !!deviceId.value,
                isAuthenticated: isAuthenticated.value
            })
            return
        }

        try {
            // Ensure token is fresh before playing
            await authStore.refreshTokenIfNeeded()

            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [uri]
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                if (response.status === 401) {
                    // Token expired during playback request
                    await authStore.refreshTokenIfNeeded(true)
                    return playTrack(uri) // Retry with new token
                }
                throw new Error(errorData.error?.message || 'Playback failed')
            }
        } catch (err) {
            console.error('Playback error:', err)
            error.value = err.message
            if (err.message.includes('authentication') || err.message.includes('token')) {
                isAuthenticated.value = false
            }
        }
    }

    const playPlaylist = async (playlistId, startIndex = 0) => {
        if (!isPlayerReady.value || !deviceId.value || !isAuthenticated.value) {
            console.warn('Player not ready or not authenticated', {
                isReady: isPlayerReady.value,
                hasDevice: !!deviceId.value,
                isAuthenticated: isAuthenticated.value
            })
            return
        }

        try {
            // Ensure token is fresh before playing
            await authStore.refreshTokenIfNeeded()

            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context_uri: `spotify:playlist:${playlistId}`,
                    offset: { position: startIndex }
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                if (response.status === 401) {
                    // Token expired during playback request
                    await authStore.refreshTokenIfNeeded(true)
                    return playPlaylist(playlistId, startIndex) // Retry with new token
                }
                throw new Error(errorData.error?.message || 'Playback failed')
            }
        } catch (err) {
            console.error('Playback error:', err)
            error.value = err.message
            if (err.message.includes('authentication') || err.message.includes('token')) {
                isAuthenticated.value = false
            }
        }
    }

    onMounted(async () => {
        if (authStore.isAuthenticated) {
            console.log('Initializing player on mount')
            await initializePlayer()
        }
    })

    // Watch for auth store changes
    watch(() => authStore.isAuthenticated, async (newValue) => {
        console.log('Auth state changed:', newValue)
        if (newValue) {
            await initializePlayer()
        } else {
            // Clean up if auth is lost
            if (player.value) {
                await player.value.disconnect()
            }
            isPlayerReady.value = false
            isAuthenticated.value = false
            deviceId.value = null
            error.value = null
        }
    })

    onUnmounted(() => {
        if (player.value) {
            player.value.disconnect()
        }
    })

    return {
        isPlayerReady,
        isAuthenticated,
        error,
        playTrack,
        playPlaylist,
        reconnectPlayer
    }
} 