<template>
  <div class="h-screen flex flex-col">
    <!-- Top Bar -->
    <header class="flex justify-center items-center px-6 py-4 bg-black text-white">
      <div class="w-1/2 relative">
        <input
          type="text"
          placeholder="Search for music..."
          class="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div class="absolute right-6">
        <NuxtLink to="/profile" class="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-400 transition-colors">
          View Profile
        </NuxtLink>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar with custom scrollbar -->
      <aside class="w-1/4 bg-black text-white p-4 space-y-6 overflow-y-auto custom-scrollbar">
        <div class="text-2xl font-bold mb-6">
          <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-32" />
        </div>

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
          <h2 class="text-2xl font-bold text-white mb-4">Recent Playlists</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <NuxtLink
              v-for="playlist in recentPlaylists"
              :key="playlist.id"
              :to="`/playlists/${playlist.id}`"
              class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
            >
              <img 
                :src="playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '/default-playlist.png'"
                :alt="playlist.name"
                class="w-full aspect-square object-cover"
              />
              <div class="p-4">
                <h3 class="font-semibold text-white truncate">{{ playlist.name }}</h3>
                <p class="text-sm text-gray-400 mt-1">{{ playlist.tracks?.total || 0 }} tracks</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">Recent Tracks</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <TrackCard
              v-for="track in recentTracks"
              :key="track.id"
              :track="track"
            />
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-white mb-4">New Releases</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <NuxtLink 
              v-for="album in newReleases" 
              :key="album.id"
              :to="`/albums/${album.id}`"
              class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
            >
              <img 
                :src="album.images?.[0]?.url || '/default-album.png'"
                :alt="album.name"
                class="w-full aspect-square object-cover"
              />
              <div class="p-4">
                <h3 class="font-semibold text-white truncate">{{ album.name }}</h3>
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

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userPlaylists = ref([]);
const recentTracks = ref([]);
const newReleases = ref([]);
const showCreateModal = ref(false);
const newPlaylist = ref({
  name: '',
  description: ''
});

// Compute recent playlists (last 8)
const recentPlaylists = computed(() => {
  return userPlaylists.value.slice(0, 8);
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

