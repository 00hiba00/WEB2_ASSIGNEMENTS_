<template>
  <div class="min-h-screen bg-black text-white p-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Your Library</h1>
      <button @click="showCreateModal = true" class="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-400 transition-colors">
        Create Playlist
      </button>
    </div>
    
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Your Playlists</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div v-for="playlist in userPlaylists" :key="playlist.id" 
          class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
          @click="navigateToPlaylist(playlist.id)">
          <img 
            :src="playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '/default-playlist.png'"
            :alt="playlist.name"
            class="w-full aspect-square object-cover"
          />
          <div class="p-4">
            <h3 class="font-semibold text-white truncate">{{ playlist.name }}</h3>
            <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ playlist.description || 'No description' }}</p>
            <p class="text-sm text-gray-400 mt-2">{{ playlist.tracks?.total || 0 }} tracks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Playlist Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Create New Playlist</h2>
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
const authStore = useAuthStore();
const router = useRouter();
const userPlaylists = ref([]);
const showCreateModal = ref(false);
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
    console.log('Library page - User playlists response:', data);
    if (Array.isArray(data.items)) {
      userPlaylists.value = data.items;
    } else {
      console.error('Unexpected user playlists response structure:', data);
    }
  } catch (error) {
    console.error('Error fetching user playlists:', error);
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
    console.log('Create playlist response:', data);

    if (response.ok) {
      await fetchUserPlaylists();
      showCreateModal.value = false;
      newPlaylist.value = { name: '', description: '' };
    } else {
      console.error('Failed to create playlist:', data);
    }
  } catch (error) {
    console.error('Error creating playlist:', error);
  }
};

const navigateToPlaylist = (playlistId) => {
  router.push(`/playlists/${playlistId}`);
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  fetchUserPlaylists();
});
</script> 