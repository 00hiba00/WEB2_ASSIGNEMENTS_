<template>
  <div class="flex flex-col items-center justify-center" :style="{ marginTop: '25vh' }">
    <button
      @click="handleLogin"
      class="px-8 py-4 bg-green-500 text-white rounded-full text-xl font-semibold hover:bg-green-400 transition-colors"
    >
      Connect with Spotify
    </button>
  </div>
</template>

<script setup>
const auth = useAuth()

const handleLogin = () => {
  auth.login()
}
</script>
