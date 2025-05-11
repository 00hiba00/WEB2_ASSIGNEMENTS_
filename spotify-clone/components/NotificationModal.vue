<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out">
      <div class="flex items-center justify-center mb-4">
        <div class="bg-green-500 rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 class="text-xl font-bold mb-4 text-center">{{ title }}</h2>
      <p class="text-gray-300 mb-6 text-center">{{ message }}</p>
      <div class="flex justify-center">
        <button
          @click="$emit('close')"
          class="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition duration-300"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script> 