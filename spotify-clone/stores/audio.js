import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audio: null,
    currentTrack: null,
    isPlaying: false,
    volume: 1,
    progress: 0,
    currentPlaylist: null,
    currentPlaylistIndex: 0,
    image: null
  }),

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['currentTrack', 'volume', 'progress', 'currentPlaylist', 'currentPlaylistIndex', 'image']
  },

  actions: {
    initAudio() {
      if (!this.audio) {
        this.audio = new Audio()
        this.audio.volume = this.volume

        // Add event listeners
        this.audio.addEventListener('timeupdate', this.updateProgress)
        this.audio.addEventListener('ended', this.handleTrackEnd)

        // If there was a track playing before refresh, reload it
        if (this.currentTrack?.preview_url) {
          this.audio.src = this.currentTrack.preview_url
          // Set the current time based on the stored progress percentage
          if (this.progress > 0) {
            // We need to wait for the metadata to load to get the duration
            this.audio.addEventListener('loadedmetadata', () => {
              if (!isNaN(this.audio.duration)) {
                this.audio.currentTime = (this.progress / 100) * this.audio.duration
              }
            })
          }
        }
      }
    },

    async playTrack(track) {
      if (!track?.preview_url) {
        console.error('No preview URL available for this track')
        return
      }

      this.initAudio()
      if (track.album) {
        this.setImage(track.album.images[0].url)
      }
      

      // If it's a different track, load and play it
      if (!this.currentTrack || this.currentTrack.id !== track.id) {
        this.currentTrack = track
        this.audio.src = track.preview_url
        this.progress = 0
      }

      try {
        await this.audio.play()
        this.isPlaying = true
      } catch (error) {
        console.error('Error playing track:', error)
      }
    },

    pauseTrack() {
      if (this.audio && this.isPlaying) {
        this.audio.pause()
        this.isPlaying = false
      }
    },

    togglePlay() {
      if (this.isPlaying) {
        this.pauseTrack()
      } else if (this.currentTrack) {
        this.playTrack(this.currentTrack)
      }
    },

    updateProgress() {
      if (this.audio && !isNaN(this.audio.duration)) {
        this.progress = (this.audio.currentTime / this.audio.duration) * 100
      }
    },

    handleTrackEnd() {
      this.isPlaying = false
      this.progress = 0

      // If we're playing a playlist, move to next track
      if (this.currentPlaylist) {
        this.playNextTrack()
      }
    },

    setVolume(value) {
      this.volume = value
      if (this.audio) {
        this.audio.volume = value
      }
    },

    setImage(url) {
        this.image = url
    },

    async playPlaylist(playlist, startIndex = 0) {
      if (!playlist?.tracks?.items?.length) return

      this.currentPlaylist = playlist
      this.currentPlaylistIndex = startIndex

      // Get the track at current index
      const trackItem = playlist.tracks.items[startIndex]
      const track = trackItem.track || trackItem // Handle both full tracks and track references

      await this.playTrack(track)
    },

    playNextTrack() {
      if (!this.currentPlaylist?.tracks?.items?.length) return

      // Increment index, wrapping around to 0 if at end
      this.currentPlaylistIndex = (this.currentPlaylistIndex + 1) % this.currentPlaylist.tracks.items.length
      
      // Get the next track
      const trackItem = this.currentPlaylist.tracks.items[this.currentPlaylistIndex]
      const track = trackItem.track || trackItem

      this.playTrack(track)
    },

    playPreviousTrack() {
      if (!this.currentPlaylist?.tracks?.items?.length) return

      // Decrement index, wrapping around to end if at 0
      this.currentPlaylistIndex = this.currentPlaylistIndex === 0 
        ? this.currentPlaylist.tracks.items.length - 1 
        : this.currentPlaylistIndex - 1

      // Get the previous track
      const trackItem = this.currentPlaylist.tracks.items[this.currentPlaylistIndex]
      const track = trackItem.track || trackItem

      this.playTrack(track)
    }
  }
})