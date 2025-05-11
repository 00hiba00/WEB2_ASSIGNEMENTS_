<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col items-center mb-12">
        <div class="w-64 h-64 mb-6">
          <TrackCard :track="track" v-if="track" />
        </div>
      </div>
      
      <section v-if="track" class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Track Details</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2 text-gray-400">Duration</h3>
            <p class="text-xl">{{ formatDuration(track.duration_ms) }}</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2 text-gray-400">Album</h3>
            <p class="text-xl">{{ track.album.name }}</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2 text-gray-400">Release Date</h3>
            <p class="text-xl">{{ formatDate(track.album.release_date) }}</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2 text-gray-400">Popularity</h3>
            <p class="text-xl">{{ track.popularity }}/100</p>
          </div>
        </div>
      </section>

      <section v-if="albumTracks.length" class="mb-12">
        <h2 class="text-2xl font-bold mb-6">More from {{ track?.album.name }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <TrackCard
            v-for="albumTrack in albumTracks"
            :key="albumTrack.id"
            :track="albumTrack"
            :imageUrl="track.album.images[0]?.url"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAudioStore } from '@/stores/audio'

const route = useRoute()
const authStore = useAuthStore()
const audioStore = useAudioStore()

const track = ref(null)
const albumTracks = ref([])

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const fetchTrack = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    track.value = await response.json()

    if (track.value?.album?.id) {
      const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${track.value.album.id}/tracks`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      const data = await albumResponse.json()
      albumTracks.value = data.items
        .filter(t => t.id !== track.value.id)
        .slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching track:', error)
  }
}

onMounted(() => {
  fetchTrack()
})
</script>