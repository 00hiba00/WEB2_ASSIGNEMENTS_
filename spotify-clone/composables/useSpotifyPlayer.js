import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useSpotifyPlayer() {
    const player = ref(null)
    const deviceId = ref(null)
    const isPlayerReady = ref(false)
    const error = ref(null)
    const authStore = useAuthStore()

    const initializePlayer = async () => {
        if (!window.Spotify) {
            await loadSpotifyScript()
        }

        player.value = new Spotify.Player({
            name: 'Spotify Clone Web Player',
            getOAuthToken: cb => cb(authStore.token),
        })

        player.value.addListener('ready', ({ device_id }) => {
            console.log('Player ready with device ID:', device_id)
            deviceId.value = device_id
            isPlayerReady.value = true
            error.value = null
        })

        player.value.addListener('not_ready', () => {
            console.log('Player not ready')
            isPlayerReady.value = false
        })

        player.value.addListener('initialization_error', ({ message }) => {
            console.error('Player initialization error:', message)
            error.value = message
        })

        player.value.addListener('authentication_error', ({ message }) => {
            console.error('Player authentication error:', message)
            error.value = message
        })

        player.value.addListener('account_error', ({ message }) => {
            console.error('Player account error:', message)
            error.value = message
        })

        player.value.connect()
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
        if (!isPlayerReady.value || !deviceId.value) {
            console.warn('Player not ready')
            return
        }

        try {
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
                throw new Error(errorData.error?.message || 'Playback failed')
            }
        } catch (err) {
            console.error('Playback error:', err)
            error.value = err.message
        }
    }

    const playPlaylist = async (playlistId, startIndex = 0) => {
        if (!isPlayerReady.value || !deviceId.value) {
            console.warn('Player not ready')
            return
        }

        try {
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
                throw new Error(errorData.error?.message || 'Playback failed')
            }
        } catch (err) {
            console.error('Playback error:', err)
            error.value = err.message
        }
    }

    onMounted(() => {
        if (authStore.isAuthenticated) {
            initializePlayer()
        }
    })

    onUnmounted(() => {
        if (player.value) {
            player.value.disconnect()
        }
    })

    return {
        isPlayerReady,
        error,
        playTrack,
        playPlaylist
    }
} 