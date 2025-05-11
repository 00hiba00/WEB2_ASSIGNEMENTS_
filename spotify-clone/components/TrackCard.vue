<template>
  <div 
    class="group relative bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
    @click="navigateToTrack"
    @mouseover="isHovered = true" 
    @mouseleave="isHovered = false"
  >
    <div class="relative aspect-square mb-2 overflow-hidden rounded-md">
      <img
        :src="track.album ? track.album.images[0].url : imageUrl"
        :alt="track.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <button 
        class="absolute bottom-1 right-1 bg-green-500 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        :class="{ 'opacity-100': isPlaying }"
        @click.stop="handlePlayClick"
        aria-label="Play or pause track"
      >
        <PlayIcon v-if="!isPlaying" class="w-4 h-4" />
        <PauseIcon v-else class="w-4 h-4" />
      </button>
    </div>
    <div class="text-white">
      <h3 class="font-bold text-sm mb-0.5 truncate">{{ track.name }}</h3>
      <p class="text-gray-400 text-xs truncate">
        <span v-for="(artist, index) in track.artists" :key="artist.id">
          <NuxtLink 
            :to="`/artists/${artist.id}`"
            class="hover:underline"
            @click.stop
          >
            {{ artist.name }}
          </NuxtLink>
          <span v-if="index < track.artists.length - 1">, </span>
        </span>
      </p>
    </div>
    <button 
      v-if="isHovered" 
      @click.stop="$emit('delete-track', track)" 
      class="absolute top-1 right-1 text-gray-400 hover:text-white transition-colors duration-300"
      aria-label="Remove from playlist"
    >
      <XIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PlayIcon, PauseIcon, XIcon } from 'lucide-vue-next'

const props = defineProps({
  track: {
    type: Object,
    required: true,
  },
  imageUrl: String,
  albumId: String,
  albumName: String,
})

const isHovered = ref(false)

const audioStore = useAudioStore()
const router = useRouter()

const isPlaying = computed(() => {
  return audioStore.isPlaying && audioStore.currentTrack?.id === props.track.id
})

const handlePlayClick = (event) => {
  event.stopPropagation()
  audioStore.setImage(props.track.album ? props.track.album.images[0].url : props.imageUrl)
  if (isPlaying.value) {
    audioStore.pauseTrack()
  } else {
    audioStore.playTrack(props.track)
  }
}

const navigateToTrack = () => {
  router.push(`/tracks/${props.track.id}`)
}
</script>

