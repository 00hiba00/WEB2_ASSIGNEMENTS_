<template>
  <div 
    class="group bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
    @click="handleClick"
    role="button"
    tabindex="0"
  >
    <div class="relative aspect-square mb-2 overflow-hidden rounded-md">
      <img
        :src="playlistImage"
        :alt="`Cover art for playlist: ${playlist.name}`"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="handleImageError"
      />
      <button 
        class="absolute bottom-1 right-1 bg-green-500 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        @click.stop="handlePlayPause"
        aria-label="Play or pause playlist"
      >
        <PlayIcon v-if="!isPlaying" class="w-4 h-4" />
        <PauseIcon v-else class="w-4 h-4" />
      </button>
    </div>
    <div class="text-white">
      <h3 class="font-bold text-sm mb-0.5 truncate">{{ truncateText(playlist.name, 20) }}</h3>
      <p v-if="playlist.description" class="text-gray-400 text-xs truncate">
        {{ truncateText(playlist.description, 30) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PlayIcon, PauseIcon } from 'lucide-vue-next'

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.name && typeof value.name === 'string'
    }
  },
})

const router = useRouter()
const audioStore = useAudioStore()

const playlistImage = computed(() => {
  return props.playlist.images?.[0]?.url || 'default_playlist_image.svg'
})

const isPlaying = computed(() => {
  return audioStore.isPlaying && audioStore.currentPlaylist?.id === props.playlist.id
})

const handleImageError = (event) => {
  event.target.src = 'default_playlist_image.svg'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text
}

const handleClick = () => {
  router.push(`/playlists/${props.playlist.id}`)
}

const handlePlayPause = () => {
  if (isPlaying.value) {
    audioStore.pauseTrack()
  } else {
    audioStore.playPlaylist(props.playlist)
  }
}
</script>

