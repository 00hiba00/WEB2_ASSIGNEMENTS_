<template>
  <div class="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4 z-50">
    <div v-if="currentTrack" class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Track Info -->
      <div class="flex items-center space-x-4 flex-1 min-w-0 cursor-pointer"
           @click="navigateToTrack">
        <img :src="currentImage || currentTrack?.album?.images?.[0]?.url || '/default-album.png'" 
             :alt="currentTrack?.name" 
             class="w-14 h-14 object-cover rounded-md shadow-lg" />
        <div class="truncate">
          <h3 class="text-white font-medium truncate">{{ currentTrack?.name }}</h3>
          <p class="text-gray-400 text-sm truncate">
            {{ artistNames }}
          </p>
        </div>
      </div>

      <!-- Player Controls -->
      <div class="flex flex-col items-center flex-1">
        <div class="flex items-center space-x-6">
          <button @click="seekBackward" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
          <button @click="togglePlay" 
                  class="bg-white rounded-full p-2 hover:scale-105 transition-transform">
            <svg v-if="!isPlaying" class="w-6 h-6" viewBox="0 0 24 24" fill="black">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="black">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          <button @click="seekForward" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
            </svg>
          </button>
        </div>
        
        <!-- Progress Bar -->
        <div class="w-full flex items-center space-x-3 mt-2">
          <span class="text-xs text-gray-400 w-10 text-right">{{ formatTime(currentTime) }}</span>
          <div class="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div class="relative w-full h-full group">
              <div class="absolute inset-0 cursor-pointer"
                   @click="handleProgressClick"
                   @mousemove="handleProgressHover">
                <div class="absolute top-0 bottom-0 left-0 bg-gray-400 group-hover:bg-green-500 transition-colors"
                     :style="{ width: `${progress}%` }">
                </div>
              </div>
            </div>
          </div>
          <span class="text-xs text-gray-400 w-10">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Volume Control -->
      <div class="flex items-center space-x-3 flex-1 justify-end">
        <button @click="toggleMute" class="text-gray-400 hover:text-white transition-colors">
          <svg v-if="volume > 0" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        </button>
        <input type="range" 
               v-model="volume" 
               min="0" 
               max="100" 
               class="w-24 accent-green-500" />
      </div>
    </div>
    <div v-else class="max-w-7xl mx-auto flex items-center justify-center text-gray-400 py-2">
      Select a track to play
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAudioStore } from '@/stores/audio'

const router = useRouter()
const audioStore = useAudioStore()

const currentTrack = computed(() => audioStore.currentTrack)
const currentImage = computed(() => audioStore.currentImage)
const isPlaying = computed(() => audioStore.isPlaying)
const currentTime = computed(() => audioStore.currentTime)
const duration = computed(() => audioStore.duration)
const volume = computed({
  get: () => audioStore.volume * 100,
  set: (value) => audioStore.setVolume(value / 100)
})

const artistNames = computed(() => {
  if (!currentTrack.value?.artists?.length) return ''
  return currentTrack.value.artists.map(artist => artist.name).join(', ')
})

const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (isPlaying.value) {
    audioStore.pauseTrack()
  } else {
    audioStore.resumeTrack()
  }
}

const seekForward = () => {
  audioStore.seek(currentTime.value + 10)
}

const seekBackward = () => {
  audioStore.seek(currentTime.value - 10)
}

const handleProgressClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  audioStore.seek(duration.value * percentage)
}

const handleProgressHover = (event) => {
  // Could add time preview tooltip here
}

const toggleMute = () => {
  if (volume.value > 0) {
    audioStore.setVolume(0)
  } else {
    audioStore.setVolume(1)
  }
}

const navigateToTrack = () => {
  if (currentTrack.value?.id) {
    router.push(`/tracks/${currentTrack.value.id}`)
  }
}
</script>

<style scoped>
input[type="range"] {
  height: 4px;
  border-radius: 2px;
  appearance: none;
  background-color: #4b5563;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  cursor: pointer;
}
</style> 