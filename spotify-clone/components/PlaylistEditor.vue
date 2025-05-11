<template>
  <div class="playlist-editor">
    <h2>{{ isEditing ? 'Edit Playlist' : 'Create Playlist' }}</h2>
    <input
      type="text"
      v-model="playlistName"
      placeholder="Playlist Name"
    />
    <textarea
      v-model="playlistDescription"
      placeholder="Playlist Description"
    ></textarea>
    <div class="track-list">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="track-item"
      >
        <img
          :src="track.album.images[0]?.url"
          :alt="track.name"
          class="track-image"
        />
        <div class="track-info">
          <h3>{{ track.name }}</h3>
          <p>{{ getArtistNames(track) }}</p>
        </div>
        <button @click="removeTrack(track.id)">Remove</button>
      </div>
    </div>
    <button @click="savePlaylist">{{ isEditing ? 'Save Changes' : 'Create Playlist' }}</button>
  </div>
</template>

<script setup>
const props = defineProps({
  playlist: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      tracks: [],
    }),
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save']);

const playlistName = ref(props.playlist.name);
const playlistDescription = ref(props.playlist.description);
const tracks = ref([...props.playlist.tracks]);

const removeTrack = (trackId) => {
  tracks.value = tracks.value.filter((track) => track.id !== trackId);
};

const savePlaylist = () => {
  const updatedPlaylist = {
    name: playlistName.value,
    description: playlistDescription.value,
    tracks: tracks.value,
  };
  emit('save', updatedPlaylist);
};

const getArtistNames = (track) => {
  return track.artists.map((artist) => artist.name).join(', ');
};
</script>

<style scoped>
.playlist-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input,
textarea {
  width: 100%;
  max-width: 600px;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.track-list {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.track-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.track-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 20px;
}

.track-info {
  flex-grow: 1;
}

.track-info h3 {
  margin: 0;
  font-size: 16px;
}

.track-info p {
  margin: 0;
  color: #666;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #ddd;
}
</style>
