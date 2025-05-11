<template>
  <div class="min-h-screen bg-black">
    <NuxtPage />
    <MusicPlayerBar />
    <AudioError />
    <SpotifyPlayer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAudioStore } from '@/stores/audio'

const audioStore = useAudioStore()
</script>

<style>
html, body {
  background: black;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
