<template>
  <div class="h-screen flex flex-col">
    <!-- Top Bar -->
    <header class="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">
      <input
        type="text"
        placeholder="Search for music..."
        class="w-1/2 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button class="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-400 transition-colors">
        View Profile
      </button>
    </header>

    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-1/4 bg-black text-white p-4 space-y-6 overflow-y-auto">
        <div class="text-2xl font-bold mb-6">
          <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-32" />
        </div>

        <nav class="space-y-4">
          <button class="block w-full text-left px-4 py-2 hover:bg-gray-800 rounded">Home</button>
          <button class="block w-full text-left px-4 py-2 hover:bg-gray-800 rounded">Your Library</button>
          <button @click="showCreateModal = true" class="block w-full text-left px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors">
            + Add Playlist
          </button>
        </nav>

        <div class="grid grid-cols-2 gap-2 pt-4">
          <img
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            :src="playlist.images[0]?.url"
            class="w-full h-auto rounded"
            alt="Playlist"
          />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="w-3/4 overflow-y-auto p-6 space-y-8">
        <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Your Playlists</h2>
        <button @click="showCreateModal = true" class="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-400 transition-colors">
          Create Playlist
        </button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <NuxtLink
          v-for="playlist in userPlaylists"
          :key="playlist.id"
          :to="`/playlists/${playlist.id}`"
        >
          <PlaylistCard :playlist="playlist" />
        </NuxtLink>
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4">Recommended Playlists</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <NuxtLink
          v-for="playlist in recommendedPlaylists"
          :key="playlist.id"
          :to="`/playlists/${playlist.id}`"
        >
          <PlaylistCard :playlist="playlist" />
        </NuxtLink>
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4">Recommended Tracks</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <TrackCard
          v-for="track in recommendedTracks"
          :key="track.id"
          :track="track"
        />
      </div>
    </section>
      </main>
    </div>

    <!-- Modal (unchanged) -->
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
const recommendedPlaylists = ref([]);
const recommendedTracks = ref([]);
const authStore = useAuthStore()

const showCreateModal = ref(false);
const newPlaylist = ref({
  name: '',
  description: ''
});
const userPlaylists = ref([]);

const fetchRecommendedPlaylists = async () => {
  const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists', {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  });
  const data = await response.json();
  
  recommendedPlaylists.value = data.playlists.items;
};

const fetchRecommendedTracks = async () => {
  const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  });
  const data = await response.json();
  recommendedTracks.value = data.items;
};

const fetchUserPlaylists = async () => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    userPlaylists.value = data.items;
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

    if (response.ok) {
      await Promise.all([
        fetchRecommendedPlaylists(),
        fetchUserPlaylists()
      ]);
      showCreateModal.value = false;
      newPlaylist.value = { name: '', description: '' };
    } else {
      console.error('Failed to create playlist:', data);
    }
  } catch (error) {
    console.error('Error creating playlist:', error);
  }
};

onMounted(() => {
  Promise.all([
    fetchRecommendedPlaylists(),
    fetchRecommendedTracks(),
    fetchUserPlaylists()
  ]);
});
</script>

