import { useAuthStore } from '@/stores/auth'

export const useSpotifyApi = () => {
    const authStore = useAuthStore()

    const fetchWithToken = async (url, options = {}) => {
        // Try to refresh token before making the request
        const refreshResult = await authStore.refreshTokenIfNeeded()
        if (!refreshResult) {
            throw new Error('Failed to refresh token')
        }

        // Prepare headers with the current token
        const headers = {
            'Authorization': `Bearer ${authStore.token}`,
            ...options.headers
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            })

            // If we get a 401, token might have expired during the request
            if (response.status === 401) {
                // Force token refresh
                const forceRefreshResult = await authStore.refreshTokenIfNeeded(true)
                if (!forceRefreshResult) {
                    throw new Error('Failed to refresh token after 401')
                }

                // Retry the request with the new token
                headers.Authorization = `Bearer ${authStore.token}`
                const retryResponse = await fetch(url, {
                    ...options,
                    headers
                })

                if (!retryResponse.ok) {
                    throw new Error(`API request failed: ${retryResponse.status}`)
                }

                return retryResponse
            }

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`)
            }

            return response
        } catch (error) {
            console.error('Spotify API request failed:', error)
            throw error
        }
    }

    return {
        fetchWithToken
    }
} 