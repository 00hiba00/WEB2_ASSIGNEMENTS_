export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', 'pinia-plugin-persistedstate/nuxt'],
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  vite: {
    server: {
      hmr: {
        // Force HMR to use the same host/port as Nuxt
        protocol: 'ws',
        host: '127.0.0.1',
        port: 3000,
      },
    },
  },
  runtimeConfig: {
    public: {
      spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET, 
      spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
      spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI
    }
  }
})
