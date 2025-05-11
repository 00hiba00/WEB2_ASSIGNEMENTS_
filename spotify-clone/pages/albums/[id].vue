<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-12">
        <img 
          :src="album?.images[0]?.url" 
          :alt="album?.name" 
          class="w-64 h-64 object-cover rounded-lg shadow-lg"
        />
        <div class="text-center md:text-left">
          <h1 class="text-4xl font-bold mb-2">{{ album?.name }}</h1>
          <p class="text-xl text-gray-400 mb-2">
            By {{ album?.artists?.map(artist => artist.name).join(', ') }}
          </p>
          <p class="text-gray-500">Released on {{ formatDate(album?.release_date) }}</p>
          <button
              @click="playAlbum"
              class="mt-4 bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded-full transition duration-300"
          >
            Play Album
          </button>
        </div>
      </div>

      <section>
        <h2 class="text-2xl font-bold mb-6">Tracks</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <TrackCard
            v-for="track in album?.tracks?.items"
            :key="track.id"
            :track="track"
            :imageUrl="album?.images[0]?.url"
            :albumId="album?.id"
            :albumName="album?.name"
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

const album = ref(null)

const fetchAlbum = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/albums/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    album.value = await response.json()
  } catch (error) {
    console.error('Error fetching album:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}


const playAlbum = () => {
  if (album.value && album.value.tracks && album.value.tracks.items.length > 0) {
    audioStore.setImage(album.value?.images[0]?.url)
    audioStore.playTrack(album.value.tracks.items[0], album.value.tracks.items)
  }
}

onMounted(() => {
  fetchAlbum()
})
</script>