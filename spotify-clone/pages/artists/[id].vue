<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-12">
        <img 
          :src="artist?.images[0]?.url" 
          :alt="artist?.name" 
          class="w-64 h-64 object-cover rounded-full shadow-lg"
        />
        <div class="text-center md:text-left">
          <h1 class="text-5xl font-bold mb-2">{{ artist?.name }}</h1>
          <p class="text-xl text-gray-400">{{ formatFollowers(artist?.followers?.total) }}</p>
        </div>
      </div>

      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Top Tracks</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <TrackCard
            v-for="track in topTracks"
            :key="track.id"
            :track="track"
            :imageUrl="track.album.images[0]?.url"
          />
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-6">Albums</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <NuxtLink
            v-for="album in albums"
            :key="album.id"
            :to="`/albums/${album.id}`"
            class="bg-gray-800 rounded-lg overflow-hidden transition duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <img 
              :src="album.images[0]?.url" 
              :alt="album.name" 
              class="w-full aspect-square object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-sm mb-1 truncate">{{ album.name }}</h3>
              <p class="text-gray-400 text-xs">{{ formatDate(album.release_date) }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const artist = ref(null)
const topTracks = ref([])
const albums = ref([])

const fetchArtistData = async () => {
  try {
    const [artistResponse, topTracksResponse, albumsResponse] = await Promise.all([
      fetch(`https://api.spotify.com/v1/artists/${route.params.id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }),
      fetch(`https://api.spotify.com/v1/artists/${route.params.id}/top-tracks?market=US`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }),
      fetch(`https://api.spotify.com/v1/artists/${route.params.id}/albums`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
    ])

    const [artistData, topTracksData, albumsData] = await Promise.all([
      artistResponse.json(),
      topTracksResponse.json(),
      albumsResponse.json()
    ])

    artist.value = artistData
    topTracks.value = topTracksData.tracks
    albums.value = albumsData.items
  } catch (error) {
    console.error('Error fetching artist data:', error)
  }
}

const formatFollowers = (followers) => {
  if (!followers) return '0 followers'
  if (followers >= 1000000) {
    return `${(followers / 1000000).toFixed(1)}M followers`
  } else if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}K followers`
  } else {
    return `${followers} followers`
  }
}

const formatDate = (date) => {
  return new Date(date).getFullYear()
}

onMounted(() => {
  fetchArtistData()
})
</script>