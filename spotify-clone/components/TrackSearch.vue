<template>
  <div class="max-w-3xl mx-auto p-5 bg-gray-800 rounded-lg shadow-lg">
    <div class="relative mb-5">
      <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
        </svg>
      </div>
      <input 
        v-model="searchQuery" 
        @input="handleSearch"
        placeholder="Search for tracks to add..."
        type="text"
        class="w-full px-10 py-2 bg-gray-700 text-white rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
    <div v-if="searchResults.length" class="bg-gray-700 rounded-lg overflow-hidden">
      <div v-for="track in searchResults" 
           :key="track.id" 
           class="flex items-center justify-between p-4 hover:bg-gray-600 transition-colors duration-200"
           @mouseover="hoveredTrack = track.id"
           @mouseleave="hoveredTrack = null">
        <div class="flex items-center space-x-4 flex-1">
          <img :src="track.album.images[2]?.url" :alt="track.name" class="w-12 h-12 object-cover rounded shadow" />
          <div>
            <div class="text-white font-semibold">{{ track.name }}</div>
            <div class="text-gray-400 text-sm">{{ track.artists[0].name }} • {{ track.album.name }}</div>
          </div>
        </div>
        <button 
          @click="$emit('add-track', track)" 
          class="px-4 py-2 rounded-full bg-green-500 text-white font-semibold text-sm hover:bg-green-400 transition-colors duration-200"
          :class="{ 'transform scale-105': hoveredTrack === track.id }">
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const searchQuery = ref('');
const searchResults = ref([]);
const searchTimeout = ref(null);
const hoveredTrack = ref(null);

const handleSearch = async () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  
  searchTimeout.value = setTimeout(async () => {
    if (!searchQuery.value) {
      searchResults.value = [];
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery.value)}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      );
      const data = await response.json();
      searchResults.value = data.tracks.items;
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  }, 300);
};
</script>