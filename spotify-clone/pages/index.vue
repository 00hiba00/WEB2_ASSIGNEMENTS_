<template>
  <div class="h-screen flex flex-col">
    <!-- Top Bar -->
    <header class="flex items-center justify-between px-6 py-4 bg-black text-white">
      <div class="flex items-center">
        <!-- Back Button - only show if not on home page -->
        <button v-if="!isHomePage" 
                @click="router.back()" 
                class="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 flex items-center justify-center transition-colors mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-32 mr-8" />
      </div>
      <div class="flex-1 max-w-2xl mx-8 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for music..."
          class="w-full px-4 py-2 rounded-full bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        />
        
        <!-- Loading Indicator -->
        <div v-if="isSearching" class="absolute right-3 top-2.5">
          <div class="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
        </div>
        
        <!-- Search Results Dropdown -->
        <div v-if="searchQuery && !isSearching && (filteredTracks.length || filteredArtists.length || filteredPlaylists.length)" 
             class="absolute mt-2 w-full bg-gray-900 rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <!-- Tracks Section -->
          <div v-if="filteredTracks.length" class="p-4">
            <h3 class="text-white text-lg font-semibold mb-3">Songs</h3>
            <div class="space-y-2">
              <div v-for="track in filteredTracks" 
                   :key="track.id"
                   @click="navigateToTrack(track)"
                   class="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer">
                <img :src="track.album?.images?.[0]?.url || '/default-album.png'" 
                     :alt="track.name"
                     class="w-10 h-10 object-cover rounded" />
                <div>
                  <p class="text-white">{{ track.name }}</p>
                  <p class="text-sm text-gray-400">{{ track.artists?.[0]?.name || 'Unknown Artist' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Artists Section -->
          <div v-if="filteredArtists.length" class="p-4 border-t border-gray-800">
            <h3 class="text-white text-lg font-semibold mb-3">Artists</h3>
            <div class="space-y-2">
              <div v-for="artist in filteredArtists" 
                   :key="artist.id"
                   @click="navigateToArtist(artist)"
                   class="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer">
                <img :src="artist.images?.[0]?.url || '/default-artist.png'"
                     :alt="artist.name"
                     class="w-10 h-10 object-cover rounded-full" />
                <p class="text-white">{{ artist.name }}</p>
              </div>
            </div>
          </div>

          <!-- Playlists Section -->
          <div v-if="filteredPlaylists.length" class="p-4 border-t border-gray-800">
            <h3 class="text-white text-lg font-semibold mb-3">Playlists</h3>
            <div class="space-y-2">
              <div v-for="playlist in filteredPlaylists" 
                   :key="playlist.id"
                   @click="navigateToPlaylist(playlist)"
                   class="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer">
                <img :src="playlist.images?.[0]?.url || '/default-playlist.png'"
                     :alt="playlist.name"
                     class="w-10 h-10 object-cover rounded" />
                <div>
                  <p class="text-white">{{ playlist.name }}</p>
                  <p class="text-sm text-gray-400">By {{ playlist.owner?.display_name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <NuxtLink to="/profile" class="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-400 transition-colors">
          View Profile
        </NuxtLink>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar with custom scrollbar -->
      <aside class="w-1/4 bg-black text-white p-4 space-y-6 overflow-y-auto custom-scrollbar">
        <nav class="space-y-4">
          <NuxtLink to="/" class="block w-full text-left px-4 py-2 hover:bg-gray-800 rounded">Home</NuxtLink>
          <NuxtLink to="/library" class="block w-full text-left px-4 py-2 hover:bg-gray-800 rounded">Your Library</NuxtLink>
          <button @click="showCreateModal = true" class="block w-full text-left px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors">
            + Add Playlist
          </button>
        </nav>

        <!-- Playlist Titles in Sidebar -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-3 text-white">Your Playlists</h3>
          <div class="space-y-2">
            <NuxtLink 
              v-for="playlist in userPlaylists" 
              :key="playlist.id"
              :to="`/playlists/${playlist.id}`"
              class="flex items-center space-x-3 px-2 py-2 hover:bg-gray-800 rounded group"
            >
              <img
                :src="playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '/default-playlist.png'"
                class="w-10 h-10 object-cover rounded"
                :alt="playlist.name"
              />
              <p class="text-sm text-gray-400 group-hover:text-white truncate">{{ playlist.name }}</p>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="w-3/4 overflow-y-auto p-6 space-y-8 bg-black custom-scrollbar">
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">Your Playlists</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <NuxtLink
              v-for="playlist in recentPlaylists"
              :key="playlist.id"
              :to="`/playlists/${playlist.id}`"
              class="bg-gray-900/40 rounded-lg overflow-hidden hover:bg-gray-800/60 transition-all duration-300 group"
            >
              <div class="relative">
                <img 
                  :src="playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '/default-playlist.png'"
                  :alt="playlist.name"
                  class="w-full aspect-square object-cover"
                />
                <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-white truncate group-hover:text-green-500 transition-colors">{{ playlist.name }}</h3>
                <p class="text-sm text-gray-400 mt-1">{{ playlist.tracks?.total || 0 }} tracks</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">Recent Albums</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <div
              v-for="track in recentTracks"
              :key="track.id"
              @click="navigateToTrack(track)"
              class="bg-gray-900/40 rounded-lg overflow-hidden hover:bg-gray-800/60 transition-all duration-300 group cursor-pointer"
            >
              <div class="relative">
                <img 
                  :src="track.album?.images?.[0]?.url || '/default-album.png'"
                  :alt="track.name"
                  class="w-full aspect-square object-cover"
                />
                <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-white truncate group-hover:text-green-500 transition-colors">{{ track.name }}</h3>
                <p class="text-sm text-gray-400 mt-1 truncate">{{ track.artists?.[0]?.name }}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">New Releases</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <NuxtLink 
              v-for="album in newReleases" 
              :key="album.id"
              :to="`/albums/${album.id}`"
              class="bg-gray-900/40 rounded-lg overflow-hidden hover:bg-gray-800/60 transition-all duration-300 group"
            >
              <div class="relative">
                <img 
                  :src="album.images?.[0]?.url || '/default-album.png'"
                  :alt="album.name"
                  class="w-full aspect-square object-cover"
                />
                <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-white truncate group-hover:text-green-500 transition-colors">{{ album.name }}</h3>
                <p class="text-sm text-gray-400 mt-1 truncate">{{ album.artists?.[0]?.name }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4 text-white">Create New Playlist</h2>
        <input
          v-model="newPlaylist.name"
          placeholder="Playlist name"
          type="text"
          class="w-full px-3 py-2 bg-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <textarea
          v-model="newPlaylist.description"
          placeholder="Playlist description (optional)"
          class="w-full px-3 py-2 bg-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-24"
        ></textarea>
        <div class="flex justify-end space-x-4">
          <button @click="showCreateModal = false" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors">
            Cancel
          </button>
          <button @click="createPlaylist" class="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Check if we're on the home page
const isHomePage = computed(() => route.path === '/' || route.path === '/index');

const userPlaylists = ref([]);
const recentTracks = ref([]);
const newReleases = ref([]);
const showCreateModal = ref(false);
const searchQuery = ref('');
const searchResults = ref({
  tracks: [],
  artists: [],
  playlists: []
});
const isSearching = ref(false);

// Computed properties for filtered results
const filteredTracks = computed(() => searchResults.value.tracks?.filter(track => track && track.id) || []);
const filteredArtists = computed(() => searchResults.value.artists?.filter(artist => artist && artist.id) || []);
const filteredPlaylists = computed(() => searchResults.value.playlists?.filter(playlist => playlist && playlist.id) || []);

// Compute recent playlists (last 8)
const recentPlaylists = computed(() => {
  return userPlaylists.value.slice(0, 8);
});

// Navigation handlers
const navigateToTrack = (track) => {
  if (track?.album?.id) {
    router.push(`/albums/${track.album.id}`);
  }
  searchQuery.value = '';
};

const navigateToArtist = (artist) => {
  if (artist?.id) {
    router.push(`/artists/${artist.id}`);
  }
  searchQuery.value = '';
};

const navigateToPlaylist = (playlist) => {
  if (playlist?.id) {
    router.push(`/playlists/${playlist.id}`);
  }
  searchQuery.value = '';
};

// Debounce function
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Search function
const performSearch = async (query) => {
  if (!query.trim()) {
    searchResults.value = { tracks: [], artists: [], playlists: [] };
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,playlist&limit=8`,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    searchResults.value = {
      tracks: data.tracks?.items || [],
      artists: data.artists?.items || [],
      playlists: data.playlists?.items || []
    };
  } catch (error) {
    console.error('Error performing search:', error);
    searchResults.value = { tracks: [], artists: [], playlists: [] };
  } finally {
    isSearching.value = false;
  }
};

// Debounced search
const debouncedSearch = debounce(performSearch, 300);

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

const newPlaylist = ref({
  name: '',
  description: ''
});

const fetchUserPlaylists = async () => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    if (Array.isArray(data.items)) {
      userPlaylists.value = data.items;
    }
  } catch (error) {
    console.error('Error fetching user playlists:', error);
  }
};

const fetchRecentTracks = async () => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=12', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    recentTracks.value = data.items || [];
  } catch (error) {
    console.error('Error fetching recent tracks:', error);
  }
};

const fetchNewReleases = async () => {
  try {
    const response = await fetch('https://api.spotify.com/v1/browse/new-releases?country=US&limit=12', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    if (data.albums?.items) {
      newReleases.value = data.albums.items;
    }
  } catch (error) {
    console.error('Error fetching new releases:', error);
  }
};

const createPlaylist = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/users/${authStore.user.id}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newPlaylist.value.name,
        description: newPlaylist.value.description,
        public: true
      })
    });

    const data = await response.json();
    if (response.ok) {
      await fetchUserPlaylists();
      showCreateModal.value = false;
      newPlaylist.value = { name: '', description: '' };
    }
  } catch (error) {
    console.error('Error creating playlist:', error);
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    await Promise.all([
      fetchUserPlaylists(),
      fetchRecentTracks(),
      fetchNewReleases()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }
});
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #1DB954 #000000;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #000000;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #1DB954;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #1ed760;
}
</style>

