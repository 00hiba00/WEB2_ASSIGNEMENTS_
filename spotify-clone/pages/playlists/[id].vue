<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row items-start md:items-center mb-8">
        <img 
          :src="playlist?.images?.[0]?.url || '/default_playlist_image.svg'" 
          :alt="playlist?.name || 'Playlist Cover'" 
          class="w-48 h-48 object-cover rounded-lg shadow-lg mb-4 md:mb-0 md:mr-8" 
        />
        <div class="flex-1">
          <div class="flex items-center mb-2">
            <h1 v-if="!isEditing" class="text-4xl font-bold">{{ playlist?.name }}</h1>
            <input
              v-else
              v-model="editedName"
              class="text-4xl font-bold bg-gray-800 text-white rounded px-2 py-1 w-full"
              @keyup.enter="savePlaylistName"
              @keyup.esc="cancelEdit"
            />
            <button @click="toggleEdit" class="ml-4 text-gray-400 hover:text-white">
              <span v-if="!isEditing">✏️</span>
              <span v-else>❌</span>
            </button>
          </div>
          <p class="text-gray-400 mb-2">{{ playlist?.description }}</p>
          <p class="text-gray-400 mb-4">By {{ playlist?.owner?.display_name }}</p>
          <div class="flex space-x-4">
            <button @click="handlePlayPause" class="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded-full transition duration-300">
              {{ isPlaying ? 'Pause' : 'Play' }}
            </button>
            <button @click="handleDelete" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300">
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Add Tracks</h2>
        <TrackSearch @add-track="addTrackToPlaylist" />
      </div>
      
      <div>
        <h2 class="text-2xl font-bold mb-4">Tracks</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <TrackCard
            v-for="track in playlist?.tracks?.items || []"
            :key="track.track.id"
            :track="track.track"
            @delete-track="deleteTrackFromPlaylist"
          />
        </div>
        <p v-if="!playlist?.tracks?.items?.length" class="text-gray-400 mt-4">No tracks available in this playlist.</p>
      </div>
    </div>
    <DeleteConfirmationModal 
      v-if="showDeleteModal"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      :title="'Delete Playlist'"
      :message="'Are you sure you want to delete this playlist? This action cannot be undone.'"
    />
    <NotificationModal
      v-if="showSuccessModal"
      @close="handleModalClose"
      title="Success!"
      message="Track has been added to your playlist"
    />
    <DeleteConfirmationModal 
      v-if="showTrackDeleteModal"
      @confirm="confirmTrackDelete"
      @cancel="showTrackDeleteModal = false"
      :title="'Delete Track'"
      :message="'Are you sure you want to remove this track from the playlist?'"
    />
  </div>
</template>

<script setup>
const route = useRoute()
const authStore = useAuthStore()
const audioStore = useAudioStore()
import NotificationModal from '~/components/NotificationModal.vue'

const playlist = ref(null)
const isPlaying = computed(() => 
  audioStore.isPlaying && audioStore.currentPlaylist?.id === playlist.value?.id
)

const showDeleteModal = ref(false)
const showSuccessModal = ref(false)
const showTrackDeleteModal = ref(false)
const showTrackDeleteSuccessModal = ref(false)
const trackToDelete = ref(null)

const isEditing = ref(false)
const editedName = ref('')

const fetchPlaylist = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    playlist.value = await response.json()
  } catch (error) {
    console.error('Error fetching playlist:', error)
  }
}

const handlePlayPause = () => {
  if (isPlaying.value) {
    audioStore.pauseTrack()
  } else {
    audioStore.playPlaylist(playlist.value)
  }
}

const handleDelete = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    await fetch(`https://api.spotify.com/v1/playlists/${route.params.id}/followers`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    showDeleteModal.value = false
    navigateTo('/playlists')
  } catch (error) {
    console.error('Error deleting playlist:', error)
  }
}

const addTrackToPlaylist = async (track) => {
  try {
    await fetch(`https://api.spotify.com/v1/playlists/${route.params.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [track.uri]
      })
    })
    showSuccessModal.value = true
  } catch (error) {
    console.error('Error adding track:', error)
  }
}

const deleteTrackFromPlaylist = (track) => {
  trackToDelete.value = track
  showTrackDeleteModal.value = true
}

const confirmTrackDelete = async () => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${route.params.id}/tracks`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [{ uri: `spotify:track:${trackToDelete.value.id}` }]
        })
      }
    )

    if (response.ok) {
      showTrackDeleteModal.value = false
      await fetchPlaylist()
      showTrackDeleteSuccessModal.value = true
    } else {
      throw new Error('Failed to remove track')
    }
  } catch (error) {
    console.error('Error removing track:', error)
  }
}

const handleModalClose = async () => {
  showSuccessModal.value = false
  await fetchPlaylist()
}

const handleTrackDeleteSuccess = () => {
  showTrackDeleteSuccessModal.value = false
}

const toggleEdit = () => {
  if (!isEditing.value) {
    editedName.value = playlist.value?.name
    isEditing.value = true
  } else {
    cancelEdit()
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editedName.value = ''
}

const savePlaylistName = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${route.params.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editedName.value
      })
    })
    
    if (response.ok) {
      await fetchPlaylist()
      isEditing.value = false
    } else {
      throw new Error('Failed to update playlist name')
    }
  } catch (error) {
    console.error('Error updating playlist name:', error)
  }
}

onMounted(() => {
  fetchPlaylist()
})

onUnmounted(() => {
  audioStore.$reset()
})

</script>