<template>
    <div 
      class="group bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
      @click="handleClick"
      role="button"
      tabindex="0"
    >
      <div class="relative aspect-square mb-2 overflow-hidden rounded-full">
        <img
          :src="artistImage"
          :alt="artist?.name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="handleImageError"
        />
      </div>
      <div class="text-white text-center">
        <h3 class="font-bold text-sm mb-0.5 truncate">{{ truncateText(artist.name, 20) }}</h3>
        <p class="text-gray-400 text-xs">
          {{ `${artist.followers?.total || 0} Followers` }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    artist: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.name && typeof value.name === 'string'
      }
    }
  })
  
  const router = useRouter()
  
  // Fallback image for the artist
  const artistImage = computed(() => {
    return props.artist.images?.[0]?.url || '/default_artist_image.jpg'
  })
  
  // Truncate text for consistent card sizes
  const truncateText = (text, maxLength) => {
    if (!text) return ''
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text
  }
  
  // Navigate to the artist's page on click
  const handleClick = () => {
    router.push(`/artists/${props.artist.id}`)
  }
  
  // Handle image loading error
  const handleImageError = (event) => {
    event.target.src = '/default_artist_image.jpg'
  }
  </script>
  