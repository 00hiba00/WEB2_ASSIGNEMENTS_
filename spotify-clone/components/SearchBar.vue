<template>
  <div class="search-bar flex justify-center items-center flex-1 max-w-2xl mx-4">
    <div class="relative w-full max-w-4xl"> <!-- Increased width -->
      <input
        type="text"
        v-model="query"
        @input="onSearch"
        @keyup.enter="goToSearchPage"
        placeholder="Search for songs, artists, albums..."
        class="w-full px-6 py-2 bg-gray-700 text-white rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        @click="goToSearchPage"
      >
      <SearchIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'nuxt/app';
import { SearchIcon } from 'lucide-vue-next'

const query = ref('');
const router = useRouter();

/**
 * Navigate to the search results page when Enter is pressed or the button is clicked.
 */
const goToSearchPage = () => {
  if (query.value.length > 2) {
    router.push({ path: '/search', query: { q: query.value } });
  }
};
</script>
