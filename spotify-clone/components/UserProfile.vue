<template>
  <div class="bg-gray-900 rounded-lg p-6 shadow-lg text-center">
    <img
      :src="user.images[0]?.url || '/default_artist_image.jpg'"
      :alt="user.display_name"
      class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-green-500"
    />
    <div class="mb-6">
      <h3 class="text-xl font-bold text-white mb-1">{{ user.display_name }}</h3>
      <p class="text-gray-400">{{ user.email }}</p>
    </div>
    <button 
      @click="logout"
      class="bg-green-500 text-black font-bold py-2 px-6 rounded-full hover:bg-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      Logout
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['logout'])

const logout = () => {
  emit('logout')
}
</script>