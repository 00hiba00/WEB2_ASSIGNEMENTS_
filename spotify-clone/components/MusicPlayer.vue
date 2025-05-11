<template>
  <div class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 shadow-lg z-50">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4 w-1/3">
        <img
          v-if="audioStore.currentTrack"
          :src="audioStore.image"
          :alt="audioStore.currentTrack.name"
          class="w-14 h-14 rounded-md object-cover"
        />
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium truncate">{{ audioStore.currentTrack?.name }}</h3>
          <p class="text-xs text-gray-400 truncate">{{ artistNames }}</p>
        </div>
      </div>
      
      <div class="flex-1 max-w-lg">
        <div class="flex items-center justify-center space-x-6">
          <button 
            @click="audioStore.playPreviousTrack"
            class="text-gray-400 hover:text-white transition-colors"
            :disabled="!audioStore.currentPlaylist"
          >
            <SkipBackIcon class="w-5 h-5" />
          </button>

          <button 
            @click="audioStore.togglePlay"
            class="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
          >
            <PlayIcon v-if="!audioStore.isPlaying" class="w-8 h-8" />
            <PauseIcon v-else class="w-8 h-8" />
          </button>

          <button 
            @click="audioStore.playNextTrack"
            class="text-gray-400 hover:text-white transition-colors"
            :disabled="!audioStore.currentPlaylist"
          >
            <SkipForwardIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="mt-2">
          <div 
            class="relative h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer" 
            @click="handleProgressClick"
            ref="progressBar"
          >
            <div 
              class="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300 ease-in-out"
              :style="{ width: `${audioStore.progress}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-4 w-1/3 justify-end">
        <VolumeIcon class="w-4 h-4 text-gray-400" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          v-model="volume"
          @input="audioStore.setVolume(parseFloat($event.target.value))"
          class="w-24 accent-green-500"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PlayIcon, PauseIcon, VolumeIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-vue-next'

const audioStore = useAudioStore()
const progressBar = ref(null)

const volume = ref(audioStore.volume)

const artistNames = computed(() => {
  if (!audioStore.currentTrack) return ''
  return audioStore.currentTrack.artists.map(artist => artist.name).join(', ')
})

const handleProgressClick = (event) => {
  if (!progressBar.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const clickPosition = event.clientX - rect.left
  const progressBarWidth = rect.width
  const percentage = (clickPosition / progressBarWidth) * 100
  
  if (audioStore.audio) {
    const newTime = (percentage / 100) * audioStore.audio.duration
    audioStore.audio.currentTime = newTime
  }
}
</script>

