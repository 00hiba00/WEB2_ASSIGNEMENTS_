<template>
  <div>Processing login...</div>
</template>

<script setup>
const route = useRoute()
const auth = useAuth()

onMounted(async () => {
  try {
    const code = route.query.code
    if (code) {
      await auth.handleCallback(code)
      navigateTo('/')
    }
  } catch (error) {
    console.error('Error during callback:', error)
    navigateTo('/login')
  }
})
</script>