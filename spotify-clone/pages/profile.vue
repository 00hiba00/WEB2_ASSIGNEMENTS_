<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="text-xl text-gray-400">Loading profile...</div>
      </div>

      <template v-else>
        <div class="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-12">
          <img 
            :src="user?.images?.[0]?.url || '/default-avatar.png'" 
            :alt="user?.display_name" 
            class="w-32 h-32 rounded-full object-cover shadow-lg"
          />
          <div class="text-center md:text-left">
            <h1 class="text-4xl font-bold mb-2">{{ user?.display_name || 'Loading...' }}</h1>
            <p class="text-gray-400 mb-4">{{ user?.email }}</p>
            <button 
              @click="logout" 
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        <section class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Your Top Artists</h2>
          <div v-if="topArtists.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <div
              v-for="artist in topArtists"
              :key="artist.id"
              class="bg-gray-800 rounded-lg overflow-hidden transition duration-300 hover:bg-gray-700 cursor-pointer"
              @click="navigateToArtist(artist.id)"
            >
              <img 
                :src="artist.images?.[0]?.url || '/default-artist.png'" 
                :alt="artist.name" 
                class="w-full aspect-square object-cover"
              />
              <div class="p-4">
                <h3 class="font-semibold text-sm truncate">{{ artist.name }}</h3>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400">No top artists found</div>
        </section>

        <section>
          <h2 class="text-2xl font-bold mb-6">Your Top Tracks</h2>
          <div v-if="topTracks.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <TrackCard
              v-for="track in topTracks"
              :key="track.id"
              :track="track"
              :imageUrl="track.album?.images?.[0]?.url"
            />
          </div>
          <div v-else class="text-gray-400">No top tracks found</div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAudioStore } from '@/stores/audio'

const user = ref(null)
const topArtists = ref([])
const topTracks = ref([])
const loading = ref(true)
const authStore = useAuthStore()
const audioStore = useAudioStore()
const router = useRouter()

const fetchUserProfile = async () => {
  try {
    await authStore.refreshTokenIfNeeded();
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    user.value = await response.json()
  } catch (error) {
    console.error('Error fetching user profile:', error)
    if (error.message.includes('401')) {
      authStore.clearAuth()
      router.push('/login')
    }
  }
}

const fetchTopArtists = async () => {
  try {
    await authStore.refreshTokenIfNeeded();
    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }
    const data = await response.json()
    topArtists.value = data.items || []
  } catch (error) {
    console.error('Error fetching top artists:', error)
    topArtists.value = []
  }
}

const fetchTopTracks = async () => {
  try {
    await authStore.refreshTokenIfNeeded();
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }
    const data = await response.json()
    topTracks.value = data.items || []
  } catch (error) {
    console.error('Error fetching top tracks:', error)
    topTracks.value = []
  }
}

const logout = () => {
  authStore.clearAuth()
  audioStore.$reset()
  router.push('/')
}

const navigateToArtist = (artistId) => {
  router.push(`/artists/${artistId}`)
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await Promise.all([
      fetchUserProfile(),
      fetchTopArtists(),
      fetchTopTracks()
    ])
  } catch (error) {
    console.error('Error loading profile data:', error)
  } finally {
    loading.value = false
  }
})
</script>