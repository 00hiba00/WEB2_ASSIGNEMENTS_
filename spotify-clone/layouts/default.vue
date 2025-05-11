<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <header class="bg-gray-800 shadow-md">
      <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
        <!-- Left: Home Link -->
        <NuxtLink to="/" class="text-xl font-bold text-green-500 hover:text-green-400 transition-colors">
          Musicify
        </NuxtLink>

        <!-- Center: Search Bar -->
        <SearchBar />

        <!-- Right: Profile -->
        <NuxtLink to="/profile" class="text-gray-300 hover:text-white transition-colors">
          <UserIcon class="w-6 h-6" />
        </NuxtLink>
      </nav>
    </header>

    <!-- Page Content -->
    <main class="container mx-auto px-4 py-8 pb-24">
      <NuxtPage />
    </main>

    <MusicPlayer />
  </div>
</template>

<script setup>
import { UserIcon } from 'lucide-vue-next'
</script>

<style>
body {
  @apply bg-gray-900 text-white;
}
</style>

