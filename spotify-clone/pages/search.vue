<template>
  <div class="search-page flex flex-col items-center p-4">
    <h1 class="text-2xl font-semibold mb-6">Search Results for "{{ route.query.q }}"</h1>

    <!-- Artists Section -->
    <div v-if="artists.length" class="w-full">
      <h2 class="text-xl font-semibold mb-4">Artists</h2>
      <div class="search-results grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        <div 
          v-for="artist in artists" 
          :key="artist.id"
          class="w-full"
        >
          <ArtistCard :artist="artist" />
        </div>
      </div>
    </div>

    <!-- Playlists Section -->
    <div v-if="playlists.length" class="w-full mt-8">
      <h2 class="text-xl font-semibold mb-4">Playlists</h2>
      <div class="search-results grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="w-full"
        >
          <PlaylistCard :playlist="playlist" />
        </div>
      </div>
    </div>

    <!-- Tracks Section -->
    <div v-if="tracks.length" class="w-full mt-8">
      <h2 class="text-xl font-semibold mb-4">Tracks</h2>
      <div class="search-results grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        <div 
          v-for="track in tracks" 
          :key="track.id"
          class="w-full"
        >
          <TrackCard 
            :track="track"
            :imageUrl="track.image"
            :albumId="track.albumId"
            :albumName="track.albumName"
          />
        </div>
      </div>
    </div>

    <p v-else-if="!results.length" class="text-gray-500 mt-8">No results found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';



const route = useRoute();
const authStore = useAuthStore();

const results = ref([]);
const artists = ref([]);
const playlists = ref([]);
const tracks = ref([]);

// Fetch search results from Spotify API
const fetchResults = async () => {
  const query = route.query.q;

  if (!query || query.length < 3) {
    results.value = [];
    return;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,album,playlist,track`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json();

    // Categorize results into different sections
    artists.value = (data.artists?.items || []).map((item) => ({
      ...item,
      type: 'Artist',
      image: item.images?.[0]?.url || 'default_artist_image.jpg',
    }));
    playlists.value = (data.playlists?.items || []).map((item) => ({
      ...item,
      type: 'Playlist',
      image: item.images?.[0]?.url || 'default_playlist_image.svg',
    }));
    tracks.value = (data.tracks?.items || []).map((item) => ({
      ...item,
      type: 'Track',
      image: item.album?.images?.[0]?.url || 'default_track_image.png',
      albumId: item.album?.id,
      albumName: item.album?.name,
    }));

    // Combine all results
    results.value = [
      ...artists.value,
      ...playlists.value,
      ...tracks.value,
    ];
  } catch (error) {
    console.error('Error fetching search results:', error.message);
  }
};

// Fetch results when the page is mounted or the query changes
onMounted(fetchResults);
watch(() => route.query.q, fetchResults);
</script>
